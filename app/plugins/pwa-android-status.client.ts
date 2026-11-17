import { bootstrapPwaImmersiveChrome } from '~/utils/pwaStatusBar'

/** PWA immersive — Flutter emas */
export default defineNuxtPlugin({
  name: 'pwa-android-status',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return
    bootstrapPwaImmersiveChrome()
    const modes = ['standalone', 'fullscreen', 'minimal-ui'] as const
    for (const mode of modes) {
      try {
        window.matchMedia(`(display-mode: ${mode})`).addEventListener('change', () => {
          bootstrapPwaImmersiveChrome()
        })
      } catch {
        /* */
      }
    }
  },
})