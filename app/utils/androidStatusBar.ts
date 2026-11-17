import { isAndroidPwaForStatusBar } from '~/utils/pwaStatusBar'
import type { ThemeName } from '~/utils/themeChrome'

const SHIM_ID = 'zt-android-status-shim'
let metaGuardStarted = false

/** PWA: ortiqcha shim olib tashlandi — tizim paneli theme-color orqali */
export function updateAndroidStatusShim(_color: string): void {
  const el = document.getElementById(SHIM_ID)
  el?.remove()
}

/** Android PWA: theme-color bitta qoladi */
export function startAndroidThemeColorGuard(getColor: () => string): void {
  if (!isAndroidPwaForStatusBar() || metaGuardStarted) return
  metaGuardStarted = true

  const sync = () => {
    const color = getColor()
    const nodes = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
    for (const node of nodes) {
      if (node.content !== color) node.content = color
    }
    if (nodes.length === 0) {
      const el = document.createElement('meta')
      el.name = 'theme-color'
      el.content = color
      document.head.insertBefore(el, document.head.firstChild)
    } else if (nodes.length > 1) {
      for (let i = 1; i < nodes.length; i++) nodes[i].remove()
    }
    try {
      document.documentElement.style.setProperty('--theme-color', color)
    } catch {
      /* */
    }
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

export function applyAndroidSystemUiTheme(_mode: ThemeName, color: string): void {
  if (!isAndroidPwaForStatusBar()) return
  if (document.documentElement.dataset.ztEmbed === 'telegram') return
  updateAndroidStatusShim(color)
}