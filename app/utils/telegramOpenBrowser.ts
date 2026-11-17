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

let telegramScriptLoad: Promise<void> | null = null

/** telegram-web-app.js — openLink uchun SDK kerak */
export function ensureTelegramWebAppScript(): Promise<void> {
  if (!import.meta.client) return Promise.resolve()
  if (window.Telegram?.WebApp) return Promise.resolve()
  if (telegramScriptLoad) return telegramScriptLoad

  telegramScriptLoad = new Promise((resolve) => {
    const done = () => resolve()
    const existing = document.querySelector<HTMLScriptElement>('script[data-telegram-web-app]')
    if (existing) {
      existing.addEventListener('load', done, { once: true })
      existing.addEventListener('error', done, { once: true })
      if (window.Telegram?.WebApp) done()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-web-app.js'
    s.async = true
    s.dataset.telegramWebApp = '1'
    s.onload = done
    s.onerror = done
    document.head.appendChild(s)
  })
  return telegramScriptLoad
}

/** Telegram Mini App yoki Telegram ichki brauzeri */
export function isTelegramWebContext(): boolean {
  if (!import.meta.client) return false
  if (isFlutterWebView() || isPwaStandalone()) return false

  if (document.documentElement.dataset.ztEmbed === 'telegram') return true
  if (isTelegramMiniApp() || mightBeTelegramMiniApp()) return true

  try {
    const tg = (window as Window & { Telegram?: { WebApp?: { initData?: string; platform?: string } } })
      .Telegram?.WebApp
    if (tg?.initData) return true
    const platform = String(tg?.platform || '')
    if (platform && platform !== 'unknown') return true
  } catch {
    /* */
  }

  const ua = navigator.userAgent || ''
  if (/Telegram/i.test(ua)) return true

  try {
    const blob = `${window.location.hash}${window.location.search}`
    if (/tgWebApp|tgWebAppData|tgWebAppVersion/i.test(blob)) return true
  } catch {
    /* */
  }

  try {
    if (/t\.me|telegram\.(org|me)/i.test(document.referrer || '')) return true
  } catch {
    /* */
  }

  return false
}

/** SDK yuklanishidan oldin ham Telegram ekanligiga ishonch */
export function likelyTelegramEntry(): boolean {
  if (!import.meta.client) return false
  if (isFlutterWebView() || isPwaStandalone()) return false
  if (mightBeTelegramMiniApp()) return true
  if (/Telegram/i.test(navigator.userAgent || '')) return true
  try {
    const blob = `${window.location.hash}${window.location.search}`
    if (/tgWebApp|tgWebAppData|start_param/i.test(blob)) return true
  } catch {
    /* */
  }
  try {
    if (/t\.me|telegram\.(org|me)/i.test(document.referrer || '')) return true
  } catch {
    /* */
  }
  return false
}

/** SDK yuklanmaguncha kutib, kontekstni aniqlash */
export async function resolveTelegramWebContext(maxWaitMs = 4500): Promise<boolean> {
  if (!import.meta.client) return false
  if (isTelegramWebContext()) return true

  const likely =
    mightBeTelegramMiniApp() ||
    /Telegram/i.test(navigator.userAgent || '') ||
    /tgWebApp/i.test(`${window.location.hash}${window.location.search}`)

  if (!likely) {
    await ensureTelegramWebAppScript()
    await new Promise((r) => setTimeout(r, 60))
    return isTelegramWebContext()
  }

  await ensureTelegramWebAppScript()
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    if (isTelegramWebContext()) return true
    await new Promise((r) => setTimeout(r, 100))
  }
  return isTelegramWebContext()
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

function openAndroidChromeIntent(target: string): void {
  try {
    const stripped = target.replace(/^https?:\/\//i, '')
    const chrome = `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(
      target,
    )};end`
    window.location.assign(chrome)
  } catch {
    /* */
  }
}

function openGenericBrowserView(target: string): void {
  try {
    const stripped = target.replace(/^https?:\/\//i, '')
    const view = `intent://${stripped}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
      target,
    )};end`
    window.location.assign(view)
  } catch {
    window.location.assign(target)
  }
}

/** Chrome / Safari — Android: intent birinchi (TMA openLink ichki brauzerda qoladi) */
export async function openCurrentSiteInSystemBrowser(currentHref?: string): Promise<void> {
  if (!import.meta.client) return
  const target = buildExternalBrowserUrl(currentHref)
  markPendingPwaInstallAfterBrowser()

  await ensureTelegramWebAppScript()

  const tg = (window as Window & { Telegram?: { WebApp?: TgOpenLink } }).Telegram?.WebApp
  const inTelegram = isTelegramWebContext()

  if (isAndroidDevice()) {
    openAndroidChromeIntent(target)
    window.setTimeout(() => openGenericBrowserView(target), 700)
    if (tg?.openLink && inTelegram) {
      window.setTimeout(() => {
        try {
          tg.openLink(target, { try_instant_view: false, try_browser: true })
        } catch {
          /* */
        }
      }, 1200)
    }
    return
  }

  if (isIosDevice()) {
    if (tg?.openLink) {
      try {
        tg.openLink(target, { try_instant_view: false, try_browser: true })
        return
      } catch {
        /* */
      }
      try {
        tg.openLink(target, { try_instant_view: false })
        return
      } catch {
        /* */
      }
    }
    window.location.assign(target)
    return
  }

  if (tg?.openLink) {
    try {
      tg.openLink(target, { try_instant_view: false, try_browser: true })
      return
    } catch {
      /* */
    }
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