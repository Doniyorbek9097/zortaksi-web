import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { isPanelUser } from '~/utils/userRole'
import { LIST_PAGE_SIZE } from '~/utils/memoryBudget'

export type PostTab = 'mine' | 'ads'

export interface PostGroup {
  id: string
  title: string
  username?: string
  accessHash?: string
  membersCount?: number
  avatar?: string
  isAdmin: boolean
  viaUserbotId: string
  connections: number
  price: number
  free: boolean
  visibleToDrivers?: boolean
  joinUrl?: string
  isMember?: boolean
}

export const AD_PRICE = 2000
export const ADS_BROADCAST_PRICE = 500
/** Guruhlar ro'yxati — bir sahifada */
export const GROUPS_PAGE_SIZE = LIST_PAGE_SIZE

export type PostCampaign = {
  id: string
  name: string
  mode: PostTab
  groupIds: string[]
  text: string
  intervalSec: number
  intervalMin: number
  active: boolean
  nextRunAt?: string
  lastRunAt?: string
  lastSent?: number
  lastFailed?: number
  lastCharged?: number
  lastError?: string
}

/** @deprecated use PostCampaign */
export type PostSchedule = PostCampaign

export const usePostStore = defineStore('post', () => {
  const authStore = useAuthStore()

  const tab = ref<PostTab>('mine')
  const mineGroups = ref<PostGroup[]>([])
  const adsGroups = ref<PostGroup[]>([])
  const selected = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSending = ref(false)
  const isBlocking = ref(false)
  const joiningId = ref<string | null>(null)
  const error = ref('')
  const campaigns = ref<PostCampaign[]>([])
  const isCampaignsLoading = ref(false)
  const campaignBusyId = ref<string | null>(null)
  const schedule = computed(() => campaigns.value.find((c) => c.active) || null)
  const isScheduleLoading = ref(false)

  const minePage = ref(1)
  const adsPage = ref(1)
  const mineTotal = ref(0)
  const adsTotal = ref(0)
  const mineHasMore = ref(false)
  const adsHasMore = ref(false)
  /** Hudud kalit so'zlari — server `search` yoki `botGroupId` */
  const search = ref('')
  const botGroupId = ref('')
  /** Guruh nomi / username qidiruvi — server `q` */
  const query = ref('')

  const isAdmin = computed(() => isPanelUser(authStore.user))
  const balance = computed(() => authStore.user?.balance ?? 0)

  const groups = computed(() => (tab.value === 'mine' ? mineGroups.value : adsGroups.value))
  const totalGroups = computed(() => (tab.value === 'mine' ? mineTotal.value : adsTotal.value))
  const hasMore = computed(() => (tab.value === 'mine' ? mineHasMore.value : adsHasMore.value))
  const page = computed(() => (tab.value === 'mine' ? minePage.value : adsPage.value))

  const selectedList = computed(() => groups.value.filter(g => selected.value.has(g.id)))

  /** Meniki — bepul. Boshqalar — haydovchi uchun 500 so'm/guruh (muvaffaqiyatli yuborish) */
  const pricePerGroup = computed(() => {
    if (tab.value === 'mine') return 0
    if (isAdmin.value) return 0
    return ADS_BROADCAST_PRICE
  })

  const totalCost = computed(() => pricePerGroup.value * selected.value.size)

  /** Boshqalar: istalgan miqdorda belgilash; to'lov yuborishda muvaffaqiyatli har biri uchun */
  const maxSelectable = computed(() => Infinity)

  const searchParams = () => {
    const q = query.value.trim()
    if (!isAdmin.value) {
      return q ? { q } : {}
    }
    const gid = botGroupId.value.trim()
    const s = search.value.trim()
    return {
      ...(gid ? { botGroupId: gid } : s ? { search: s } : {}),
      ...(q ? { q } : {}),
    }
  }

  const applyPageResult = (
    mode: PostTab,
    groupsPage: PostGroup[],
    pagination: { total?: number; page?: number; hasMore?: boolean },
    append: boolean
  ) => {
    const total = Number(pagination?.total ?? groupsPage.length)
    const p = Number(pagination?.page ?? 1)
    const more = Boolean(pagination?.hasMore)

    if (mode === 'mine') {
      mineGroups.value = append ? [...mineGroups.value, ...groupsPage] : groupsPage
      mineTotal.value = total
      minePage.value = p
      mineHasMore.value = more
    } else {
      adsGroups.value = append ? [...adsGroups.value, ...groupsPage] : groupsPage
      adsTotal.value = total
      adsPage.value = p
      adsHasMore.value = more
    }
  }

  const fetchMine = async (opts: { page?: number; force?: boolean; append?: boolean } = {}) => {
    const pageNum = opts.page ?? 1
    const res = await useApi('/groups/mine', {
      params: {
        page: pageNum,
        limit: GROUPS_PAGE_SIZE,
        ...searchParams(),
        ...(opts.force ? { force: '1' } : {}),
      },
      timeout: 120_000,
    })
    if (res.success) {
      applyPageResult(
        'mine',
        res.data.groups ?? [],
        res.data.pagination ?? { total: res.data.count, page: pageNum, hasMore: false },
        Boolean(opts.append)
      )
    }
    return res
  }

  const fetchAds = async (opts: { page?: number; force?: boolean; append?: boolean } = {}) => {
    const pageNum = opts.page ?? 1
    const res = await useApi('/groups/ads', {
      params: {
        page: pageNum,
        limit: GROUPS_PAGE_SIZE,
        ...searchParams(),
        ...(opts.force ? { force: '1' } : {}),
      },
      timeout: isAdmin.value ? 180_000 : 60_000,
    })
    if (res.success) {
      applyPageResult(
        'ads',
        res.data.groups ?? [],
        res.data.pagination ?? { total: res.data.count, page: pageNum, hasMore: false },
        Boolean(opts.append)
      )
    }
    return res
  }

  const friendlyErr = (raw: string) => {
    if (/SESSION_LEASE_HELD|boshqa instance|AuthKeyDuplicated/i.test(raw)) {
      return "Telegram sessiyasi band. Birozdan keyin yangilang."
    }
    return raw || 'Guruhlar yuklanmadi'
  }

  const POST_TARIFF_PAYMENT_PATH = '/driver/payment?tab=tariff&next=/driver/post'

  const isPostTariffError = (e: any) => {
    const code = e?.response?.data?.code
    const msg = String(e?.response?.data?.message || '')
    return code === 'TARIFF_REQUIRED' || /faol tarif/i.test(msg)
  }

  const redirectToPostTariffPayment = () => {
    if (import.meta.client) navigateTo(POST_TARIFF_PAYMENT_PATH)
  }

  const handlePostActionError = (e: any, fallback: string) => {
    if (isPostTariffError(e)) {
      error.value = ''
      redirectToPostTariffPayment()
      return
    }
    error.value = e?.response?.data?.message || fallback
  }

  /** Birinchi sahifa — Meniki darhol; Reklama fonda */
  const load = async (force = false) => {
    selected.value = new Set()
    try {
      isLoading.value = true
      error.value = ''
      const mineRes = await fetchMine({ page: 1, force, append: false })
      if (mineRes?.data?.warning) error.value = String(mineRes.data.warning)
    } catch (e: any) {
      error.value = friendlyErr(e?.response?.data?.message || '')
    } finally {
      isLoading.value = false
    }
    fetchAds({ page: 1, force, append: false }).catch(() => {})
  }

  /** Hudud filtri o'zgarganda — serverdan qayta */
  const setSearch = async (value: string, groupId = '') => {
    const kw = String(value || '').trim()
    const gid = kw ? String(groupId || '').trim() : ''
    search.value = kw
    botGroupId.value = gid
    await load(false)
  }

  /** Guruh qidiruvi — serverdan qayta */
  const setQuery = async (value: string) => {
    query.value = String(value || '').trim()
    selected.value = new Set()
    try {
      isLoading.value = true
      error.value = ''
      if (tab.value === 'ads') await fetchAds({ page: 1, append: false })
      else await fetchMine({ page: 1, append: false })
    } catch (e: any) {
      error.value = friendlyErr(e?.response?.data?.message || 'Guruhlar yuklanmadi')
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = async () => {
    if (isLoading.value || isLoadingMore.value || !hasMore.value) return
    try {
      isLoadingMore.value = true
      error.value = ''
      const next = page.value + 1
      if (tab.value === 'mine') {
        await fetchMine({ page: next, append: true })
      } else {
        await fetchAds({ page: next, append: true })
      }
    } catch (e: any) {
      error.value = friendlyErr(e?.response?.data?.message || 'Keyingi guruhlar yuklanmadi')
    } finally {
      isLoadingMore.value = false
    }
  }

  const setTab = async (t: PostTab) => {
    tab.value = t
    selected.value = new Set()
    // Har doim joriy search bilan yuklash (bo'sh bo'lsa ham)
    try {
      isLoading.value = true
      error.value = ''
      if (t === 'ads') await fetchAds({ page: 1, append: false })
      else await fetchMine({ page: 1, append: false })
    } catch (e: any) {
      error.value = friendlyErr(e?.response?.data?.message || 'Guruhlar yuklanmadi')
    } finally {
      isLoading.value = false
    }
  }

  const toggle = (id: string) => {
    const next = new Set(selected.value)
    if (next.has(id)) {
      next.delete(id)
      selected.value = next
      return
    }
    error.value = ''
    next.add(id)
    selected.value = next
  }

  const selectAllVisible = (list: PostGroup[]) => {
    selected.value = new Set(list.map((g) => g.id))
    error.value = ''
  }

  const clearSelection = () => {
    selected.value = new Set()
  }

  /** Haydovchi: ilova ichida guruhga a'zo bo'lish (tashqi Telegram yo'q) */
  const joinGroup = async (g: PostGroup) => {
    if (!g?.id || joiningId.value) return null
    try {
      joiningId.value = g.id
      error.value = ''
      const res = await useApi('/groups/ads/join', {
        method: 'POST',
        body: { groupId: g.id },
        timeout: 60_000,
      })
      if (res.success) {
        // Reklamadan chiqariladi — endi Meniki da
        adsGroups.value = adsGroups.value.filter((x) => x.id !== g.id)
        adsTotal.value = Math.max(0, adsTotal.value - 1)
        void fetchMine({ page: 1, force: true, append: false }).catch(() => {})
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || "Guruhga a'zo bo'lish amalga oshmadi"
      throw e
    } finally {
      joiningId.value = null
    }
  }

  /** Meniki: guruhdan chiqish */
  const leaveGroup = async (g: PostGroup) => {
    if (!g?.id || joiningId.value) return null
    try {
      joiningId.value = g.id
      error.value = ''
      const res = await useApi('/groups/membership', {
        method: 'POST',
        body: {
          action: 'leave',
          groupId: g.id,
          title: g.title,
          username: g.username,
          accessHash: g.accessHash,
        },
        timeout: 60_000,
      })
      if (res.success) {
        const next = new Set(selected.value)
        next.delete(g.id)
        selected.value = next
        mineGroups.value = mineGroups.value.filter((x) => x.id !== g.id)
        mineTotal.value = Math.max(0, mineTotal.value - 1)
        // Reklama ro'yxatini yangilash (endi a'zo emas)
        void fetchAds({ page: 1, force: true, append: false }).catch(() => {})
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || "Guruhdan chiqish amalga oshmadi"
      throw e
    } finally {
      joiningId.value = null
    }
  }

  /** Admin Meniki: admin guruhni haydovchilarga ko'rsatish / yashirish */
  const setVisibility = async (g: PostGroup, visible: boolean) => {
    if (!isAdmin.value) return
    try {
      error.value = ''
      const res = await useApi('/groups/ads/visibility', {
        method: 'POST',
        body: {
          groupId: g.id,
          title: g.title,
          username: g.username,
          accessHash: g.accessHash,
          membersCount: g.membersCount,
          visible,
        },
      })
      if (res.success) {
        const patch = (list: PostGroup[]) => {
          const idx = list.findIndex((x) => x.id === g.id)
          if (idx === -1) return list
          const copy = [...list]
          copy[idx] = {
            ...copy[idx],
            visibleToDrivers: visible,
            joinUrl: res.data?.joinUrl || copy[idx].joinUrl,
          }
          return copy
        }
        mineGroups.value = patch(mineGroups.value)
        adsGroups.value = patch(adsGroups.value)
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Ko\'rsatish sozlamasi saqlanmadi'
      throw e
    }
  }

  const broadcast = async (text: string) => {
    try {
      isSending.value = true
      error.value = ''
      const res = await useApi('/groups/broadcast', {
        method: 'POST',
        body: {
          mode: tab.value,
          groupIds: [...selected.value],
          text,
        },
      })
      if (res.success) {
        selected.value = new Set()
        await authStore.getMe()
      }
      return res
    } catch (e: any) {
      handlePostActionError(e, 'Yuborish amalga oshmadi')
      throw e
    } finally {
      isSending.value = false
    }
  }

  const fetchCampaigns = async () => {
    try {
      isCampaignsLoading.value = true
      const res = await useApi('/groups/broadcast/campaigns')
      if (res.success) {
        campaigns.value = (res.data?.campaigns ?? []) as PostCampaign[]
      }
      return res
    } catch {
      campaigns.value = []
      return null
    } finally {
      isCampaignsLoading.value = false
    }
  }

  const fetchSchedule = fetchCampaigns

  const createCampaign = async (
    payload: {
      name: string
      text: string
      intervalMin: number
      start: boolean
    }
  ) => {
    try {
      isSending.value = true
      error.value = ''
      const res = await useApi('/groups/broadcast/campaigns', {
        method: 'POST',
        body: {
          name: payload.name,
          mode: tab.value,
          groupIds: [...selected.value],
          text: payload.text,
          intervalMin: payload.intervalMin,
          start: payload.start,
        },
      })
      if (res.success) {
        selected.value = new Set()
        await fetchCampaigns()
        await authStore.getMe()
      }
      return res
    } catch (e: any) {
      handlePostActionError(e, 'Saqlanmadi')
      throw e
    } finally {
      isSending.value = false
    }
  }

  const updateCampaign = async (
    id: string,
    payload: {
      name: string
      text: string
      intervalMin: number
      groupIds?: string[]
    }
  ) => {
    try {
      isSending.value = true
      error.value = ''
      const res = await useApi(`/groups/broadcast/campaigns/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          name: payload.name,
          text: payload.text,
          intervalMin: payload.intervalMin,
          mode: tab.value,
          ...(payload.groupIds ? { groupIds: payload.groupIds } : {}),
        },
      })
      if (res.success) await fetchCampaigns()
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Yangilanmadi'
      throw e
    } finally {
      isSending.value = false
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      campaignBusyId.value = id
      error.value = ''
      const res = await useApi(`/groups/broadcast/campaigns/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.success) {
        campaigns.value = campaigns.value.filter((c) => c.id !== id)
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || "O'chirilmadi"
      throw e
    } finally {
      campaignBusyId.value = null
    }
  }

  const startCampaign = async (id: string) => {
    try {
      campaignBusyId.value = id
      error.value = ''
      const res = await useApi(`/groups/broadcast/campaigns/${encodeURIComponent(id)}/start`, {
        method: 'POST',
      })
      if (res.success) await fetchCampaigns()
      return res
    } catch (e: any) {
      handlePostActionError(e, 'Boshlanmadi')
      throw e
    } finally {
      campaignBusyId.value = null
    }
  }

  const stopCampaign = async (id: string) => {
    try {
      campaignBusyId.value = id
      error.value = ''
      const res = await useApi(`/groups/broadcast/campaigns/${encodeURIComponent(id)}/stop`, {
        method: 'POST',
      })
      if (res.success) await fetchCampaigns()
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || "To'xtatilmadi"
      throw e
    } finally {
      campaignBusyId.value = null
    }
  }

  const startSchedule = async (text: string, intervalMin: number) =>
    createCampaign({ name: 'E\'lon', text, intervalMin, start: true })

  const stopSchedule = async () => {
    const active = campaigns.value.find((c) => c.active)
    if (!active) return null
    return stopCampaign(active.id)
  }

  /** Admin: tanlangan guruhlarni bloklash */
  const blockGroups = async () => {
    const list = selectedList.value
    if (!list.length || !isAdmin.value) return null
    try {
      isBlocking.value = true
      error.value = ''
      const res = await useApi('/groups/block', {
        method: 'POST',
        body: {
          groups: list.map((g) => ({
            groupId: g.id,
            title: g.title,
            username: g.username,
          })),
        },
      })
      if (res.success) {
        const ids = new Set(list.map((g) => g.id))
        adsGroups.value = adsGroups.value.filter((g) => !ids.has(g.id))
        adsTotal.value = Math.max(0, adsTotal.value - ids.size)
        selected.value = new Set()
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Bloklash amalga oshmadi'
      throw e
    } finally {
      isBlocking.value = false
    }
  }

  /** Tabbar boshqa tabga o'tganda — guruhlar ro'yxati xotirasi */
  const releaseTabMemory = () => {
    mineGroups.value = []
    adsGroups.value = []
    selected.value = new Set()
    minePage.value = 1
    adsPage.value = 1
    mineTotal.value = 0
    adsTotal.value = 0
    mineHasMore.value = false
    adsHasMore.value = false
    isLoading.value = false
    isLoadingMore.value = false
  }

  return {
    tab,
    mineGroups,
    adsGroups,
    mineTotal,
    adsTotal,
    selected,
    isLoading,
    isLoadingMore,
    isSending,
    isBlocking,
    joiningId,
    error,
    campaigns,
    campaignBusyId,
    isCampaignsLoading,
    schedule,
    isScheduleLoading,
    search,
    query,
    isAdmin,
    balance,
    groups,
    totalGroups,
    hasMore,
    page,
    selectedList,
    pricePerGroup,
    totalCost,
    maxSelectable,
    load,
    loadMore,
    setSearch,
    setQuery,
    setTab,
    toggle,
    selectAllVisible,
    clearSelection,
    setVisibility,
    joinGroup,
    leaveGroup,
    broadcast,
    fetchCampaigns,
    fetchSchedule,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    stopCampaign,
    startSchedule,
    stopSchedule,
    blockGroups,
    releaseTabMemory,
  }
})
