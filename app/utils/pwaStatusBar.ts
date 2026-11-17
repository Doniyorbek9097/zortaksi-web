import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import { STATUS_BAR_CHROME, THEME_CHROME, type ThemeName } from '~/utils/themeChrome'

const COLOR_SCHEME_STYLE_ID = 'zt-pwa-color-scheme'

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

function purgeMediaThemeColorMetas(): void {
  document.querySelectorAll('meta[name="theme-color"][media]').forEach((node) => node.remove())
}

function resolveModeFromCookie(): ThemeName {
  try {
    const match = document.cookie.match(/(?:^|;\s*)zt-theme=([^;]+)/)
    const pref = match ? decodeURIComponent(match[1]) : 'system'
    const dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    return dark ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** PWA: status bar fon = ilova light/dark (iconlar teskari kontrastda) */
export function applyPwaStatusBarChrome(mode: ThemeName): void {
  if (!shouldApplyPwaStatusBarChrome()) return

  const status = STATUS_BAR_CHROME[mode]
  const pageBg = THEME_CHROME[mode]
  purgeMediaThemeColorMetas()

  document
    .querySelectorAll('meta[name="theme-color"]:not([data-zt-pwa-status])')
    .forEach((node) => node.remove())
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-zt-pwa-status]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('data-zt-pwa-status', '1')
    meta.name = 'theme-color'
    document.head.prepend(meta)
  }
  meta.content = status

  let scheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"][data-zt-pwa-status]')
  if (!scheme) {
    scheme = document.createElement('meta')
    scheme.name = 'color-scheme'
    scheme.setAttribute('data-zt-pwa-status', '1')
    document.head.prepend(scheme)
  }
  scheme.content = mode === 'light' ? 'light' : 'dark'

  const schemeCss = mode === 'light' ? 'light only' : 'dark only'
  let styleEl = document.getElementById(COLOR_SCHEME_STYLE_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = COLOR_SCHEME_STYLE_ID
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `:root,html,body{color-scheme:${schemeCss}!important}`

  document.documentElement.style.backgroundColor = pageBg
  if (document.body) document.body.style.backgroundColor = pageBg
  document.documentElement.style.colorScheme = schemeCss
  if (document.body) document.body.style.colorScheme = schemeCss
  document.documentElement.dataset.ztStatusIcons = mode === 'light' ? 'dark' : 'light'
  delete document.documentElement.dataset.ztImmersive
  try {
    document.documentElement.style.setProperty('--zt-status-bar-bg', status)
    document.documentElement.style.setProperty('--theme-color', status)
  } catch {
    /* */
  }
}

export function bootstrapPwaStatusBarChrome(): void {
  if (!shouldApplyPwaStatusBarChrome()) return
  applyPwaStatusBarChrome(resolveModeFromCookie())
}

export function bootstrapPwaImmersiveChrome(): void {
  bootstrapPwaStatusBarChrome()
}

export function bootstrapAndroidPwaStatusBar(): void {
  bootstrapPwaStatusBarChrome()
}

export function applyAndroidPwaMeta(mode: ThemeName): void {
  applyPwaStatusBarChrome(mode)
}

export function applyPwaImmersiveChrome(mode: ThemeName): void {
  applyPwaStatusBarChrome(mode)
}