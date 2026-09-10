import { notifyFlutterChrome, readTabbarChromeColor } from '~/utils/flutterChromeBridge'
import { isFlutterWebView } from '~/utils/appEmbed'
import { isMainTabHop } from '~/utils/driverTabRoutes'
import { releaseSessionMediaCache } from '~/composables/useVoiceMedia'

/**
 * Flutter WebView — theme va xotira optimizatsiyasi.
 * Og'ir MutationObserver o'rniga aniq eventlar.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client || !isFlutterWebView()) return

  const router = useRouter()

  router.afterEach((to, from) => {
    if (isMainTabHop(from.path, to.path)) {
      releaseSessionMediaCache()
    }

    requestAnimationFrame(() => {
      const nav = readTabbarChromeColor()
      notifyFlutterChrome(nav ? { nav } : undefined, 120)
    })
  })

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => {
      notifyFlutterChrome(undefined, 150)
    })
  })
})
