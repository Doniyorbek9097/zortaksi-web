import { bootstrapAndroidPwaStatusBar } from '~/utils/pwaStatusBar'

/** Android PWA — Flutterdan ajratilgan erta status bar */
export default defineNuxtPlugin({
  name: 'pwa-android-status',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return
    bootstrapAndroidPwaStatusBar()
    const modes = ['standalone', 'fullscreen', 'minimal-ui'] as const
    for (const mode of modes) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', () => {
          bootstrapAndroidPwaStatusBar()
        })
      } catch {
        /* */
      }
    }
  },
})