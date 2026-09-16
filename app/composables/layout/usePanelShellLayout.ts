import { useAuthStore } from '~/stores/auth.store'
import { hasPanelShellAccess } from '~/utils/userRole'

/** Admin panel foydalanuvchilari uchun pastki tabbar — admin layout */
export function usePanelShellLayout() {
  const authStore = useAuthStore()

  const apply = () => {
    if (!import.meta.client || !authStore.sessionReady) return
    setPageLayout(hasPanelShellAccess(authStore.user) ? 'admin' : 'driver')
  }

  watch(
    () => [authStore.sessionReady, authStore.user?.userId] as const,
    () => apply(),
    { immediate: true },
  )

  onActivated(() => apply())
}
