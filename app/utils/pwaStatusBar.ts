import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import { STATUS_BAR_CHROME, THEME_CHROME, type ThemeName } from '~/utils/themeChrome'

/** Faqat o‘rnatilgan PWA — Flutter / WebView / oddiy tab emas */
export function shouldApplyPwaStatusBarChrome(): boolean {
  if (!import.meta.client) return false
  if (isFlutterWebView()) return false
  if (document.documentElement.dataset.ztEmbed === 'webview') return false
  return isPwaStandalone()
}

export function isAndroidPwaForStatusBar(): boolean {
  return shouldApplyPwaStatusBarChrome() && isAndroidDevice()
}

/** Android PWA: cookie bo‘yicha erta theme-color (Flutterga tegmaydi) */
export function bootstrapAndroidPwaStatusBar(): void {
  if (!isAndroidPwaForStatusBar()) return
  try {
    const match = document.cookie.match(/(?:^|;\s*)zt-theme=([^;]+)/)
    const pref = match ? decodeURIComponent(match[1]) : 'system'
    const dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const mode: ThemeName = dark ? 'dark' : 'light'
    applyAndroidPwaMeta(mode)
  } catch {
    /* */
  }
}

export function applyAndroidPwaMeta(mode: ThemeName): void {
  if (!isAndroidPwaForStatusBar()) return
  const status = STATUS_BAR_CHROME[mode]
  const pageBg = THEME_CHROME[mode]
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.prepend(meta)
  }
  meta.setAttribute('content', status)
  let scheme = document.querySelector('meta[name="color-scheme"]')
  if (!scheme) {
    scheme = document.createElement('meta')
    scheme.setAttribute('name', 'color-scheme')
    document.head.prepend(scheme)
  }
  scheme.setAttribute('content', mode === 'light' ? 'light' : 'dark')
  document.documentElement.style.backgroundColor = pageBg
  document.documentElement.style.colorScheme = mode === 'light' ? 'only light' : 'only dark'
}