import type { useOrderStore } from '~/stores/order.store'
import {
  loadOrderFilterKeywords,
  parseKeywords,
  saveOrderFilterKeywords,
} from '~/utils/orderFilterKeywords'

const LIMIT = 10

export type OrdersScope = 'mine' | 'others'

const SCOPE_STORAGE_KEY = 'zortaksi:orders-scope'

/**
 * Buyurtmalar filtri — kalit so'zlar + Meniki/Boshqalar scope serverga yuboriladi.
 * Ro'yxat faqat API natijasi (client-side qayta filter yo'q).
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const appliedKeywords = ref('')
  const scope = ref<OrdersScope>('mine')
  const scopeNewCounts = ref({ mine: 0, others: 0 })
  const filterActive = computed(() => !!appliedKeywords.value.trim())

  /** API so'rovlari uchun query (limit + search + scope) */
  const queryParams = () => ({
    limit: LIMIT,
    search: appliedKeywords.value.trim() || undefined,
    scope: scope.value,
  })

  /** Server filtrlangan ro'yxat — qo'shimcha client kesish yo'q */
  const displayOrders = computed(() => orderStore.orders)

  const refreshScopeCounts = async () => {
    const search = appliedKeywords.value.trim() || undefined
    try {
      const [mineRes, othersRes] = await Promise.all([
        useApi('/orders', {
          method: 'GET',
          params: { status: 'new', page: 1, limit: 1, scope: 'mine', search },
        }),
        useApi('/orders', {
          method: 'GET',
          params: { status: 'new', page: 1, limit: 1, scope: 'others', search },
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

  /** Birinchi sahifa (ro'yxatni almashtiradi) */
  const load = async () => {
    const res = await orderStore.fetchOrders({ page: 1, ...queryParams() })
    void refreshScopeCounts()
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
        sessionStorage.setItem(SCOPE_STORAGE_KEY, next)
      } catch { /* ignore */ }
    }
    orderStore.ordersListScrollY = 0
    await orderStore.refreshMemberGroupIds()
    await load()
  }

  /** Saqlangan filtrni yuklash (onMounted da chaqiriladi) */
  const hydrateFilter = () => {
    const saved = loadOrderFilterKeywords()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    if (import.meta.client) {
      try {
        const s = sessionStorage.getItem(SCOPE_STORAGE_KEY)
        if (s === 'mine' || s === 'others') scope.value = s
      } catch { /* ignore */ }
    }
  }

  return {
    showFilter,
    draftKeywords,
    appliedKeywords,
    scope,
    scopeNewCounts,
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
