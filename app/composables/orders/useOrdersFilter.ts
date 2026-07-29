import type { useOrderStore } from '~/stores/order.store'
import {
  loadOrderFilterKeywords,
  parseKeywords,
  saveOrderFilterKeywords,
} from '~/utils/orderFilterKeywords'

const LIMIT = 10

/**
 * Buyurtmalar filtri — kalit so'zlar serverga `search` sifatida yuboriladi.
 * Ro'yxat faqat API natijasi (client-side qayta filter yo'q).
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const appliedKeywords = ref('')
  const filterActive = computed(() => !!appliedKeywords.value.trim())

  /** API so'rovlari uchun query (limit + search) */
  const queryParams = () => ({
    limit: LIMIT,
    search: appliedKeywords.value.trim() || undefined,
  })

  /** Server filtrlangan ro'yxat — qo'shimcha client kesish yo'q */
  const displayOrders = computed(() => orderStore.orders)

  /** Birinchi sahifa (ro'yxatni almashtiradi) */
  const load = () => orderStore.fetchOrders({ page: 1, ...queryParams() })

  /** Keyingi sahifa (ro'yxatga qo'shadi) */
  const loadMore = () => orderStore.loadMore(queryParams())

  const onSaveFilter = (value: string) => {
    draftKeywords.value = value
    appliedKeywords.value = value
    saveOrderFilterKeywords(value)
    showFilter.value = false
    // Har doim serverdan qayta yuklash
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

  /** Saqlangan filtrni yuklash (onMounted da chaqiriladi) */
  const hydrateFilter = () => {
    const saved = loadOrderFilterKeywords()
    draftKeywords.value = saved
    appliedKeywords.value = saved
  }

  return {
    showFilter,
    draftKeywords,
    appliedKeywords,
    filterActive,
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
