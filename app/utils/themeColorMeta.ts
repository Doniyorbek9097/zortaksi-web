import { applyPwaImmersiveChrome, shouldApplyPwaStatusBarChrome } from '~/utils/pwaStatusBar'
import { IOS_STATUS_BAR_STYLE, type ThemeName } from '~/utils/themeChrome'

const IOS_STATUS_ID = 'zt-ios-status-meta'

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

/** PWA immersive — status bar rang emas, fullscreen */
export function scheduleThemeColorRepaint(mode: ThemeName, _statusBarColor: string, _pageBg?: string): void {
  if (!import.meta.client) return
  if (!shouldApplyPwaStatusBarChrome()) return

  const apply = () => {
    applyPwaImmersiveChrome(mode)
    replaceIosStatusBarMeta(mode)
  }
  apply()
  requestAnimationFrame(apply)
  window.setTimeout(apply, 0)
  window.setTimeout(apply, 120)
}