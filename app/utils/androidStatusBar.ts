import { applyPwaStatusBarChrome, isAndroidPwaForStatusBar } from '~/utils/pwaStatusBar'
import type { ThemeName } from '~/utils/themeChrome'

let metaGuardStarted = false

/** Android PWA: vite-pwa / useHead qo‘shgan ortiqcha theme-color ni bosib turadi */
export function startAndroidThemeColorGuard(getMode: () => ThemeName): void {
  if (!isAndroidPwaForStatusBar() || metaGuardStarted) return
  metaGuardStarted = true

  const sync = () => {
    applyPwaStatusBarChrome(getMode())
  }

  sync()
  requestAnimationFrame(sync)

  const obs = new MutationObserver(() => {
    sync()
  })
  obs.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['content', 'name'],
  })

  window.addEventListener('focus', sync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sync()
  })
}

export function applyAndroidSystemUiTheme(mode: ThemeName): void {
  if (!isAndroidPwaForStatusBar()) return
  if (document.documentElement.dataset.ztEmbed === 'telegram') return
  applyPwaStatusBarChrome(mode)
}