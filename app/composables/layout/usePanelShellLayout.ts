import { useAuthStore } from '~/stores/auth.store'
import { hasPanelShellAccess } from '~/utils/userRole'

/** Admin panel foydalanuvchilari uchun pastki tabbar — admin layout */
export function usePanelShellLayout() {
  const authStore = useAuthStore()

  watch(
    () => [authStore.sessionReady, authStore.user] as const,
    ([ready]) => {
      if (!ready || !import.meta.client) return
      setPageLayout(hasPanelShellAccess(authStore.user) ? 'admin' : 'driver')
    },
    { immediate: true },
  )
}
