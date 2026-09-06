import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

const TG_START_STORAGE = 'zt:tg-start-param'

/** Telegram Mini App start_param / startapp → ilova marshruti */
export function routeFromTelegramStartParam(
  raw: string | null | undefined,
): RouteLocationRaw | null {
  const param = String(raw || '').trim()
  if (!param) return null

  if (/^order_/i.test(param)) {
    const orderId = param.slice('order_'.length).trim()
    if (!orderId) return null
    return {
      path: '/driver/chat/open',
      query: {
        open: 'order',
        orderId,
        fromGroup: '1',
      },
    }
  }

  // 24 belgili Mongo ObjectId — zaxira
  if (/^[a-f0-9]{24}$/i.test(param)) {
    return {
      path: '/driver/chat/open',
      query: {
        open: 'order',
        orderId: param,
        fromGroup: '1',
      },
    }
  }

  if (param === 'dashboard' || param === 'driver') {
    return { path: '/driver/dashboard' }
  }

  return null
}

function decodeParamValue(raw: string): string {
  const text = String(raw || '').trim()
  if (!text) return ''
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

function parseStartParamFromInitData(raw: string): string {
  const text = String(raw || '').trim()
  if (!text) return ''

  const direct = text.match(/(?:^|[&?])start_param=([^&]+)/i)
  if (direct?.[1]) return decodeParamValue(direct[1])

  try {
    const params = new URLSearchParams(text)
    const fromParams = String(params.get('start_param') || '').trim()
    if (fromParams) return fromParams
  } catch {
    /* */
  }

  try {
    const decoded = decodeURIComponent(text)
    if (decoded !== text) return parseStartParamFromInitData(decoded)
  } catch {
    /* */
  }

  return ''
}

function readStartParamFromHash(): string {
  try {
    const hash = String(window.location.hash || '').replace(/^#/, '')
    if (!hash) return ''

    const hashParams = new URLSearchParams(hash)
    const direct = String(hashParams.get('tgWebAppStartParam') || '').trim()
    if (direct) return direct

    let webAppData = String(hashParams.get('tgWebAppData') || '').trim()
    for (let i = 0; i < 4 && webAppData; i++) {
      const fromData = parseStartParamFromInitData(webAppData)
      if (fromData) return fromData
      try {
        const next = decodeURIComponent(webAppData)
        if (next === webAppData) break
        webAppData = next
      } catch {
        break
      }
    }
  } catch {
    /* */
  }
  return ''
}

function readStartParamFromHref(): string {
  try {
    let href = String(window.location.href || '')
    for (let i = 0; i < 2; i++) {
      const m = href.match(/(?:start_param|tgWebAppStartParam)=([^&#]+)/i)
      if (m?.[1]) return decodeParamValue(m[1])
      try {
        const next = decodeURIComponent(href)
        if (next === href) break
        href = next
      } catch {
        break
      }
    }
  } catch {
    /* */
  }
  return ''
}

function readStartParamFromTelegramWebApp(): string {
  try {
    const tg = (
      window as Window & {
        Telegram?: {
          WebApp?: {
            initData?: string
            initDataUnsafe?: { start_param?: string }
          }
        }
      }
    ).Telegram?.WebApp
    if (!tg) return ''

    const fromUnsafe = String(tg.initDataUnsafe?.start_param || '').trim()
    if (fromUnsafe) return fromUnsafe

    const fromInit = parseStartParamFromInitData(String(tg.initData || ''))
    if (fromInit) return fromInit
  } catch {
    /* */
  }
  return ''
}

/** Hash / initData dan start_param ni o'qib sessionStorage ga yozadi */
export function captureTelegramStartParam(): string {
  if (!import.meta.client) return ''

  const found =
    readStartParamFromTelegramWebApp() ||
    readStartParamFromHash() ||
    readStartParamFromHref() ||
    ''

  if (found) {
    try {
      sessionStorage.setItem(TG_START_STORAGE, found)
    } catch {
      /* */
    }
    return found
  }

  try {
    return String(sessionStorage.getItem(TG_START_STORAGE) || '').trim()
  } catch {
    return ''
  }
}

export function readTelegramStartParam(): string {
  if (!import.meta.client) return ''
  return captureTelegramStartParam()
}

export function clearTelegramStartParamStorage(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(TG_START_STORAGE)
  } catch {
    /* */
  }
}

export function matchesTelegramStartRoute(
  to: RouteLocationNormalized,
  target: RouteLocationRaw,
): boolean {
  const path = String((target as { path?: string }).path || '')
  if (to.path !== path) return false
  const query = (target as { query?: Record<string, string> }).query || {}
  for (const [key, value] of Object.entries(query)) {
    if (String(to.query[key] || '') !== String(value)) return false
  }
  return true
}

/** Mini App start_param bo'lsa va hali to'g'ri sahifada emas — marshrut */
export function resolveTelegramStartNavigation(
  to: RouteLocationNormalized,
): RouteLocationRaw | null {
  // To'g'ridan-to'g'ri chat/open URL — start_param kerak emas
  if (to.path === '/driver/chat/open') {
    const orderId = String(to.query.orderId || '').trim()
    if (orderId && String(to.query.open || 'order') === 'order') {
      clearTelegramStartParamStorage()
      return null
    }
  }

  const target = routeFromTelegramStartParam(readTelegramStartParam())
  if (!target) return null
  if (matchesTelegramStartRoute(to, target)) {
    clearTelegramStartParamStorage()
    return null
  }
  return target
}

if (import.meta.client) {
  captureTelegramStartParam()
}
