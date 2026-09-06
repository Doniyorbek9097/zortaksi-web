import type { RouteLocationRaw } from 'vue-router'

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

  try {
    const hash = String(window.location.hash || '').replace(/^#/, '')
    const hashParams = new URLSearchParams(hash)
    const fromHash = String(hashParams.get('tgWebAppStartParam') || '').trim()
    if (fromHash) return fromHash
  } catch {
    /* */
  }

  try {
    const qs = new URLSearchParams(window.location.search)
    return String(qs.get('tgWebAppStartParam') || '').trim()
  } catch {
    return ''
  }
}
