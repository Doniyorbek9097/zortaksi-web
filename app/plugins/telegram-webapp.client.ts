/**
 * Telegram Mini App: orqaga (Back) history ichida ishlasin,
 * root'da bo'lmasa WebApp yopilmasin.
 */
type TgBackButton = {
  show: () => void
  hide: () => void
  onClick: (cb: () => void) => void
  offClick: (cb: () => void) => void
  isVisible?: boolean
}

type TgWebApp = {
  ready: () => void
  expand: () => void
  close: () => void
  platform?: string
  initData?: string
  BackButton: TgBackButton
  disableVerticalSwipes?: () => void
  enableClosingConfirmation?: () => void
  disableClosingConfirmation?: () => void
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

    const router = useRouter()

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
