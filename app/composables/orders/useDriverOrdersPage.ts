import type { IOrder } from '~/types'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { useOrdersFilter } from './useOrdersFilter'
import { useOrdersListSync } from './useOrdersListSync'
import { useOrdersBooking } from './useOrdersBooking'
import { useOrdersChatActions } from './useOrdersChatActions'
import { useOrdersModeration } from './useOrdersModeration'
import { useOrdersAddToBot } from './useOrdersAddToBot'
import { useOrdersPreconnect } from './useOrdersPreconnect'

/**
 * Haydovchi buyurtmalar sahifasi — barcha composablelarni birlashtiradi.
 */
export function useDriverOrdersPage() {
  const authStore = useAuthStore()
  const orderStore = useOrderStore()
  const chatStore = useChatStore()

  const role = computed(() => authStore.user?.role)
  const active = computed(() => authStore.tariffActive)
  const isAdmin = computed(() => role.value === 'admin')

  const filter = useOrdersFilter(orderStore)

  const { sentinel, listRoot, persistScroll } = useOrdersListSync({
    orderStore,
    displayOrders: filter.displayOrders,
    queryParams: filter.queryParams,
    load: filter.load,
    loadMore: filter.loadMore,
    hydrateFilter: filter.hydrateFilter,
  })

  const moderation = useOrdersModeration(orderStore)

  const booking = useOrdersBooking({
    orderStore,
    authStore,
    isAdmin,
  })

  const chat = useOrdersChatActions({
    orderStore,
    chatStore,
    showError: moderation.showError,
    beforeNavigate: persistScroll,
  })

  useOrdersPreconnect({
    chatStore,
    displayOrders: filter.displayOrders,
  })

  const addToBot = useOrdersAddToBot({
    showError: moderation.showError,
    showSuccess: moderation.showSuccess,
  })

  const onUnlock = () => navigateTo('/driver/payment')

  const unreadCount = computed(() => orderStore.unreadOrdersCount)
  const isOrderSeen = (order: IOrder) => !orderStore.isOrderUnread(order)
  const markAllAsRead = () => {
    orderStore.markAllOrdersAsRead()
  }

  usePullToRefresh(() => filter.load())

  let orderQueryTimer: ReturnType<typeof setTimeout> | null = null
  watch(filter.orderQuery, (val) => {
    if (orderQueryTimer) clearTimeout(orderQueryTimer)
    orderQueryTimer = setTimeout(() => {
      if (val.trim() === filter.appliedOrderQuery.value) return
      void filter.applyOrderQuery(val)
    }, 350)
  })

  onBeforeUnmount(() => {
    if (orderQueryTimer) clearTimeout(orderQueryTimer)
  })

  return {
    authStore,
    orderStore,
    role,
    active,
    isAdmin,
    showFilter: filter.showFilter,
    draftKeywords: filter.draftKeywords,
    draftBotGroupId: filter.draftBotGroupId,
    appliedKeywords: filter.appliedKeywords,
    appliedBotGroupId: filter.appliedBotGroupId,
    filterActive: filter.filterActive,
    filterLoading: filter.filterLoading,
    orderQuery: filter.orderQuery,
    orderSearchActive: filter.orderSearchActive,
    scope: filter.scope,
    setScope: filter.setScope,
    displayOrders: filter.displayOrders,
    onSaveFilter: filter.onSaveFilter,
    onCancelFilter: filter.onCancelFilter,
    onRemoveRegion: filter.onRemoveRegion,
    sentinel,
    listRoot,
    ...booking,
    ...chat,
    ...moderation,
    ...addToBot,
    onUnlock,
    unreadCount,
    isOrderSeen,
    markAllAsRead,
  }
}
