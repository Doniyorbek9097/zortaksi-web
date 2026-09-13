import { isFlutterWebView } from '~/utils/appEmbed'
import { THEME_CHROME, TABBAR_CHROME, type ThemeName } from '~/utils/themeChrome'

export { TABBAR_CHROME }

type FlutterChromePayload = {
  mode?: ThemeName
  status?: string
  nav?: string
}

function rgbToHex(raw: string): string {
  const c = String(raw || '').trim().toLowerCase()
  if (!c) return ''
  if (c.startsWith('#')) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
    return c.length >= 7 ? c.slice(0, 7) : c
  }
  const m = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return ''
  const h = (n: string) => {
    const v = Math.max(0, Math.min(255, parseInt(n, 10)))
    const s = v.toString(16)
    return s.length === 1 ? `0${s}` : s
  }
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`
}

/** Tabbar fon rangi — bir marta o'qiladi (DOM scan emas) */
export function readTabbarChromeColor(): string | undefined {
  if (!import.meta.client) return undefined
  const el = document.querySelector('.driver-tabbar, .admin-tabbar')
  if (!el) return undefined
  try {
    const hex = rgbToHex(getComputedStyle(el).backgroundColor)
    return hex || undefined
  } catch {
    return undefined
  }
}

function buildPayload(payload?: FlutterChromePayload): string {
  const root = document.documentElement
  const mode =
    payload?.mode ?? (root.classList.contains('dark') ? 'dark' : 'light')
  const status =
    payload?.status ??
    (root.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content?.trim() ||
      THEME_CHROME[mode])
  const nav = payload?.nav ?? root.dataset.ztChromeNav ?? readTabbarChromeColor() ?? status
  return `${mode}|${status}|${nav}`
}

let lastSent = ''
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function postThemeToFlutter(value: string) {
  if (value === lastSent) return
  lastSent = value

  const w = window as Window & {
    __zortaksiLastTheme?: string
    flutter_inappwebview?: { callHandler: (name: string, ...args: unknown[]) => void }
    __zortaksiNotifyFlutterChrome?: () => void
  }

  w.__zortaksiLastTheme = value

  try {
    w.flutter_inappwebview?.callHandler?.('themeChanged', value)
  } catch {
    /* bridge hali tayyor emas */
  }
}

/**
 * Flutter status/nav bar — theme almashtirishda darhol (debounce=0).
 */
export function notifyFlutterChrome(payload?: FlutterChromePayload, debounceMs = 0) {
  if (!import.meta.client || !isFlutterWebView()) return

  if (payload?.nav) {
    document.documentElement.dataset.ztChromeNav = payload.nav
  }

  const send = () => {
    postThemeToFlutter(buildPayload(payload))
  }

  if (debounceMs <= 0) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
    send()
    return
  }

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    send()
  }, debounceMs)
}
