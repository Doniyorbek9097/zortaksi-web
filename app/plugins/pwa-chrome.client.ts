import { applyBrowserChrome, resolveTheme } from '~/composables/useTheme'
import { isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice, isIosDevice } from '~/utils/devicePlatform'

/** PWA: erta status/nav chrome (manifest ochilish rangidan oldin) */
export default defineNuxtPlugin({
  name: 'pwa-chrome',
  enforce: 'pre',
  parallel: true,
  setup() {
    if (!import.meta.client) return

    const theme = useCookie<'light' | 'dark' | 'system'>('zt-theme', {
      default: () => 'system',
    })

    const syncDisplayAttrs = () => {
      const root = document.documentElement
      const standalone = isPwaStandalone()
      if (standalone) {
        root.dataset.ztPwa = '1'
        if (isAndroidDevice()) root.dataset.ztAndroid = '1'
        if (isIosDevice()) root.dataset.ztIos = '1'
      } else {
        delete root.dataset.ztPwa
        delete root.dataset.ztAndroid
        delete root.dataset.ztIos
      }
    }

    applyBrowserChrome(resolveTheme(theme.value))
    syncDisplayAttrs()

    for (const mode of ['fullscreen', 'standalone', 'minimal-ui'] as const) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', () => {
          syncDisplayAttrs()
          applyBrowserChrome(resolveTheme(theme.value))
        })
      } catch {
        /* */
      }
    }
  },
})