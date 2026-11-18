import { IOS_STATUS_BAR_STYLE, STATUS_BAR_CHROME, type ThemeName } from '~/utils/themeChrome'

/** PWA status bar — ilova temasi emas, qurilma (prefers-color-scheme) */
export function deviceUiTheme(): ThemeName {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyDeviceStatusBarChrome(): void {
  if (!import.meta.client) return
  const mode = deviceUiTheme()
  scheduleThemeColorRepaint(mode, STATUS_BAR_CHROME[mode])
}

const THEME_META_ID = 'zt-theme-color-meta'
const IOS_STATUS_ID = 'zt-ios-status-meta'

export function replaceThemeColorMeta(color: string): void {
  if (!import.meta.client) return
  document.querySelectorAll('meta[name="theme-color"][media]').forEach((node) => node.remove())
  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => {
    if (node.id !== THEME_META_ID) node.remove()
  })
  let el = document.getElementById(THEME_META_ID) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.id = THEME_META_ID
    el.name = 'theme-color'
    document.head.prepend(el)
  }
  el.content = color
}

export function replaceColorSchemeMeta(mode: ThemeName): void {
  if (!import.meta.client) return
  const value = mode === 'light' ? 'light' : 'dark'
  let el = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"][data-zt-meta]')
  if (!el) {
    el = document.createElement('meta')
    el.name = 'color-scheme'
    el.dataset.ztMeta = '1'
    document.head.prepend(el)
  }
  el.content = value
}

export function replaceIosStatusBarMeta(mode: ThemeName): void {
  if (!import.meta.client) return
  const style = IOS_STATUS_BAR_STYLE[mode]
  let el = document.getElementById(IOS_STATUS_ID) as HTMLMetaElement | null
  if (!el) {
    document
      .querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]')
      .forEach((node) => {
        if (node.id !== IOS_STATUS_ID) node.remove()
      })
    el = document.createElement('meta')
    el.id = IOS_STATUS_ID
    el.name = 'apple-mobile-web-app-status-bar-style'
    document.head.prepend(el)
  }
  el.content = style
}

export function scheduleThemeColorRepaint(
  mode: ThemeName,
  statusBarColor: string,
  _pageBg?: string,
): void {
  if (!import.meta.client) return

  const apply = () => {
    replaceThemeColorMeta(statusBarColor)
    replaceColorSchemeMeta(mode)
    replaceIosStatusBarMeta(mode)
  }

  apply()
  requestAnimationFrame(apply)
  window.setTimeout(apply, 0)
  window.setTimeout(apply, 120)
  window.setTimeout(apply, 400)
}