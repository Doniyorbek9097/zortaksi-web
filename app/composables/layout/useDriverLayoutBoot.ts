import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { hasPanelShellAccess } from '~/utils/userRole'
import { TAB_LIST_KEEP } from '~/utils/memoryBudget'

/**
 * Haydovchi layout — badge yangilash, ticker va panel redirect.
 */
export function useDriverLayoutBoot() {
  const authStore = useAuthStore()
  const orderStore = useOrderStore()
  const chatStore = useChatStore()
  const { showAfterPayment } = useRegionGroupsWelcome()
  const route = useRoute()

  const refreshBadges = async () => {
    if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
    void orderStore.refreshNewCount()
    if (!chatStore.chats.length) {
      void chatStore.fetchChats({ page: 1, limit: TAB_LIST_KEEP }, { silent: true })
    }
  }

  onMounted(() => {
    orderStore.startRecentMinuteTicker()
    void refreshBadges()
    if (import.meta.client && sessionStorage.getItem('zt-show-region-groups')) {
      sessionStorage.removeItem('zt-show-region-groups')
      void showAfterPayment()
    }
  })

  onBeforeUnmount(() => {
    orderStore.stopRecentMinuteTicker()
  })

  watch(
    () => [authStore.sessionReady, authStore.user?.role, route.path] as const,
    ([ready, , path]) => {
      if (!ready || !import.meta.client) return
      if (hasPanelShellAccess(authStore.user) && path === '/driver/dashboard') {
        void navigateTo('/admin/dashboard', { replace: true })
      }
    },
    { immediate: true },
  )

  watch(
    () => [authStore.sessionReady, authStore.user?.userId] as const,
    ([ready, id]) => {
      if (ready && id) void refreshBadges()
    },
  )
}
