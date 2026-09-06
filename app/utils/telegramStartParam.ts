import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

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

  if (param === 'dashboard' || param === 'driver') {
    return { path: '/driver/dashboard' }
  }

  return null
}

function parseStartParamFromInitData(raw: string): string {
  const text = String(raw || '').trim()
  if (!text) return ''
  try {
    const params = new URLSearchParams(text)
    const direct = String(params.get('start_param') || '').trim()
    if (direct) return direct
  } catch {
    /* */
  }
  try {
    const decoded = decodeURIComponent(text)
    const params = new URLSearchParams(decoded)
    return String(params.get('start_param') || '').trim()
  } catch {
    return ''
  }
}

function readStartParamFromHash(): string {
  try {
    const hash = String(window.location.hash || '').replace(/^#/, '')
    if (!hash) return ''
    const hashParams = new URLSearchParams(hash)
    const direct = String(hashParams.get('tgWebAppStartParam') || '').trim()
    if (direct) return direct
    const webAppData = String(hashParams.get('tgWebAppData') || '').trim()
    if (webAppData) {
      const fromData = parseStartParamFromInitData(webAppData)
      if (fromData) return fromData
    }
  } catch {
    /* */
  }
  return ''
}

export function readTelegramStartParam(): string {
  if (!import.meta.client) return ''

  try {
    const tg = (
      window as Window & {
        Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string } } }
      }
    ).Telegram?.WebApp
    const fromInit = String(tg?.initDataUnsafe?.start_param || '').trim()
    if (fromInit) return fromInit
  } catch {
    /* */
  }

  const fromHash = readStartParamFromHash()
  if (fromHash) return fromHash

  try {
    const qs = new URLSearchParams(window.location.search)
    return String(qs.get('tgWebAppStartParam') || '').trim()
  } catch {
    return ''
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
  const target = routeFromTelegramStartParam(readTelegramStartParam())
  if (!target) return null
  if (matchesTelegramStartRoute(to, target)) return null
  return target
}
