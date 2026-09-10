import { THEME_CHROME, type ThemeName } from '~/composables/useTheme'
import { isFlutterWebView } from '~/utils/appEmbed'

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

/**
 * Flutter status/nav bar — faqat aniq o'zgarishda (MutationObserver o'rniga).
 */
export function notifyFlutterChrome(payload?: FlutterChromePayload, debounceMs = 80) {
  if (!import.meta.client || !isFlutterWebView()) return

  if (payload?.nav) {
    document.documentElement.dataset.ztChromeNav = payload.nav
  }

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    const value = buildPayload(payload)
    if (value === lastSent) return
    lastSent = value

    const w = window as Window & {
      __zortaksiLastTheme?: string
      flutter_inappwebview?: { callHandler: (name: string, ...args: unknown[]) => void }
    }

    w.__zortaksiLastTheme = value

    try {
      w.flutter_inappwebview?.callHandler?.('themeChanged', value)
    } catch {
      /* bridge hali tayyor emas */
    }
  }, debounceMs)
}
