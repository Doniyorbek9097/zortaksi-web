import { bootstrapPwaStatusBarChrome } from '~/utils/pwaStatusBar'

/** Android PWA: status bar theme-color (Flutter emas) */
export default defineNuxtPlugin({
  name: 'pwa-android-status',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return
    bootstrapPwaStatusBarChrome()
    const modes = ['standalone', 'fullscreen', 'minimal-ui'] as const
    for (const mode of modes) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', () => {
          bootstrapPwaStatusBarChrome()
        })
      } catch {
        /* */
      }
    }
  },
})