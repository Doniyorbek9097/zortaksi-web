import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import { scheduleThemeColorRepaint } from '~/utils/themeColorMeta'
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

function clearLegacyPwaStatusChrome(): void {
  document.getElementById(COLOR_SCHEME_STYLE_ID)?.remove()
  document
    .querySelectorAll('meta[name="theme-color"][data-zt-pwa-status], meta[name="color-scheme"][data-zt-pwa-status]')
    .forEach((node) => node.remove())
  delete document.documentElement.dataset.ztStatusIcons
}

/** PWA: ilova temasi bo‘yicha meta (qurilma `only light/dark` majburiyati yo‘q) */
export function applyPwaStatusBarChrome(mode: ThemeName): void {
  if (!shouldApplyPwaStatusBarChrome()) return
  clearLegacyPwaStatusChrome()
  scheduleThemeColorRepaint(mode, STATUS_BAR_CHROME[mode], THEME_CHROME[mode])
}

export function bootstrapPwaStatusBarChrome(): void {
  if (!shouldApplyPwaStatusBarChrome()) return
  const mode =
    document.documentElement.classList.contains('dark') ||
    document.documentElement.dataset.ztTheme === 'dark'
      ? 'dark'
      : 'light'
  applyPwaStatusBarChrome(mode)
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