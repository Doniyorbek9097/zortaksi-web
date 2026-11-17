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

function purgeMediaThemeColorMetas(): void {
  document.querySelectorAll('meta[name="theme-color"][media]').forEach((node) => node.remove())
}

export function applyAndroidPwaMeta(mode: ThemeName): void {
  if (!isAndroidPwaForStatusBar()) return
  const status = STATUS_BAR_CHROME[mode]
  const pageBg = THEME_CHROME[mode]
  purgeMediaThemeColorMetas()

  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove())
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', status)
  meta.setAttribute('data-zt-pwa-status', '1')
  document.head.insertBefore(meta, document.head.firstChild)

  document.querySelectorAll('meta[name="color-scheme"]').forEach((node) => {
    if (!node.getAttribute('data-zt-pwa-status')) node.remove()
  })
  const scheme = document.createElement('meta')
  scheme.setAttribute('name', 'color-scheme')
  scheme.setAttribute('content', mode === 'light' ? 'light' : 'dark')
  scheme.setAttribute('data-zt-pwa-status', '1')
  document.head.insertBefore(scheme, meta.nextSibling)

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
}