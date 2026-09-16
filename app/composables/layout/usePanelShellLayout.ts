import { useAuthStore } from '~/stores/auth.store'
import { resolveRoutePageLayout } from '~/utils/pageLayoutRoute'

/**
 * Keep-alive sahifalar qayta faollashganda layout tiklash.
 * Asosiy sinxronizatsiya — plugins/page-layout.client.ts
 */
export function usePanelShellLayout() {
  const authStore = useAuthStore()
  const route = useRoute()

  onActivated(() => {
    if (!import.meta.client) return
    const layout = resolveRoutePageLayout(
      route.path,
      authStore.user,
      route.meta.layout,
    )
    setPageLayout(layout)
  })
}
