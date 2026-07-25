import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'

export type PostTab = 'mine' | 'ads'

export interface PostGroup {
  id: string
  title: string
  username?: string
  accessHash?: string
  membersCount?: number
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
export const GROUPS_PAGE_SIZE = 10

export const usePostStore = defineStore('post', () => {
  const authStore = useAuthStore()

  const tab = ref<PostTab>('mine')
  const mineGroups = ref<PostGroup[]>([])
  const adsGroups = ref<PostGroup[]>([])
  const selected = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSending = ref(false)
  const joiningId = ref<string | null>(null)
  const error = ref('')

  const minePage = ref(1)
  const adsPage = ref(1)
  const mineTotal = ref(0)
  const adsTotal = ref(0)
  const mineHasMore = ref(false)
  const adsHasMore = ref(false)

  const isAdmin = computed(() => authStore.user?.role === 'admin')
  const balance = computed(() => authStore.user?.balance ?? 0)

  const groups = computed(() => (tab.value === 'mine' ? mineGroups.value : adsGroups.value))
  const totalGroups = computed(() => (tab.value === 'mine' ? mineTotal.value : adsTotal.value))
  const hasMore = computed(() => (tab.value === 'mine' ? mineHasMore.value : adsHasMore.value))
  const page = computed(() => (tab.value === 'mine' ? minePage.value : adsPage.value))

  const selectedList = computed(() => groups.value.filter(g => selected.value.has(g.id)))

  /** Meniki va admin ochgan Reklama guruhlari — bepul */
  const pricePerGroup = computed(() => 0)

  const totalCost = computed(() => pricePerGroup.value * selected.value.size)

  const maxSelectable = computed(() => {
    if (pricePerGroup.value <= 0) return Infinity
    return Math.floor(balance.value / pricePerGroup.value)
  })

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

  /** Birinchi sahifa — Meniki darhol; Reklama fonda */
  const load = async (force = false) => {
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
    if (t === 'ads' && !adsGroups.value.length) {
      try {
        isLoading.value = true
        error.value = ''
        await fetchAds({ page: 1, append: false })
      } catch (e: any) {
        error.value = friendlyErr(e?.response?.data?.message || 'Guruhlar yuklanmadi')
      } finally {
        isLoading.value = false
      }
    }
  }

  const toggle = (id: string) => {
    const next = new Set(selected.value)
    if (next.has(id)) {
      next.delete(id)
      selected.value = next
      return
    }
    if (pricePerGroup.value > 0 && next.size >= maxSelectable.value) {
      error.value = `Balans yetarli emas. Har bir guruh ${pricePerGroup.value.toLocaleString('ru-RU')} so'm`
      return
    }
    error.value = ''
    next.add(id)
    selected.value = next
  }

  const selectAllVisible = (list: PostGroup[]) => {
    const next = new Set<string>()
    let count = 0
    for (const g of list) {
      if (pricePerGroup.value > 0 && count >= maxSelectable.value) break
      next.add(g.id)
      count++
    }
    selected.value = next
    if (pricePerGroup.value > 0 && list.length > maxSelectable.value) {
      error.value = `Balans faqat ${maxSelectable.value} ta guruhga yetadi`
    } else {
      error.value = ''
    }
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
        const idx = adsGroups.value.findIndex((x) => x.id === g.id)
        if (idx !== -1) {
          const copy = [...adsGroups.value]
          copy[idx] = { ...copy[idx], isMember: true }
          adsGroups.value = copy
        }
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || "Guruhga a'zo bo'lish amalga oshmadi"
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
      error.value = e?.response?.data?.message || 'Yuborish amalga oshmadi'
      throw e
    } finally {
      isSending.value = false
    }
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
    joiningId,
    error,
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
    setTab,
    toggle,
    selectAllVisible,
    clearSelection,
    setVisibility,
    joinGroup,
    broadcast,
  }
})
