import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { hasPanelShellAccess, resolveHomePath } from '~/utils/userRole'

/**
 * Admin layout — sessiya tekshiruvi, statistika va chat badge.
 */
export function useAdminLayoutBoot() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const dashboardStore = useAdminDashboardStore()

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
    if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 20 })
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
      void refreshBadges()
    },
    { immediate: true },
  )
}
