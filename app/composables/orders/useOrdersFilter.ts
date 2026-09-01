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
  markOrderFilterConfigured,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'

const LIMIT = ORDERS_PAGE_LIMIT

export type OrdersScopeTab = 'all' | 'mine'

/**
 * Buyurtmalar filtri — server (search/botGroupId) + client qo'shimcha filter.
 * Scope tab olib tashlangan — doim barcha buyurtmalar.
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
  const scope = ref<OrdersScopeTab>('all')
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

  /** Server allaqachon filter qiladi — qayta kesmaslik (pagination buzilmasin) */
  const displayOrders = computed(() => orderStore.orders)

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
    const gid = String(draftBotGroupId.value || '').trim()

    appliedKeywords.value = gid ? '' : kw
    appliedBotGroupId.value = gid
    draftKeywords.value = appliedKeywords.value
    draftBotGroupId.value = gid

    if (gid) {
      clearOrderFilterKeywords()
      saveOrderFilterBotGroupId(gid)
    } else {
      clearOrderFilterBotGroupId()
      if (kw) saveOrderFilterKeywords(kw)
      else clearOrderFilterKeywords()
    }

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

  const setScope = async (_next: OrdersScopeTab) => {
    // Tab olib tashlangan — doim barcha
    scope.value = 'all'
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
    scope.value = 'all'
    orderStore.applyListFilter({
      page: 1,
      limit: LIMIT,
      text: '',
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
