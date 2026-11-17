import { isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import type { ThemeName } from '~/utils/themeChrome'

const SHIM_ID = 'zt-android-status-shim'
let metaGuardStarted = false

export function isAndroidPwaShell(): boolean {
  return import.meta.client && isAndroidDevice() && isPwaStandalone()
}

function readStatusBarInsetPx(): number {
  try {
    const probe = document.createElement('div')
    probe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);'
    document.body.appendChild(probe)
    const h = parseFloat(getComputedStyle(probe).paddingTop) || 0
    probe.remove()
    return h > 0 ? h : 28
  } catch {
    return 28
  }
}

/** Chrome fullscreen PWA da meta ba'zan yangilanmaydi — vizual qatlam */
export function updateAndroidStatusShim(color: string): void {
  if (!isAndroidPwaShell()) return
  let el = document.getElementById(SHIM_ID) as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = SHIM_ID
    el.setAttribute('aria-hidden', 'true')
    el.style.cssText =
      'position:fixed;top:0;left:0;right:0;z-index:2147483646;pointer-events:none;margin:0;padding:0;border:0;'
    document.body.prepend(el)
  }
  el.style.height = `${readStatusBarInsetPx()}px`
  el.style.backgroundColor = color
}

/** Nuxt / PWA qo‘shgan ortiqcha theme-color larni bitta qilib turadi */
export function startAndroidThemeColorGuard(getColor: () => string): void {
  if (!import.meta.client || !isAndroidDevice() || metaGuardStarted) return
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
  if (!import.meta.client || !isAndroidDevice()) return
  updateAndroidStatusShim(color)
}