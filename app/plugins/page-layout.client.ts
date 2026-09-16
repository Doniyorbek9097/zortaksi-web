import { useAuthStore } from '~/stores/auth.store'
import { resolveRoutePageLayout } from '~/utils/pageLayoutRoute'

/**
 * setPageLayout() oldingi sahifadan qolishi mumkin (masalan chatda tabbar).
 * Har navigatsiyada route ga mos layout qayta o'rnatiladi.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  const authStore = useAuthStore()

  const syncLayout = (path: string, metaLayout?: unknown) => {
    const layout = resolveRoutePageLayout(path, authStore.user, metaLayout)
    setPageLayout(layout)
  }

  router.afterEach((to) => {
    syncLayout(to.path, to.meta.layout)
  })

  syncLayout(router.currentRoute.value.path, router.currentRoute.value.meta.layout)

  watch(
    () => authStore.user?.userId,
    () => {
      syncLayout(router.currentRoute.value.path, router.currentRoute.value.meta.layout)
    },
  )
})
