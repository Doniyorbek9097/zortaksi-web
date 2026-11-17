import { isAndroidPwaForStatusBar } from '~/utils/pwaStatusBar'

/** Android PWA: pastki tizim paneli yashirish (fullscreen + birinchi tegishda) */
export default defineNuxtPlugin(() => {
  if (!import.meta.client || !isAndroidPwaForStatusBar()) return

  const root = document.documentElement

  const enterFullscreen = () => {
    try {
      if (document.fullscreenElement) return
      const req =
        root.requestFullscreen?.bind(root) ||
        (root as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
          .webkitRequestFullscreen?.bind(root)
      if (req) void req().catch(() => {})
    } catch {
      /* */
    }
  }

  window.addEventListener('touchend', enterFullscreen, { once: true, passive: true })
})