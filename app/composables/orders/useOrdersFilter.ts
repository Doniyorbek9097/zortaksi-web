import type { useOrderStore } from '~/stores/order.store'
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

/**
 * Buyurtmalar filtri — server (search/botGroupId) + client qo'shimcha filter.
 */
export function useOrdersFilter(orderStore: ReturnType<typeof useOrderStore>) {
  const showFilter = ref(false)
  const draftKeywords = ref('')
  const draftBotGroupId = ref('')
  const appliedKeywords = ref('')
  const appliedBotGroupId = ref('')
  const filterLoading = ref(false)
  const orderQuery = ref('')
  const appliedOrderQuery = ref('')
  const filterActive = computed(
    () => !!appliedBotGroupId.value.trim() || !!appliedKeywords.value.trim(),
  )
  const orderSearchActive = computed(() => !!appliedOrderQuery.value.trim())

  const buildFilterParams = () => {
    const botGroupId = appliedBotGroupId.value.trim()
    if (botGroupId) {
      return { botGroupId }
    }
    const search = appliedKeywords.value.trim()
    return search ? { search } : {}
  }

  /** API so'rovlari uchun query (limit + filter + matn qidiruvi) */
  const queryParams = () => ({
    limit: LIMIT,
    ...buildFilterParams(),
    ...(appliedOrderQuery.value.trim() ? { text: appliedOrderQuery.value.trim() } : {}),
  })

  /** Server natijasi — bot guruh filtrida client qo'shimcha kesmaydi */
  const displayOrders = computed(() => {
    if (appliedBotGroupId.value.trim()) return orderStore.orders
    const raw = appliedKeywords.value.trim()
    if (!raw) return orderStore.orders
    return filterOrdersByKeywords(orderStore.orders, raw)
  })

  const load = async () => {
    return orderStore.fetchOrders({ page: 1, ...queryParams() })
  }

  const loadMore = () => orderStore.loadMore(queryParams())

  const beginFilterReload = () => {
    orderStore.ordersListScrollY = 0
    orderStore.orders = []
    orderStore.applyListFilter({ page: 1, ...queryParams() })
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
    const saved = loadOrderFilterKeywords()
    const savedGroup = loadOrderFilterBotGroupId()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    draftBotGroupId.value = savedGroup
    appliedBotGroupId.value = savedGroup
    orderStore.applyListFilter({
      page: 1,
      limit: LIMIT,
      ...(savedGroup ? { botGroupId: savedGroup } : { search: saved.trim() || undefined }),
    })
  }

  return {
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
