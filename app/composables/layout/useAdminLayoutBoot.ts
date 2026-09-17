import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { useOrderStore } from '~/stores/order.store'
import { hasPanelShellAccess, resolveHomePath } from '~/utils/userRole'
import { TAB_LIST_KEEP } from '~/utils/memoryBudget'
import { preloadOrdersList } from '~/composables/orders/preloadOrdersList'

/**
 * Admin layout — sessiya tekshiruvi, statistika va chat badge.
 */
export function useAdminLayoutBoot() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const dashboardStore = useAdminDashboardStore()
  const orderStore = useOrderStore()

  watch(
    () => [authStore.sessionReady, authStore.user] as const,
    ([ready, user]) => {
      if (!import.meta.client || !ready) return
      if (user && !hasPanelShellAccess(user)) {
        void navigateTo(resolveHomePath(user), { replace: true })
      }
    },
    { immediate: true },
  )

  const refreshBadges = async () => {
    if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
    if (!hasPanelShellAccess(authStore.user)) return
    void orderStore.refreshNewCount()
    if (!chatStore.chats.length) {
      void chatStore.fetchChats({ page: 1, limit: TAB_LIST_KEEP }, { silent: true })
    }
    if (!orderStore.orders.length) {
      preloadOrdersList(orderStore)
    }
  }

  watch(
    () => authStore.sessionReady,
    (ready) => {
      if (!ready) return
      if (!authStore.user || !hasPanelShellAccess(authStore.user)) {
        void navigateTo(authStore.user ? resolveHomePath(authStore.user) : '/auth', { replace: true })
        return
      }
      dashboardStore.loadCached()
      void dashboardStore.fetchStats({ background: dashboardStore.isReady })
      orderStore.startRecentMinuteTicker()
      void refreshBadges()
      preloadOrdersList(orderStore)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    orderStore.stopRecentMinuteTicker()
  })
}
