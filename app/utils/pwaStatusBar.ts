import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import {
  PWA_IMMERSIVE_THEME_COLOR,
  STATUS_BAR_CHROME,
  THEME_CHROME,
  type ThemeName,
} from '~/utils/themeChrome'

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

/** PWA: status bar yo‘q / fullscreen — faqat sahifa foni */
export function applyPwaImmersiveChrome(mode: ThemeName): void {
  if (!shouldApplyPwaStatusBarChrome()) return

  const pageBg = THEME_CHROME[mode]
  purgeMediaThemeColorMetas()

  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove())
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('content', PWA_IMMERSIVE_THEME_COLOR)
  meta.setAttribute('data-zt-pwa-immersive', '1')
  document.head.insertBefore(meta, document.head.firstChild)

  document.getElementById(COLOR_SCHEME_STYLE_ID)?.remove()
  document.documentElement.style.backgroundColor = pageBg
  if (document.body) document.body.style.backgroundColor = pageBg
  document.documentElement.dataset.ztImmersive = '1'
}

export function bootstrapPwaImmersiveChrome(): void {
  if (!shouldApplyPwaStatusBarChrome()) return
  applyPwaImmersiveChrome(resolveModeFromCookie())
}

/** @deprecated — applyPwaImmersiveChrome */
export function bootstrapAndroidPwaStatusBar(): void {
  bootstrapPwaImmersiveChrome()
}

/** @deprecated — applyPwaImmersiveChrome */
export function applyAndroidPwaMeta(mode: ThemeName): void {
  applyPwaImmersiveChrome(mode)
}

export function pwaImmersiveThemeColor(): string {
  return PWA_IMMERSIVE_THEME_COLOR
}

export function pwaStatusBarColorForHead(mode: ThemeName): string {
  return shouldApplyPwaStatusBarChrome() ? PWA_IMMERSIVE_THEME_COLOR : STATUS_BAR_CHROME[mode]
}