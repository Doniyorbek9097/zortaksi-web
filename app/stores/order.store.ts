import { defineStore } from 'pinia'
import type { IOrder } from '~/types'
import { orderContentKey, uniqueOrdersByContent } from '~/utils/orderDedupe'
import { loadOrderFilterKeywords, loadOrderFilterBotGroupId, orderMatchesRegionFilter, filterOrdersByKeywords, ORDERS_PAGE_LIMIT } from '~/utils/orderFilterKeywords'
import { TAB_LIST_KEEP, MAX_ORDERS_IN_MEMORY, MAX_SEEN_ORDER_IDS } from '~/utils/memoryBudget'

export interface FetchOrdersParams {
    page?: number
    limit?: number
    status?: string
    ownerId?: string
    search?: string
    botGroupId?: string
    text?: string
    scope?: 'mine'
    sinceHours?: number
}

export const useOrderStore = defineStore('order', () => {
    const orders = ref<IOrder[]>([])
    const currentOrder = ref<IOrder | null>(null)
    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const total = ref(0)
    const page = ref(1)
    const totalPages = ref(1)
    /** Tab badge — status=new buyurtmalar soni */
    const newOrdersCount = ref(0)
    /** Orders scroll — chatdan qaytganda tiklash */
    const ordersListScrollY = ref(0)
    /** Oxirgi fetchOrders search (server filtri) — cache mosligini tekshirish */
    const listSearch = ref('')
    /** Yo'nalish — bot guruh ID (kalit so'zlar serverda) */
    const listBotGroupId = ref('')
    /** Buyurtma matni qidiruvi */
    const listText = ref('')
    /** Barchasi / Menki tab */
    const listScope = ref<'all' | 'mine'>('all')
    /** Filtr/tab almashganda eski HTTP javoblarini rad etish */
    let listFetchSeq = 0

    const rememberListFilter = (params: FetchOrdersParams) => {
        listBotGroupId.value = String(params.botGroupId || '').trim()
        listSearch.value = listBotGroupId.value ? '' : String(params.search || '').trim()
        listText.value = String(params.text || '').trim()
        listScope.value = 'all'
    }

    const hasActiveListFilter = () =>
        !!listBotGroupId.value.trim() || !!listSearch.value.trim()

    let syncLatestTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleSyncLatest = (params: FetchOrdersParams = {}) => {
        if (!import.meta.client) return
        if (syncLatestTimer) clearTimeout(syncLatestTimer)
        syncLatestTimer = setTimeout(() => {
            syncLatestTimer = null
            void syncLatest(params)
        }, 1200)
    }

    /** Sender connect tezligi — order ro'yxatida oldindan warm */
    let warmPeersTimer: ReturnType<typeof setTimeout> | null = null
    const WARM_PEER_MAX = 4
    const warmedOrderIds = new Set<string>()

    const orderNeedsWarm = (order: IOrder, driverId: string) => {
        if (!order?._id || order.sender?.isBot) return false
        const id = String(order._id)
        if (warmedOrderIds.has(id)) return false
        const hashes = order.sender?.accessHashes || []
        return !hashes.some(
            (h) => String(h.ownerId) === driverId && String(h.accessHash || '').trim(),
        )
    }

    const pickOrdersToWarm = (list: IOrder[], driverId: string) => {
        const ids: string[] = []
        for (const o of list) {
            if (!orderNeedsWarm(o, driverId)) continue
            ids.push(String(o._id))
            if (ids.length >= WARM_PEER_MAX) break
        }
        return ids
    }

    const postWarmPeers = async (orderIds: string[]) => {
        if (!import.meta.client || !orderIds.length) return
        try {
            await useApi('/orders/warm-peers', { method: 'POST', body: { orderIds } })
            for (const id of orderIds) warmedOrderIds.add(id)
        } catch {
            /* fon — xato ko'rsatilmaydi */
        }
    }

    const scheduleWarmOrderPeers = (list: IOrder[]) => {
        if (!import.meta.client) return
        const authStore = useAuthStore()
        const driverId = String(authStore.user?.userId || '')
        if (!driverId) return

        const ids = pickOrdersToWarm(list, driverId)
        if (!ids.length) return

        if (warmPeersTimer) clearTimeout(warmPeersTimer)
        warmPeersTimer = setTimeout(() => {
            warmPeersTimer = null
            void postWarmPeers(ids)
        }, 1500)
    }

    /** Bitta order — "Xabar yozish" hover */
    const warmOrderPeer = (orderId: string) => {
        if (!import.meta.client) return
        const authStore = useAuthStore()
        const driverId = String(authStore.user?.userId || '')
        if (!driverId) return
        const id = String(orderId)
        if (warmedOrderIds.has(id)) return
        const order = orders.value.find((o) => String(o._id) === id)
        if (order && !orderNeedsWarm(order, driverId)) {
            warmedOrderIds.add(id)
            return
        }
        void postWarmPeers([id])
    }

    const applyListFilter = (params: FetchOrdersParams) => {
        rememberListFilter(params)
    }

    const paramsMatchListFilter = (params: FetchOrdersParams) => {
        const wantScope = params.scope === 'mine' ? 'mine' : 'all'
        if (wantScope !== listScope.value) return false
        const wantBot = String(params.botGroupId || '').trim()
        const wantSearch = wantBot ? '' : String(params.search || '').trim()
        if (wantBot !== listBotGroupId.value.trim()) return false
        if (wantSearch !== listSearch.value.trim()) return false
        if (String(params.text || '').trim() !== listText.value.trim()) return false
        return true
    }

    /** Tab/filtr o'zgarganda ro'yxat va pagination tozalash */
    const resetListForFilterChange = () => {
        listFetchSeq += 1
        if (syncLatestTimer) {
            clearTimeout(syncLatestTimer)
            syncLatestTimer = null
        }
        orders.value = []
        total.value = 0
        page.value = 1
        totalPages.value = 1
        ordersListScrollY.value = 0
        isLoadingMore.value = false
        if (import.meta.client) {
            window.scrollTo(0, 0)
        }
    }

    /** Oxirgi 1 daqiqada kelgan buyurtmalar (tabbar badge) — id → kelgan vaqt */
    const recentArrivals = ref<Record<string, number>>({})
    /** Ko'rilgan (badge dan chiqarilgan) buyurtmalar — session */
    const seenOrderIds = ref<Record<string, true>>({})
    const recentTick = ref(0)
    let recentTicker: ReturnType<typeof setInterval> | null = null

    const RECENT_WINDOW_MS = 60_000
    /** O'qilmagan — buyurtma vaqti bo'yicha oxirgi 1 soat */
    const UNREAD_WINDOW_MS = 60 * 60 * 1000
    const SEEN_STORAGE_KEY = 'zortaksi:seen-order-ids'

    /** Infinite scroll — xotirada saqlanadigan buyurtmalar (memoryBudget) */
    const trimOrdersInMemory = () => {
        if (orders.value.length <= MAX_ORDERS_IN_MEMORY) return
        orders.value = orders.value.slice(0, MAX_ORDERS_IN_MEMORY)
    }

    /** Navigatsiya (order→chat) — yumshoq qisqartirish */
    const trimListForNavigation = (keep = TAB_LIST_KEEP) => {
        const n = Math.max(1, keep)
        if (orders.value.length > n) {
            orders.value = orders.value.slice(0, n)
        }
    }

    /** Boshqa tabga o'tganda — birinchi N ta saqlanadi, qolgani RAM dan chiqariladi */
    const trimListForTabSwitch = (keep = TAB_LIST_KEEP) => {
        trimListForNavigation(keep)
        page.value = 1
        isLoading.value = false
        isLoadingMore.value = false
        const approxRow = 140
        if (ordersListScrollY.value > keep * approxRow) {
            ordersListScrollY.value = 0
        }
    }

    const pruneSeenIds = () => {
        const keys = Object.keys(seenOrderIds.value)
        if (keys.length <= MAX_SEEN_ORDER_IDS) return
        const keep = keys.slice(keys.length - MAX_SEEN_ORDER_IDS)
        const next: Record<string, true> = {}
        for (const id of keep) next[id] = true
        seenOrderIds.value = next
        persistSeen()
    }

    const orderCreatedAtMs = (order: IOrder) => {
        const t = order?.createdAt ? new Date(order.createdAt).getTime() : NaN
        return Number.isFinite(t) ? t : 0
    }

    const isWithinUnreadWindow = (order: IOrder) => {
        void recentTick.value
        const t = orderCreatedAtMs(order)
        if (!t) return false
        return Date.now() - t <= UNREAD_WINDOW_MS
    }

    const loadSeenFromStorage = () => {
        if (!import.meta.client) return
        try {
            const raw = sessionStorage.getItem(SEEN_STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as string[]
            if (!Array.isArray(parsed)) return
            const next: Record<string, true> = { ...seenOrderIds.value }
            for (const id of parsed) {
                if (id) next[String(id)] = true
            }
            seenOrderIds.value = next
        } catch { /* ignore */ }
    }

    const persistSeen = () => {
        if (!import.meta.client) return
        try {
            const keys = Object.keys(seenOrderIds.value)
            const slim =
                keys.length > MAX_SEEN_ORDER_IDS
                    ? keys.slice(keys.length - MAX_SEEN_ORDER_IDS)
                    : keys
            sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(slim))
        } catch { /* ignore */ }
    }

    const pruneRecentArrivals = () => {
        const cutoff = Date.now() - RECENT_WINDOW_MS
        const prev = recentArrivals.value
        const next: Record<string, number> = {}
        let changed = false
        for (const [id, at] of Object.entries(prev)) {
            if (at >= cutoff) next[id] = at
            else changed = true
        }
        if (changed) recentArrivals.value = next
        recentTick.value += 1
    }

    const noteRecentOrder = (order: IOrder, at = Date.now()) => {
        const id = order?._id ? String(order._id) : ''
        if (!id) return
        if (seenOrderIds.value[id]) return
        if (recentArrivals.value[id]) return
        recentArrivals.value = { ...recentArrivals.value, [id]: at }
        recentTick.value += 1
    }

    /** Catch-up: createdAt oxirgi 1 daqiqada bo'lgan yangi idlar */
    const noteRecentOrdersFromList = (list: IOrder[]) => {
        const cutoff = Date.now() - RECENT_WINDOW_MS
        const next = { ...recentArrivals.value }
        let changed = false
        for (const o of list) {
            if (!o?._id) continue
            const id = String(o._id)
            if (next[id] || seenOrderIds.value[id]) continue
            const t = o.createdAt ? new Date(o.createdAt).getTime() : NaN
            if (!Number.isFinite(t) || t < cutoff) continue
            next[id] = t
            changed = true
        }
        if (changed) {
            recentArrivals.value = next
            recentTick.value += 1
        }
    }

    /** Buyurtma ko'rildi — badge dan chiqarish */
    const markOrderSeen = (orderId?: string | null) => {
        const id = orderId ? String(orderId) : ''
        if (!id || seenOrderIds.value[id]) return
        seenOrderIds.value = { ...seenOrderIds.value, [id]: true }
        if (recentArrivals.value[id]) {
            const next = { ...recentArrivals.value }
            delete next[id]
            recentArrivals.value = next
        }
        recentTick.value += 1
        persistSeen()
    }

    const markOrdersSeen = (ids: Array<string | undefined | null>) => {
        let changed = false
        const seenNext = { ...seenOrderIds.value }
        const recentNext = { ...recentArrivals.value }
        for (const raw of ids) {
            const id = raw ? String(raw) : ''
            if (!id || seenNext[id]) continue
            seenNext[id] = true
            if (recentNext[id]) delete recentNext[id]
            changed = true
        }
        if (!changed) return
        seenOrderIds.value = seenNext
        recentArrivals.value = recentNext
        recentTick.value += 1
        persistSeen()
    }

    const isOrderSeen = (orderId?: string | null) => {
        void recentTick.value
        const id = orderId ? String(orderId) : ''
        return !!id && !!seenOrderIds.value[id]
    }

    /** O'qilmagan = oxirgi 1 soat ichida va hali ko'rilmagan */
    const isOrderUnread = (order: IOrder) => {
        void recentTick.value
        if (!order?._id) return false
        if (!isWithinUnreadWindow(order)) return false
        return !seenOrderIds.value[String(order._id)]
    }

    const unreadOrdersCount = computed(() => {
        void recentTick.value
        let n = 0
        for (const o of orders.value) {
            if (isOrderUnread(o)) n += 1
        }
        return n
    })

    /** Joriy ro'yxatdagi o'qilmagan (1 soat ichidagi) buyurtmalarni belgilash */
    const markAllOrdersAsRead = () => {
        const toMark: string[] = []
        for (const o of orders.value) {
            if (!isOrderUnread(o) || !o._id) continue
            toMark.push(String(o._id))
        }
        if (!toMark.length) return 0
        markOrdersSeen(toMark)
        return toMark.length
    }

    /** Badge = oxirgi 1 daqiqada kelgan va hali ko'rilmagan */
    const recentMinuteCount = computed(() => {
        void recentTick.value
        const cutoff = Date.now() - RECENT_WINDOW_MS
        let n = 0
        for (const [id, t] of Object.entries(recentArrivals.value)) {
            if (t >= cutoff && !seenOrderIds.value[id]) n += 1
        }
        return n
    })

    const startRecentMinuteTicker = () => {
        if (!import.meta.client || recentTicker) return
        loadSeenFromStorage()
        pruneRecentArrivals()
        pruneSeenIds()
        recentTicker = setInterval(() => {
            pruneRecentArrivals()
            pruneSeenIds()
            recentTick.value += 1
        }, 60_000)
    }

    const stopRecentMinuteTicker = () => {
        if (recentTicker) {
            clearInterval(recentTicker)
            recentTicker = null
        }
    }

    const hasMore = computed(() => page.value < totalPages.value)

    const refreshNewCount = async () => {
        try {
            const response = await useApi('/orders', {
                method: 'GET',
                params: {
                    status: 'new',
                    page: 1,
                    limit: 1,
                    ...(listBotGroupId.value
                        ? { botGroupId: listBotGroupId.value }
                        : { search: listSearch.value || undefined }),
                    ...(listScope.value === 'mine' ? { scope: 'mine' } : {}),
                },
            })
            if (response.success) {
                newOrdersCount.value = Number(response.data.pagination?.total ?? 0)
            }
        } catch {
            /* badge uchun jim */
        }
    }

    const bumpNewCount = (delta = 1) => {
        newOrdersCount.value = Math.max(0, newOrdersCount.value + delta)
    }

    /** Socket order:update — faqat ro'yxatdagi buyurtmani yangilash (yangi insert yo'q) */
    const applyOrderUpdate = (order: IOrder) => {
        if (!order?._id) return
        const idx = orders.value.findIndex((o) => String(o._id) === String(order._id))
        if (idx === -1) return
        const prev = orders.value[idx]
        orders.value[idx] = { ...orders.value[idx], ...order } as IOrder
        if (prev?.status === 'new' && order.status === 'booked') {
            bumpNewCount(-1)
        }
    }

    /** Socket order:cancelled — bot bekor qildi */
    const removeOrderById = (orderId: string) => {
        const id = String(orderId || '')
        if (!id) return
        const prev = orders.value.find((o) => String(o._id) === id)
        orders.value = orders.value.filter((o) => String(o._id) !== id)
        if (prev) {
            total.value = Math.max(0, total.value - 1)
            if (prev.status === 'new') {
                bumpNewCount(-1)
            }
        }
    }

    /** Socket order:new — race-safe prepend */
    const prependOrder = (order: IOrder) => {
        if (!order) return false
        if (listScope.value === 'mine') return false
        if (listBotGroupId.value.trim()) {
            // Bot guruh — server kalit so'zlari to'liq; client qo'shimcha kesmaydi
        } else {
            const kw = loadOrderFilterKeywords().trim()
            if (hasActiveListFilter() && kw && !orderMatchesRegionFilter(order, kw)) return false
        }
        const incomingKey = orderContentKey(order)
        const list = orders.value
        const isDup = list.some((o) => {
            if (o._id && order._id && String(o._id) === String(order._id)) return true
            const existingKey = orderContentKey(o)
            return !!incomingKey && !!existingKey && incomingKey === existingKey
        })
        if (isDup) return false
        orders.value = [order, ...list]
        trimOrdersInMemory()
        total.value = (total.value || 0) + 1
        if ((order.status || 'new') === 'new') bumpNewCount(1)
        noteRecentOrder(order)
        scheduleWarmOrderPeers([order])
        return true
    }

    /**
     * Socket reconnect / visibility / poll catch-up.
     * page===1: server ro'yxati bilan almashtiradi.
     * page>1: yangilarini boshiga qo'shadi (scroll saqlanadi).
     */
    const syncLatest = async (params: FetchOrdersParams = {}) => {
        if (!paramsMatchListFilter(params)) return null
        try {
            const response = await useApi('/orders', {
                method: 'GET',
                params: { ...params, limit: params.limit ?? ORDERS_PAGE_LIMIT, page: 1 },
            })
            if (!response.success) return response
            if (!paramsMatchListFilter(params)) return response
            let list: IOrder[] = uniqueOrdersByContent(response.data.orders ?? [])
            const hasServerFilter = Boolean(params.search || params.botGroupId)
            const useBotGroup = Boolean(String(params.botGroupId || listBotGroupId.value || '').trim())
            const clientKw = hasServerFilter && !useBotGroup ? loadOrderFilterKeywords().trim() : ''
            if (clientKw) {
                list = filterOrdersByKeywords(list, clientKw)
            }
            const prevIds = new Set(orders.value.map((o) => String(o._id)))
            if (page.value <= 1) {
                orders.value = list
                page.value = 1
                totalPages.value = response.data.pagination?.totalPages ?? 1
                rememberListFilter(params)
            } else {
                const fresh = list.filter((o) => o._id && !prevIds.has(String(o._id)))
                if (fresh.length) {
                    orders.value = uniqueOrdersByContent([...fresh, ...orders.value])
                    trimOrdersInMemory()
                }
            }
            // Catch-up: faqat oxirgi 1 daqiqada yaratilgan yangilar
            noteRecentOrdersFromList(list.filter((o) => o._id && !prevIds.has(String(o._id))))
            scheduleWarmOrderPeers(orders.value)
            total.value = response.data.pagination?.total ?? total.value
            void refreshNewCount()
            return response
        } catch (error) {
            console.warn('syncLatest error:', error)
            return null
        }
    }

    const fetchOrders = async (
        params: FetchOrdersParams = {},
        opts: { append?: boolean } = {}
    ) => {
        const isFreshLoad = !opts.append
        const reqSeq = isFreshLoad ? listFetchSeq : -1
        try {
            if (opts.append) isLoadingMore.value = true
            else {
                isLoading.value = true
                rememberListFilter(params)
            }

            const response = await useApi('/orders', {
                method: 'GET',
                params,
            })
            if (response.success) {
                if (isFreshLoad && reqSeq !== listFetchSeq) return response
                if (isFreshLoad && !paramsMatchListFilter(params)) return response
                let list: IOrder[] = uniqueOrdersByContent(response.data.orders ?? [])
                const hasServerFilter = Boolean(params.search || params.botGroupId)
                const useBotGroup = Boolean(String(params.botGroupId || listBotGroupId.value || '').trim())
                const clientKw = hasServerFilter && !useBotGroup ? loadOrderFilterKeywords().trim() : ''
                if (clientKw) {
                    list = filterOrdersByKeywords(list, clientKw)
                }
                if (opts.append) {
                    if (!paramsMatchListFilter(params)) return response
                    const merged = uniqueOrdersByContent([...orders.value, ...list])
                    orders.value = merged
                    trimOrdersInMemory()
                } else {
                    orders.value = list
                    rememberListFilter(params)
                    // Birinchi yuklash: oxirgi 1 daqiqadagi buyurtmalar badge
                    noteRecentOrdersFromList(list)
                }
                scheduleWarmOrderPeers(orders.value)
                total.value = response.data.pagination?.total ?? orders.value.length
                page.value = response.data.pagination?.page ?? params.page ?? 1
                totalPages.value = response.data.pagination?.totalPages ?? 1
            }
            return response
        } catch (error) {
            console.error('FetchOrders error:', error)
            throw error
        } finally {
            isLoading.value = false
            isLoadingMore.value = false
        }
    }

    // Keyingi sahifani yuklab, mavjud ro'yxatga qo'shadi (infinite scroll)
    const loadMore = async (params: FetchOrdersParams = {}) => {
        if (isLoading.value || isLoadingMore.value || !hasMore.value) return
        if (orders.value.length >= MAX_ORDERS_IN_MEMORY) return
        return fetchOrders({ ...params, page: page.value + 1 }, { append: true })
    }

    const fetchOrderById = async (orderId: string) => {
        try {
            isLoading.value = true
            const response = await useApi(`/orders/${orderId}`)
            if (response.success) {
                currentOrder.value = response.data
                markOrderSeen(orderId)
            }
            return response
        } catch (error) {
            console.error('FetchOrderById error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const bookOrder = async (orderId: string) => {
        try {
            const response = await useApi(`/orders/${orderId}/book`, { method: 'POST' })
            if (response.success) {
                const prev = orders.value.find((o) => o._id === orderId)
                const idx = orders.value.findIndex((o) => o._id === orderId)
                if (idx !== -1 && response.data?.order) {
                    orders.value[idx] = { ...orders.value[idx], ...response.data.order }
                }
                if (prev?.status === 'new' || response.data?.order?.status === 'booked') {
                    bumpNewCount(-1)
                }
            }
            return response
        } catch (error: any) {
            // 402 va boshqa xatolarni caller ko'rsatadi
            throw error
        }
    }

    const unbookOrder = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/unbook`, { method: 'POST' })
        if (response.success) {
            const idx = orders.value.findIndex((o) => o._id === orderId)
            if (idx !== -1 && response.data?.order) {
                orders.value[idx] = { ...orders.value[idx], ...response.data.order }
            }
            if (response.data?.order?.status === 'new') bumpNewCount(1)
        }
        return response
    }

    const deleteOrder = async (orderId: string) => {
        const prev = orders.value.find((o) => o._id === orderId)
        const response = await useApi(`/orders/${orderId}`, { method: 'DELETE' })
        if (response.success) {
            orders.value = orders.value.filter((o) => o._id !== orderId)
            total.value = Math.max(0, total.value - 1)
            if (prev?.status === 'new') {
                bumpNewCount(-1)
            }
        }
        return response
    }

    const blockGroup = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/block-group`, { method: 'POST' })
        if (response.success) {
            const groupId = response.data?.groupId
            if (groupId) {
                orders.value = orders.value.filter((o) => o.group?.groupId !== groupId)
            } else {
                orders.value = orders.value.filter((o) => o._id !== orderId)
            }
        }
        return response
    }

    const blockSender = async (orderId: string) => {
        const response = await useApi(`/orders/${orderId}/block-sender`, { method: 'POST' })
        if (response.success) {
            const senderId = response.data?.senderId
            if (senderId) {
                orders.value = orders.value.filter((o) => o.sender?.userId !== senderId)
            } else {
                orders.value = orders.value.filter((o) => o._id !== orderId)
            }
        }
        return response
    }

    const patchInterest = (orderId: string, data: { interestCount?: number; interestedUsers?: any[] }) => {
        const idx = orders.value.findIndex((o) => o._id === orderId)
        if (idx === -1) return
        const count = Number(data.interestCount)
        orders.value[idx] = {
            ...orders.value[idx]!,
            interestCount: Number.isFinite(count) ? count : orders.value[idx]!.interestCount,
            interestedUsers: Array.isArray(data.interestedUsers)
                ? data.interestedUsers
                : orders.value[idx]!.interestedUsers,
        }
    }

    /** Xabar yozish / Telefon — qiziqish yozish */
    const markInterest = async (orderId: string) => {
        try {
            const response = await useApi(`/orders/${orderId}/interest`, { method: 'POST' })
            if (response.success && response.data) {
                patchInterest(orderId, response.data)
            }
            return response
        } catch (error) {
            console.warn('markInterest error:', error)
            return null
        }
    }

    /** Qiziqqanlar ro'yxatini yuklash */
    const fetchInterest = async (orderId: string) => {
        try {
            const response = await useApi(`/orders/${orderId}/interest`)
            if (response.success && response.data) {
                patchInterest(orderId, response.data)
            }
            return response
        } catch (error) {
            console.warn('fetchInterest error:', error)
            return null
        }
    }

    /** Tabbar boshqa tabga o'tganda — ro'yxat xotirasini bo'shatish (badge saqlanadi) */
    const releaseListMemory = () => {
        if (syncLatestTimer) {
            clearTimeout(syncLatestTimer)
            syncLatestTimer = null
        }
        orders.value = []
        currentOrder.value = null
        total.value = 0
        page.value = 1
        totalPages.value = 1
        ordersListScrollY.value = 0
        isLoading.value = false
        isLoadingMore.value = false
        pruneSeenIds()
    }

    return {
        orders,
        currentOrder,
        isLoading,
        isLoadingMore,
        total,
        page,
        totalPages,
        newOrdersCount,
        ordersListScrollY,
        listSearch,
        listBotGroupId,
        listText,
        listScope,
        applyListFilter,
        resetListForFilterChange,
        hasActiveListFilter,
        scheduleSyncLatest,
        recentMinuteCount,
        hasMore,
        fetchOrders,
        loadMore,
        syncLatest,
        prependOrder,
        applyOrderUpdate,
        removeOrderById,
        fetchOrderById,
        bookOrder,
        unbookOrder,
        deleteOrder,
        blockGroup,
        blockSender,
        markInterest,
        fetchInterest,
        refreshNewCount,
        bumpNewCount,
        noteRecentOrder,
        markOrderSeen,
        markOrdersSeen,
        isOrderSeen,
        isOrderUnread,
        unreadOrdersCount,
        markAllOrdersAsRead,
        startRecentMinuteTicker,
        stopRecentMinuteTicker,
        releaseListMemory,
        trimListForNavigation,
        trimListForTabSwitch,
        warmOrderPeer,
    }
})
