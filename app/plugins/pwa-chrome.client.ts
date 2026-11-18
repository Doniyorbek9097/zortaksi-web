import { isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice, isIosDevice } from '~/utils/devicePlatform'

/** Faqat PWA atributlari (CSS uchun), tema chrome yo‘q */
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

    syncDisplayAttrs()

    for (const mode of ['fullscreen', 'standalone', 'minimal-ui'] as const) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', syncDisplayAttrs)
      } catch {
        /* */
      }
    }
  },
})