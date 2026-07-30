import type { useOrderStore } from '~/stores/order.store'
import {
  loadOrderFilterKeywords,
  parseKeywords,
  saveOrderFilterKeywords,
} from '~/utils/orderFilterKeywords'
import {
  ORDERS_SCOPE_STORAGE_KEY,
  readOrdersScope,
  type OrdersScope,
} from '~/utils/ordersScope'

const LIMIT = 10

export type { OrdersScope }

/**
 * Buyurtmalar filtri — kalit so'zlar + Barchasi/Meniki/Boshqalar scope serverga yuboriladi.
 * Ro'yxat faqat API natijasi (client-side qayta filter yo'q).
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const appliedKeywords = ref('')
  const scope = ref<OrdersScope>('all')
  const scopeLoading = ref(false)
  const scopeNewCounts = computed(() => orderStore.scopeNewCounts)
  const allNewCount = computed(
    () => scopeNewCounts.value.mine + scopeNewCounts.value.others,
  )
  const filterActive = computed(() => !!appliedKeywords.value.trim())

  /** API so'rovlari uchun query (limit + search + scope) */
  const queryParams = () => ({
    limit: LIMIT,
    search: appliedKeywords.value.trim() || undefined,
    scope: scope.value,
  })

  /** Server filtrlangan ro'yxat — qo'shimcha client kesish yo'q */
  const displayOrders = computed(() => orderStore.orders)

  const refreshScopeCounts = () =>
    orderStore.refreshScopeCounts(appliedKeywords.value.trim() || undefined)

  /** Birinchi sahifa (ro'yxatni almashtiradi) */
  const load = async () => {
    const res = await orderStore.fetchOrders({ page: 1, ...queryParams() })
    await refreshScopeCounts()
    orderStore.reconcileScopeCountsAfterLoad()
    return res
  }

  /** Keyingi sahifa (ro'yxatga qo'shadi) */
  const loadMore = () => orderStore.loadMore(queryParams())

  const onSaveFilter = (value: string) => {
    draftKeywords.value = value
    appliedKeywords.value = value
    saveOrderFilterKeywords(value)
    showFilter.value = false
    void load()
  }

  const onCancelFilter = () => {
    draftKeywords.value = appliedKeywords.value
    showFilter.value = false
  }

  const onRemoveRegion = (chip: string) => {
    const next = parseKeywords(appliedKeywords.value)
      .filter((k) => k !== chip)
      .join(', ')
    onSaveFilter(next)
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
    // Poll/socket darhol yangi scope bilan ishlashi uchun
    orderStore.applyListFilter({ page: 1, ...queryParams() })
    scopeLoading.value = true
    try {
      await orderStore.refreshMemberGroupIds()
      await load()
    } finally {
      scopeLoading.value = false
    }
  }

  /** Saqlangan filtrni yuklash (onMounted da chaqiriladi) */
  const hydrateFilter = () => {
    const saved = loadOrderFilterKeywords()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    if (import.meta.client) {
      try {
        const s = sessionStorage.getItem(ORDERS_SCOPE_STORAGE_KEY)
        if (s === 'all' || s === 'mine' || s === 'others') scope.value = s
      } catch { /* ignore */ }
    }
    orderStore.applyListFilter({
      page: 1,
      limit: LIMIT,
      search: appliedKeywords.value.trim() || undefined,
      scope: scope.value,
    })
  }

  return {
    showFilter,
    draftKeywords,
    appliedKeywords,
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
