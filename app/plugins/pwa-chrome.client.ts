import { applyBrowserChrome, useTheme } from '~/composables/useTheme'
import { isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice, isIosDevice } from '~/utils/devicePlatform'

/** PWA `data-zt-*` atributlari (tema — theme-boot.client.ts) */
export default defineNuxtPlugin({
  name: 'pwa-chrome',
  enforce: 'pre',
  parallel: true,
  setup() {
    if (!import.meta.client) return

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

    const syncChromeAfterDisplayChange = () => {
      syncDisplayAttrs()
      const { effectiveTheme } = useTheme()
      applyBrowserChrome(effectiveTheme.value)
    }

    syncDisplayAttrs()

    for (const mode of ['fullscreen', 'standalone', 'minimal-ui'] as const) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', syncChromeAfterDisplayChange)
      } catch {
        /* */
      }
    }
  },
})