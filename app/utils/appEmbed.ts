/**
 * Flutter WebView / PWA — APK yuklash tugmasini yashirish uchun.
 */

export function isFlutterWebView(): boolean {
  if (!import.meta.client) return false
  const w = window as Window & {
    flutter_inappwebview?: unknown
    FlutterWebView?: unknown
    flutterBytedanceWebView?: unknown
  }
  if (w.flutter_inappwebview != null || w.FlutterWebView != null) return true
  const ua = navigator.userAgent || ''
  if (/Flutter/i.test(ua)) return true
  try {
    if (new URLSearchParams(location.search).get('embed') === 'flutter') return true
    if (localStorage.getItem('zt-embed') === 'flutter') return true
  } catch {
    /* */
  }
  return false
}

/** Faqat haqiqiy PWA (bosh ekran) rejimi — $pwa heuristikasi ishlatilmaydi */
export function isPwaStandalone(): boolean {
  if (!import.meta.client) return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** Brauzerda ochilgan veb — APK yuklash ko'rsatiladi */
export function shouldShowApkDownload(): boolean {
  if (!import.meta.client) return false
  if (isFlutterWebView()) return false
  if (document.documentElement.dataset.ztEmbed === 'webview') return false
  if (isPwaStandalone()) return false
  return true
}
