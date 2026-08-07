import type { useOrderStore } from '~/stores/order.store'
import { useAuthStore } from '~/stores/auth.store'
import { isAdminUser } from '~/utils/userRole'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  parseKeywords,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterBotGroupId,
  clearOrderFilterKeywords,
  filterOrdersByKeywords,
  markOrderFilterConfigured,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'

const LIMIT = ORDERS_PAGE_LIMIT
const SCOPE_STORAGE_KEY = 'zortaksi:orders-scope'

export type OrdersScopeTab = 'all' | 'mine'

const loadScope = (): OrdersScopeTab => {
  if (!import.meta.client) return 'all'
  try {
    return localStorage.getItem(SCOPE_STORAGE_KEY) === 'mine' ? 'mine' : 'all'
  } catch {
    return 'all'
  }
}

/**
 * Buyurtmalar filtri — server (search/botGroupId) + client qo'shimcha filter.
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const authStore = useAuthStore()
  const isAdmin = computed(() => isAdminUser(authStore.user))
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const draftBotGroupId = ref('')
  const appliedKeywords = ref('')
  const appliedBotGroupId = ref('')
  const filterLoading = ref(false)
  const orderQuery = ref('')
  const appliedOrderQuery = ref('')
  const scope = ref<OrdersScopeTab>(loadScope())
  const filterActive = computed(
    () => !!appliedBotGroupId.value.trim() || !!appliedKeywords.value.trim(),
  )
  const orderSearchActive = computed(() => !!appliedOrderQuery.value.trim())

  const buildFilterParams = () => {
    if (!isAdmin.value) return {}
    const botGroupId = appliedBotGroupId.value.trim()
    if (botGroupId) {
      return { botGroupId }
    }
    const search = appliedKeywords.value.trim()
    return search ? { search } : {}
  }

  const scopeQuery = () =>
    scope.value === 'mine' ? { scope: 'mine' as const } : {}

  /** API so'rovlari uchun query (limit + filter + matn qidiruvi + tab) */
  const queryParams = () => ({
    limit: LIMIT,
    ...buildFilterParams(),
    ...scopeQuery(),
    ...(appliedOrderQuery.value.trim() ? { text: appliedOrderQuery.value.trim() } : {}),
  })

  /** Server natijasi — bot guruh filtrida client qo'shimcha kesmaydi */
  const displayOrders = computed(() => {
    if (!isAdmin.value || appliedBotGroupId.value.trim()) return orderStore.orders
    const raw = appliedKeywords.value.trim()
    if (!raw) return orderStore.orders
    return filterOrdersByKeywords(orderStore.orders, raw)
  })

  const load = async () => {
    return orderStore.fetchOrders({ page: 1, ...queryParams() })
  }

  const loadMore = () => orderStore.loadMore(queryParams())

  const beginFilterReload = () => {
    orderStore.applyListFilter({ page: 1, ...queryParams() })
    orderStore.resetListForFilterChange()
  }

  /** Buyurtma matni — server `text` (debounce orders.vue dan) */
  const applyOrderQuery = async (value: string) => {
    const next = String(value || '').trim()
    if (next === appliedOrderQuery.value) return
    appliedOrderQuery.value = next
    beginFilterReload()
    filterLoading.value = true
    try {
      await load()
    } finally {
      filterLoading.value = false
    }
  }

  const onSaveFilter = async () => {
    const kw = draftKeywords.value.trim()
    const gid = kw ? String(draftBotGroupId.value || '').trim() : ''

    appliedKeywords.value = kw
    appliedBotGroupId.value = gid
    draftKeywords.value = kw
    draftBotGroupId.value = gid

    if (kw) saveOrderFilterKeywords(kw)
    else clearOrderFilterKeywords()

    if (gid) saveOrderFilterBotGroupId(gid)
    else clearOrderFilterBotGroupId()

    markOrderFilterConfigured()

    showFilter.value = false
    beginFilterReload()
    filterLoading.value = true
    try {
      await load()
    } finally {
      filterLoading.value = false
    }
  }

  const onCancelFilter = () => {
    draftKeywords.value = appliedKeywords.value
    draftBotGroupId.value = appliedBotGroupId.value
    showFilter.value = false
  }

  const setScope = async (next: OrdersScopeTab) => {
    if (next === scope.value) return
    scope.value = next
    if (import.meta.client) {
      try {
        localStorage.setItem(SCOPE_STORAGE_KEY, next)
      } catch { /* ignore */ }
    }
    beginFilterReload()
    filterLoading.value = true
    try {
      await load()
    } finally {
      filterLoading.value = false
    }
  }

  const onRemoveRegion = async (chip: string) => {
    clearOrderFilterBotGroupId()
    appliedBotGroupId.value = ''
    draftBotGroupId.value = ''
    const next = parseKeywords(appliedKeywords.value)
      .filter((k) => k !== chip)
      .join(', ')
    draftKeywords.value = next
    appliedKeywords.value = next
    saveOrderFilterKeywords(next)
    beginFilterReload()
    filterLoading.value = true
    try {
      await load()
    } finally {
      filterLoading.value = false
    }
  }

  const hydrateFilter = () => {
    if (!isAdmin.value) {
      orderStore.applyListFilter({ page: 1, limit: LIMIT, ...scopeQuery() })
      return
    }
    const saved = loadOrderFilterKeywords()
    const savedGroup = loadOrderFilterBotGroupId()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    draftBotGroupId.value = savedGroup
    appliedBotGroupId.value = savedGroup
    orderStore.applyListFilter({
      page: 1,
      limit: LIMIT,
      ...scopeQuery(),
      ...(savedGroup ? { botGroupId: savedGroup } : { search: saved.trim() || undefined }),
    })
  }

  return {
    isAdmin,
    showFilter,
    draftKeywords,
    draftBotGroupId,
    appliedKeywords,
    appliedBotGroupId,
    filterLoading,
    filterActive,
    orderQuery,
    orderSearchActive,
    appliedOrderQuery,
    applyOrderQuery,
    scope,
    setScope,
    displayOrders,
    queryParams,
    load,
    loadMore,
    onSaveFilter,
    onCancelFilter,
    onRemoveRegion,
    hydrateFilter,
  }
}
