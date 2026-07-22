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

  const pricePerGroup = computed(() => {
    if (tab.value === 'mine') return 0
    if (isAdmin.value) return 0
    return AD_PRICE
  })

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
    if (!isAdmin.value) {
      adsGroups.value = []
      adsTotal.value = 0
      adsPage.value = 1
      adsHasMore.value = false
      return
    }
    const pageNum = opts.page ?? 1
    const res = await useApi('/groups/ads', {
      params: {
        page: pageNum,
        limit: GROUPS_PAGE_SIZE,
        ...(opts.force ? { force: '1' } : {}),
      },
      timeout: 180_000,
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

  /** Birinchi sahifa (ro'yxatni almashtiradi) */
  const load = async (force = false) => {
    try {
      isLoading.value = true
      error.value = ''
      await fetchMine({ page: 1, force, append: false })
      if (isAdmin.value) await fetchAds({ page: 1, force, append: false })
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Guruhlar yuklanmadi'
    } finally {
      isLoading.value = false
    }
  }

  /** Keyingi 10 ta (infinite scroll) */
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
      error.value = e?.response?.data?.message || 'Keyingi guruhlar yuklanmadi'
    } finally {
      isLoadingMore.value = false
    }
  }

  const setTab = (t: PostTab) => {
    if (t === 'ads' && !isAdmin.value) return
    tab.value = t
    selected.value = new Set()
    // Tabda hali yuklanmagan bo'lsa — 1-sahifa
    if (t === 'ads' && !adsGroups.value.length && isAdmin.value) {
      fetchAds({ page: 1, append: false }).catch(() => {})
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
    broadcast,
  }
})
