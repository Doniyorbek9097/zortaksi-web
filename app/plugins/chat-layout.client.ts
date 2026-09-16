import { useAuthStore } from '~/stores/auth.store'
import { isFullscreenRoute, resolveRoutePageLayout } from '~/utils/pageLayoutRoute'

/**
 * Faqat fullscreen (chat) ↔ tab sahifalar o'tishida layout tiklanadi.
 * Har route da setPageLayout chaqirmaymiz — ikki layout ustma-ust tushmasin.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  const authStore = useAuthStore()

  router.beforeEach((to, from) => {
    const toFs = isFullscreenRoute(to.path)
    const fromFs = isFullscreenRoute(from.path)

    if (toFs) {
      setPageLayout(false)
      return
    }

    if (fromFs) {
      const layout = resolveRoutePageLayout(
        to.path,
        authStore.user,
        to.meta.layout,
      )
      setPageLayout(layout)
    }
  })
})
