/**
 * Telegram ichida ochilgan saytni Chrome (Android) yoki Safari (iOS) ga ochish.
 */
import { isAndroidDevice, isIosDevice } from '~/utils/devicePlatform'
import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isTelegramMiniApp, mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

export const TG_BROWSER_QUERY = 'zt_browser'
export const TG_PWA_FROM_SESSION = 'zt-pwa-from-telegram'
export const TG_BROWSER_DISMISS_SESSION = 'zt-tg-browser-dismiss'
export const TG_PWA_INSTALL_DISMISS_SESSION = 'zt-pwa-install-dismiss'

type TgOpenLink = {
  openLink?: (url: string, options?: { try_instant_view?: boolean; try_browser?: boolean }) => void
}

/** Telegram Mini App yoki Telegram ichki brauzeri */
export function isTelegramWebContext(): boolean {
  if (!import.meta.client) return false
  if (isFlutterWebView() || isPwaStandalone()) return false
  if (isTelegramMiniApp() || mightBeTelegramMiniApp()) return true
  const ua = navigator.userAgent || ''
  if (/Telegram/i.test(ua)) return true
  return false
}

export function markPendingPwaInstallAfterBrowser(): void {
  try {
    sessionStorage.setItem(TG_PWA_FROM_SESSION, '1')
  } catch {
    /* */
  }
}

export function consumeTelegramBrowserEntry(): boolean {
  if (!import.meta.client) return false
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get(TG_BROWSER_QUERY) === '1') {
      markPendingPwaInstallAfterBrowser()
      params.delete(TG_BROWSER_QUERY)
      const qs = params.toString()
      const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`
      window.history.replaceState(window.history.state, '', next)
      return true
    }
    return sessionStorage.getItem(TG_PWA_FROM_SESSION) === '1'
  } catch {
    return false
  }
}

export function buildExternalBrowserUrl(href?: string): string {
  const raw = href || (import.meta.client ? window.location.href : '')
  try {
    const url = new URL(raw)
    url.searchParams.set(TG_BROWSER_QUERY, '1')
    return url.toString()
  } catch {
    return raw
  }
}

/** Chrome / Safari — bitta tugma */
export function openCurrentSiteInSystemBrowser(currentHref?: string): void {
  if (!import.meta.client) return
  const target = buildExternalBrowserUrl(currentHref)
  markPendingPwaInstallAfterBrowser()

  const tg = (window as Window & { Telegram?: { WebApp?: TgOpenLink } }).Telegram?.WebApp
  if (tg?.openLink) {
    try {
      tg.openLink(target, { try_instant_view: false, try_browser: true })
      return
    } catch {
      /* */
    }
  }

  if (isAndroidDevice()) {
    try {
      const stripped = target.replace(/^https?:\/\//i, '')
      const intent = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(target)};end`
      window.location.assign(intent)
      return
    } catch {
      /* */
    }
  }

  if (isIosDevice()) {
    window.location.assign(target)
    return
  }

  const opened = window.open(target, '_blank', 'noopener,noreferrer')
  if (!opened) window.location.assign(target)
}

export function browserLabelForPlatform(): { title: string; action: string; icon: string } {
  if (isIosDevice()) {
    return {
      title: 'Safari orqali oching',
      action: "Safari'da ochish",
      icon: 'fa-brands fa-safari',
    }
  }
  if (isAndroidDevice()) {
    return {
      title: 'Chrome orqali oching',
      action: "Chrome'da ochish",
      icon: 'fa-brands fa-chrome',
    }
  }
  return {
    title: 'Brauzerda oching',
    action: 'Brauzerda ochish',
    icon: 'fa-solid fa-arrow-up-right-from-square',
  }
}