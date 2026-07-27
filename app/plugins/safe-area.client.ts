/**
 * Safe-area CSS o'zgaruvchilari.
 * Flutter / Android WebView — host allaqachon SafeArea beradi → webda 0.
 * Aks holda katta env() (50–100px+) tabbar ostida bo'shliq ochadi.
 */

const MAX_TOP = 28
const MAX_BOTTOM = 34

function isFlutterWebView(): boolean {
  if (!import.meta.client) return false
  const w = window as Window & {
    flutter_inappwebview?: unknown
    FlutterWebView?: unknown
    flutterBytedanceWebView?: unknown
  }
  if (w.flutter_inappwebview != null || w.FlutterWebView != null) return true
  const ua = navigator.userAgent || ''
  // Flutter WebView / InAppWebView odatda "Flutter" yozadi
  if (/Flutter/i.test(ua)) return true
  // Ilova ?embed=flutter yoki localStorage orqali belgilashi mumkin
  try {
    if (new URLSearchParams(location.search).get('embed') === 'flutter') return true
    if (localStorage.getItem('zt-embed') === 'flutter') return true
  } catch {
    /* */
  }
  return false
}

/** Android system WebView (Chrome Custom Tab emas) */
function isAndroidSystemWebView(): boolean {
  const ua = navigator.userAgent || ''
  if (!/Android/i.test(ua)) return false
  // "; wv)" — classic Android WebView belgisі
  if (/; wv\)/i.test(ua)) return true
  return false
}

function isTelegramMiniApp(): boolean {
  try {
    const tg = window.Telegram?.WebApp
    if (!tg) return false
    if (tg.initData) return true
    const p = String(tg.platform || '')
    return !!p && p !== 'unknown'
  } catch {
    return false
  }
}

function isIosStandalone(): boolean {
  const ua = navigator.userAgent || ''
  const ios = /iPhone|iPad|iPod/i.test(ua)
  if (!ios) return false
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standalone
}

/** env(safe-area-inset-*) ni px da o'qish */
function readEnvInset(side: 'top' | 'bottom'): number {
  try {
    const el = document.createElement('div')
    el.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;padding-${side}:env(safe-area-inset-${side},0px)`
    document.documentElement.appendChild(el)
    const raw = side === 'top' ? getComputedStyle(el).paddingTop : getComputedStyle(el).paddingBottom
    el.remove()
    const n = parseFloat(raw || '0')
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function setSafeVars(top: number, bottom: number) {
  const root = document.documentElement
  root.style.setProperty('--zt-safe-top', `${Math.max(0, top)}px`)
  root.style.setProperty('--zt-safe-bottom', `${Math.max(0, bottom)}px`)
}

export function applyZtSafeArea() {
  if (!import.meta.client) return

  // Flutter / host WebView — pastki padding kerak emas
  if (isFlutterWebView() || (isAndroidSystemWebView() && !isTelegramMiniApp())) {
    setSafeVars(0, 0)
    document.documentElement.dataset.ztEmbed = 'webview'
    return
  }

  document.documentElement.dataset.ztEmbed = isTelegramMiniApp() ? 'telegram' : 'browser'

  // Telegram o'z pluginida safeAreaInset beradi — shu yerda faqat fallback
  if (isTelegramMiniApp()) {
    const tg = window.Telegram?.WebApp
    const top = Math.min(Math.max(0, Number(tg?.safeAreaInset?.top) || 0), MAX_TOP)
    const bottom = Math.min(Math.max(0, Number(tg?.safeAreaInset?.bottom) || 0), MAX_BOTTOM)
    // Agar TG inset 0 bo'lsa env ham katta bo'lishi mumkin — env ni ham cap qilamiz
    if (top > 0 || bottom > 0) {
      setSafeVars(top, bottom)
      return
    }
  }

  // iOS PWA home indicator — kichik pad; oddiy brauzer / Flutter — 0
  if (isIosStandalone()) {
    setSafeVars(
      Math.min(readEnvInset('top'), MAX_TOP),
      Math.min(readEnvInset('bottom'), MAX_BOTTOM),
    )
    return
  }

  // Default: hech qanday pastki bo'shliq
  setSafeVars(0, 0)
}

export default defineNuxtPlugin(() => {
  applyZtSafeArea()
  // WebView ba'zan kech UA/bridge beradi
  requestAnimationFrame(() => applyZtSafeArea())
  setTimeout(() => applyZtSafeArea(), 300)
})
