/**
 * Telegram Mini App: orqaga (Back) history ichida ishlasin,
 * root'da bo'lmasa WebApp yopilmasin.
 */
import { scheduleTelegramStartRedirect } from '~/utils/telegramStartRedirect'
import { applyTelegramViewportInsets, wireTelegramViewportInsets } from '~/composables/useTelegramViewportInsets'

type TgBackButton = {
  show: () => void
  hide: () => void
  onClick: (cb: () => void) => void
  offClick: (cb: () => void) => void
  isVisible?: boolean
}

type TgSafeArea = { top?: number; bottom?: number; left?: number; right?: number }

type TgWebApp = {
  ready: () => void
  expand: () => void
  close: () => void
  platform?: string
  initData?: string
  viewportStableHeight?: number
  viewportHeight?: number
  isExpanded?: boolean
  BackButton: TgBackButton
  /** Qurilma notch / home indicator (Telegram chrome emas) */
  safeAreaInset?: TgSafeArea
  contentSafeAreaInset?: TgSafeArea
  onEvent?: (eventType: string, callback: () => void) => void
  offEvent?: (eventType: string, callback: () => void) => void
  disableVerticalSwipes?: () => void
  enableClosingConfirmation?: () => void
  disableClosingConfirmation?: () => void
}

/** Faqat device safe-area — contentSafeArea (~100px) e'tiborga olinmaydi */
function applyTelegramSafeAreaCss(tg: TgWebApp) {
  // Flutter WebView — host SafeArea; Telegram insetni yozib pastki bo'shliq ochilmasin
  if (document.documentElement.dataset.ztEmbed === 'webview') return
  const top = Math.min(Math.max(0, Number(tg.safeAreaInset?.top) || 0), 28)
  const bottom = Math.min(Math.max(0, Number(tg.safeAreaInset?.bottom) || 0), 34)
  const root = document.documentElement
  root.style.setProperty('--zt-safe-top', `${top}px`)
  root.style.setProperty('--zt-safe-bottom', `${bottom}px`)
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp }
  }
}

function loadTelegramScript(): Promise<void> {
  if (window.Telegram?.WebApp) return Promise.resolve()
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-telegram-web-app]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => resolve(), { once: true })
      // allaqachon yuklangan bo'lishi mumkin
      if (window.Telegram?.WebApp) resolve()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://telegram.org/js/telegram-web-app.js'
    s.async = true
    s.dataset.telegramWebApp = '1'
    s.onload = () => resolve()
    s.onerror = () => resolve()
    document.head.appendChild(s)
  })
}

function isInsideTelegram(tg: TgWebApp): boolean {
  if (tg.initData) return true
  const p = String(tg.platform || '')
  return !!p && p !== 'unknown'
}

/** Overlay / BottomSheet history qatlami (pushState) */
function hasOverlayHistoryLayer(): boolean {
  try {
    const state = window.history.state as Record<string, unknown> | null
    if (!state || typeof state !== 'object') return false
    if (state.sheet) return true
    return Object.keys(state).some((k) => k.startsWith('zt'))
  } catch {
    return false
  }
}

/** Vue Router yoki overlay — orqaga qaytish mumkinmi */
function canGoBackInApp(): boolean {
  if (hasOverlayHistoryLayer()) return true
  try {
    const state = window.history.state as { back?: unknown; position?: number } | null
    if (state && state.back != null) return true
    if (typeof state?.position === 'number' && state.position > 0) return true
  } catch {
    /* */
  }
  return false
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  void loadTelegramScript().then(() => {
    const tg = window.Telegram?.WebApp
    if (!tg || !isInsideTelegram(tg)) return

    try {
      tg.ready()
      tg.expand()
      // Tasodifan yopilishni kamaytiradi (ixtiyoriy API)
      tg.enableClosingConfirmation?.()
    } catch {
      /* eski client */
    }

    // Pastki/yuqori bo'sh joy: faqat device inset (Telegram panel emas)
    try {
      applyTelegramSafeAreaCss(tg)
      applyTelegramViewportInsets()
      wireTelegramViewportInsets()
      tg.onEvent?.('safeAreaChanged', () => applyTelegramSafeAreaCss(tg))
      tg.onEvent?.('contentSafeAreaChanged', () => applyTelegramSafeAreaCss(tg))
    } catch {
      /* */
    }

    const router = useRouter()
    // SDK yuklangach start_param ishonchli bo'ladi; kechikkan holatni ham tutib olamiz.
    scheduleTelegramStartRedirect(router)

    const syncBackButton = () => {
      try {
        if (canGoBackInApp()) tg.BackButton.show()
        else tg.BackButton.hide()
      } catch {
        /* */
      }
    }

    const onTgBack = () => {
      // Dialog/overlay ochiq bo'lsa — faqat uni yopish (sahifa emas)
      if (hasOverlayHistoryLayer()) {
        history.back()
        return
      }
      if (canGoBackInApp()) {
        router.back()
        return
      }
      // Root — WebApp yopilsin
      try {
        tg.close()
      } catch {
        /* */
      }
    }

    tg.BackButton.onClick(onTgBack)

    router.afterEach(() => {
      // Router state yangilangach sync
      setTimeout(syncBackButton, 0)
    })

    // Brauzer/OS back (Telegram uni BackButton ga ulaydi)
    window.addEventListener('popstate', () => {
      setTimeout(syncBackButton, 0)
    })

    // Overlay pushState dan keyin BackButton ni ko'rsatish
    window.addEventListener('zt-history-layer', () => {
      setTimeout(syncBackButton, 0)
    })

    syncBackButton()
  })
})
