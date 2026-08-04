import { defineStore } from 'pinia'
import type { IOrder } from '~/types'
import { orderContentKey, uniqueOrdersByContent } from '~/utils/orderDedupe'
import { loadOrderFilterKeywords, orderMatchesRegionFilter } from '~/utils/orderFilterKeywords'

export interface FetchOrdersParams {
    page?: number
    limit?: number
    status?: string
    ownerId?: string
    search?: string
    text?: string
    /** mine = a'zo guruhlar; others = a'zo bo'lmagan; all = ikkalasi */
    scope?: 'all' | 'mine' | 'others'
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
    /** Meniki / Boshqalar — yangi buyurtmalar (tab + tabbar badge) */
    const scopeNewCounts = ref({ mine: 0, others: 0 })
    /** Orders scroll — chatdan qaytganda tiklash */
    const ordersListScrollY = ref(0)
    /** Oxirgi fetchOrders search (server filtri) — cache mosligini tekshirish */
    const listSearch = ref('')
    /** Oxirgi fetchOrders scope */
    const listScope = ref<'all' | 'mine' | 'others'>('all')
    /** A'zo guruh IDlari — socket order:new filtri */
    const memberGroupIds = ref<Set<string>>(new Set())

    const normalizeGroupId = (id: string) => String(id || '').replace(/[^\d]/g, '')

    const isMemberGroup = (groupId?: string | null) => {
        const raw = String(groupId || '').trim()
        if (!raw || !memberGroupIds.value.size) return false
        if (memberGroupIds.value.has(raw)) return true
        const digits = normalizeGroupId(raw)
        return !!digits && memberGroupIds.value.has(digits)
    }

    const refreshMemberGroupIds = async () => {
        try {
            const res = await useApi('/groups/mine/ids', { timeout: 120_000 })
            if (!res.success) return
            const ids = Array.isArray(res.data?.ids) ? res.data.ids : []
            const next = new Set<string>()
            for (const id of ids) {
                const s = String(id || '').trim()
                if (!s) continue
                next.add(s)
                const digits = normalizeGroupId(s)
                if (digits) next.add(digits)
            }
            memberGroupIds.value = next
        } catch {
            /* socket filtri ixtiyoriy — server sync asosiy */
        }
    }

    const rememberListFilter = (params: FetchOrdersParams) => {
        listSearch.value = String(params.search || '').trim()
        if (params.scope === 'all' || params.scope === 'mine' || params.scope === 'others') {
            listScope.value = params.scope
        }
    }

    const applyListFilter = (params: FetchOrdersParams) => {
        rememberListFilter(params)
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
            sessionStorage.setItem(
                SEEN_STORAGE_KEY,
                JSON.stringify(Object.keys(seenOrderIds.value)),
            )
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
    const decScopeCountForOrder = (order: IOrder) => {
        if ((order.status || 'new') !== 'new') return
        if (!isWithinUnreadWindow(order)) return
        if (isMemberGroup(order.group?.groupId)) {
            scopeNewCounts.value = {
                ...scopeNewCounts.value,
                mine: Math.max(0, scopeNewCounts.value.mine - 1),
            }
        } else {
            scopeNewCounts.value = {
                ...scopeNewCounts.value,
                others: Math.max(0, scopeNewCounts.value.others - 1),
            }
        }
    }

    const markOrderSeen = (orderId?: string | null) => {
        const id = orderId ? String(orderId) : ''
        if (!id || seenOrderIds.value[id]) return
        const order = orders.value.find((o) => String(o._id) === id)
        seenOrderIds.value = { ...seenOrderIds.value, [id]: true }
        if (recentArrivals.value[id]) {
            const next = { ...recentArrivals.value }
            delete next[id]
            recentArrivals.value = next
        }
        if (order) decScopeCountForOrder(order)
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
            const order = orders.value.find((o) => String(o._id) === id)
            if (order) decScopeCountForOrder(order)
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

    /** Pastki tabbar — Meniki + Boshqalar yangi buyurtmalar */
    const ordersTabBadge = computed(
        () => scopeNewCounts.value.mine + scopeNewCounts.value.others,
    )

    const refreshScopeCounts = async (search?: string) => {
        const s =
            search !== undefined
                ? String(search || '').trim() || undefined
                : loadOrderFilterKeywords().trim() || undefined
        try {
            const [mineRes, othersRes] = await Promise.all([
                useApi('/orders', {
                    method: 'GET',
                    params: {
                        status: 'new',
                        page: 1,
                        limit: 1,
                        scope: 'mine',
                        search: s,
                        sinceHours: 1,
                    },
                }),
                useApi('/orders', {
                    method: 'GET',
                    params: {
                        status: 'new',
                        page: 1,
                        limit: 1,
                        scope: 'others',
                        search: s,
                        sinceHours: 1,
                    },
                }),
            ])
            scopeNewCounts.value = {
                mine: mineRes.success ? Number(mineRes.data?.pagination?.total ?? 0) : 0,
                others: othersRes.success ? Number(othersRes.data?.pagination?.total ?? 0) : 0,
            }
        } catch {
            /* badge ixtiyoriy */
        }
    }

    /** Server 1 soat count dan ro'yxatdagi ko'rilganlarni ayirish */
    const reconcileScopeCountsAfterLoad = () => {
        for (const o of orders.value) {
            const id = o?._id ? String(o._id) : ''
            if (!id || !seenOrderIds.value[id]) continue
            decScopeCountForOrder(o)
        }
    }

    const bumpScopeNewCount = (scope: 'mine' | 'others', delta = 1) => {
        scopeNewCounts.value = {
            ...scopeNewCounts.value,
            [scope]: Math.max(0, scopeNewCounts.value[scope] + delta),
        }
    }

    const scopeForOrder = (order: IOrder): 'mine' | 'others' =>
        isMemberGroup(order?.group?.groupId) ? 'mine' : 'others'

    const startRecentMinuteTicker = () => {
        if (!import.meta.client || recentTicker) return
        loadSeenFromStorage()
        pruneRecentArrivals()
        recentTicker = setInterval(() => {
            pruneRecentArrivals()
            recentTick.value += 1
        }, 60_000)
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
                    scope: listScope.value,
                    search: listSearch.value || undefined,
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

    /** Socket order:update — band qilish / bot «Shofyor topildi» */
    const applyOrderUpdate = (order: IOrder) => {
        if (!order?._id) return
        const idx = orders.value.findIndex((o) => String(o._id) === String(order._id))
        const prev = idx !== -1 ? orders.value[idx] : null
        if (idx !== -1) {
            orders.value[idx] = { ...orders.value[idx], ...order } as IOrder
        } else {
            orders.value = [order, ...orders.value]
            total.value = (total.value || 0) + 1
        }
        if (prev?.status === 'new' && order.status === 'booked') {
            bumpNewCount(-1)
            bumpScopeNewCount(scopeForOrder(prev), -1)
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
                bumpScopeNewCount(scopeForOrder(prev), -1)
            }
        }
    }

    /** Socket order:new — race-safe prepend */
    const prependOrder = (order: IOrder) => {
        if (!order) return false
        const search = listSearch.value.trim()
        if (search && !orderMatchesRegionFilter(order, search)) return false
        const incomingKey = orderContentKey(order)
        const list = orders.value
        const isDup = list.some((o) => {
            if (o._id && order._id && String(o._id) === String(order._id)) return true
            const existingKey = orderContentKey(o)
            return !!incomingKey && !!existingKey && incomingKey === existingKey
        })
        if (isDup) return false
        orders.value = [order, ...list]
        total.value = (total.value || 0) + 1
        if ((order.status || 'new') === 'new') bumpNewCount(1)
        noteRecentOrder(order)
        return true
    }

    /**
     * Socket reconnect / visibility / poll catch-up.
     * page===1: server ro'yxati bilan almashtiradi.
     * page>1: yangilarini boshiga qo'shadi (scroll saqlanadi).
     */
    const syncLatest = async (params: FetchOrdersParams = {}) => {
        try {
            const incomingScope = params.scope ?? 'all'
            if (incomingScope !== listScope.value) {
                return null
            }
            const response = await useApi('/orders', {
                method: 'GET',
                params: { ...params, limit: params.limit ?? 40, page: 1 },
            })
            if (!response.success) return response
            let list: IOrder[] = uniqueOrdersByContent(response.data.orders ?? [])
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
                }
            }
            // Catch-up: faqat oxirgi 1 daqiqada yaratilgan yangilar
            noteRecentOrdersFromList(list.filter((o) => o._id && !prevIds.has(String(o._id))))
            total.value = response.data.pagination?.total ?? total.value
            void refreshNewCount()
            void refreshScopeCounts(params.search)
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
                let list: IOrder[] = uniqueOrdersByContent(response.data.orders ?? [])
                if (opts.append) {
                    const merged = uniqueOrdersByContent([...orders.value, ...list])
                    orders.value = merged
                } else {
                    orders.value = list
                    rememberListFilter(params)
                    // Birinchi yuklash: oxirgi 1 daqiqadagi buyurtmalar badge
                    noteRecentOrdersFromList(list)
                }
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
                    if (prev?.status === 'new') {
                        bumpScopeNewCount(scopeForOrder(prev), -1)
                    }
                }
            }
            void refreshScopeCounts()
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
        void refreshScopeCounts()
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
                bumpScopeNewCount(scopeForOrder(prev), -1)
            }
        }
        void refreshScopeCounts()
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
            void refreshScopeCounts()
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
            void refreshScopeCounts()
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

    return {
        orders,
        currentOrder,
        isLoading,
        isLoadingMore,
        total,
        page,
        totalPages,
        newOrdersCount,
        scopeNewCounts,
        ordersTabBadge,
        ordersListScrollY,
        listSearch,
        listScope,
        applyListFilter,
        memberGroupIds,
        isMemberGroup,
        refreshMemberGroupIds,
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
        refreshScopeCounts,
        reconcileScopeCountsAfterLoad,
        bumpScopeNewCount,
        bumpNewCount,
        noteRecentOrder,
        markOrderSeen,
        markOrdersSeen,
        isOrderSeen,
        isOrderUnread,
        unreadOrdersCount,
        markAllOrdersAsRead,
        startRecentMinuteTicker,
    }
})
