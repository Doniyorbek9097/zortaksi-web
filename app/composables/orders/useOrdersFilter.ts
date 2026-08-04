import type { useOrderStore } from '~/stores/order.store'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  parseKeywords,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterBotGroupId,
  filterOrdersByKeywords,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'
import {
  ORDERS_SCOPE_STORAGE_KEY,
  type OrdersScope,
} from '~/utils/ordersScope'

const LIMIT = ORDERS_PAGE_LIMIT

export type { OrdersScope }

/**
 * Buyurtmalar filtri — server (search/botGroupId) + client qo'shimcha filter.
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const draftBotGroupId = ref('')
  const appliedKeywords = ref('')
  const appliedBotGroupId = ref('')
  const scope = ref<OrdersScope>('all')
  const scopeLoading = ref(false)
  const scopeNewCounts = computed(() => orderStore.scopeNewCounts)
  const allNewCount = computed(
    () => scopeNewCounts.value.mine + scopeNewCounts.value.others,
  )
  const filterActive = computed(
    () => !!appliedBotGroupId.value.trim() || !!appliedKeywords.value.trim(),
  )

  const buildFilterParams = () => {
    const botGroupId = appliedBotGroupId.value.trim()
    if (botGroupId) {
      return { botGroupId }
    }
    const search = appliedKeywords.value.trim()
    return search ? { search } : {}
  }

  /** API so'rovlari uchun query (limit + filter + scope) */
  const queryParams = () => ({
    limit: LIMIT,
    scope: scope.value,
    ...buildFilterParams(),
  })

  /** Server natijasi + client qo'shimcha filter (aniqlik) */
  const displayOrders = computed(() => {
    const raw = appliedKeywords.value.trim()
    if (!raw) return orderStore.orders
    return filterOrdersByKeywords(orderStore.orders, raw)
  })

  const refreshScopeCounts = () =>
    orderStore.refreshScopeCounts(
      appliedBotGroupId.value ? undefined : appliedKeywords.value.trim() || undefined,
      appliedBotGroupId.value.trim() || undefined,
    )

  const load = async () => {
    const res = await orderStore.fetchOrders({ page: 1, ...queryParams() })
    await refreshScopeCounts()
    orderStore.reconcileScopeCountsAfterLoad()
    return res
  }

  const loadMore = () => orderStore.loadMore(queryParams())

  const onSaveFilter = () => {
    appliedKeywords.value = draftKeywords.value
    appliedBotGroupId.value = draftBotGroupId.value.trim()
    saveOrderFilterKeywords(draftKeywords.value)
    if (appliedBotGroupId.value) {
      saveOrderFilterBotGroupId(appliedBotGroupId.value)
    } else {
      clearOrderFilterBotGroupId()
    }
    showFilter.value = false
    void load()
  }

  const onCancelFilter = () => {
    draftKeywords.value = appliedKeywords.value
    draftBotGroupId.value = appliedBotGroupId.value
    showFilter.value = false
  }

  const onRemoveRegion = (chip: string) => {
    clearOrderFilterBotGroupId()
    appliedBotGroupId.value = ''
    draftBotGroupId.value = ''
    const next = parseKeywords(appliedKeywords.value)
      .filter((k) => k !== chip)
      .join(', ')
    draftKeywords.value = next
    appliedKeywords.value = next
    saveOrderFilterKeywords(next)
    void load()
  }

  const setScope = async (next: OrdersScope) => {
    if (scope.value === next) return
    scope.value = next
    if (import.meta.client) {
      try {
        sessionStorage.setItem(ORDERS_SCOPE_STORAGE_KEY, next)
      } catch { /* ignore */ }
    }
    orderStore.ordersListScrollY = 0
    orderStore.orders = []
    orderStore.applyListFilter({ page: 1, ...queryParams() })
    scopeLoading.value = true
    try {
      await orderStore.refreshMemberGroupIds()
      await load()
    } finally {
      scopeLoading.value = false
    }
  }

  const hydrateFilter = () => {
    const saved = loadOrderFilterKeywords()
    const savedGroup = loadOrderFilterBotGroupId()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    draftBotGroupId.value = savedGroup
    appliedBotGroupId.value = savedGroup
    if (import.meta.client) {
      try {
        const s = sessionStorage.getItem(ORDERS_SCOPE_STORAGE_KEY)
        if (s === 'all' || s === 'mine' || s === 'others') scope.value = s
      } catch { /* ignore */ }
    }
    orderStore.applyListFilter({
      page: 1,
      limit: LIMIT,
      scope: scope.value,
      ...(savedGroup ? { botGroupId: savedGroup } : { search: saved.trim() || undefined }),
    })
  }

  return {
    showFilter,
    draftKeywords,
    draftBotGroupId,
    appliedKeywords,
    appliedBotGroupId,
    scope,
    scopeLoading,
    scopeNewCounts,
    allNewCount,
    filterActive,
    displayOrders,
    queryParams,
    load,
    loadMore,
    onSaveFilter,
    onCancelFilter,
    onRemoveRegion,
    setScope,
    hydrateFilter,
    refreshScopeCounts,
  }
}
