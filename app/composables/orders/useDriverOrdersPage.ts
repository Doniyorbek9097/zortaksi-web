import type { IOrder } from '~/types'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { useOrdersFilter } from './useOrdersFilter'
import { useOrdersListSync } from './useOrdersListSync'
import { useOrdersBooking } from './useOrdersBooking'
import { useOrdersChatActions } from './useOrdersChatActions'
import { useOrdersModeration } from './useOrdersModeration'
import { useOrdersMembership } from './useOrdersMembership'
import { useOrdersAddToBot } from './useOrdersAddToBot'

/**
 * Haydovchi buyurtmalar sahifasi — barcha composablelarni birlashtiradi.
 * Sahifa fayli faqat UI ulash uchun qoladi.
 */
export function useDriverOrdersPage() {
  const authStore = useAuthStore()
  const orderStore = useOrderStore()
  const chatStore = useChatStore()

  // Rol va aktivlik — tugmalarni ko'rsatishni boshqaradi
  const role = computed(() => authStore.user?.role)
  const active = computed(() => authStore.tariffActive)
  const isAdmin = computed(() => role.value === 'admin')

  const filter = useOrdersFilter(orderStore)

  const { sentinel, listRoot, saveScroll } = useOrdersListSync({
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
    beforeNavigate: saveScroll,
  })

  const membership = useOrdersMembership({
    orderStore,
    showError: moderation.showError,
    onMembershipChanged: () => {
      void filter.load()
      void filter.refreshScopeCounts()
    },
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

  return {
    authStore,
    orderStore,
    role,
    active,
    isAdmin,
    // Filter
    showFilter: filter.showFilter,
    draftKeywords: filter.draftKeywords,
    appliedKeywords: filter.appliedKeywords,
    filterActive: filter.filterActive,
    scope: filter.scope,
    scopeLoading: filter.scopeLoading,
    scopeNewCounts: filter.scopeNewCounts,
    allNewCount: filter.allNewCount,
    setScope: filter.setScope,
    displayOrders: filter.displayOrders,
    onSaveFilter: filter.onSaveFilter,
    onCancelFilter: filter.onCancelFilter,
    onRemoveRegion: filter.onRemoveRegion,
    // List sync
    sentinel,
    listRoot,
    // Booking
    ...booking,
    // Chat
    ...chat,
    // Moderation
    ...moderation,
    // Membership
    showJoinDialog: membership.showJoinDialog,
    showLeaveDialog: membership.showLeaveDialog,
    membershipLoading: membership.membershipLoading,
    joinMessage: membership.joinMessage,
    leaveMessage: membership.leaveMessage,
    groupTitle: membership.groupTitle,
    membershipGroup: membership.membershipGroup,
    isMemberOfOrder: membership.isMemberOfOrder,
    onJoinGroup: membership.onJoinGroup,
    onLeaveGroup: membership.onLeaveGroup,
    confirmJoin: membership.confirmJoin,
    confirmLeave: membership.confirmLeave,
    cancelMembership: membership.cancelMembership,
    // Botga qo'shish (admin)
    ...addToBot,
    onUnlock,
    unreadCount,
    isOrderSeen,
    markAllAsRead,
  }
}
