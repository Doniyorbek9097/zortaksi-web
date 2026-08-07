import type { IUser } from '~/types'
import { isAdminUser } from '~/utils/userRole'
import { isTariffActive } from '~/utils/tariffActive'

export type OrderTakeAccessRedirect = {
  path: string
  query: Record<string, string>
}

/** /driver/chat/open — buyurtmadan chat (tarif / ro'yxat talab qilinadi) */
export function isOrderTakeChatOpen(
  path: string,
  query: Record<string, unknown>,
): boolean {
  if (!path.startsWith('/driver/chat/open')) return false
  const mode = String(query.open || '').trim()
  const orderId = String(query.orderId || '').trim()
  const userId = String(query.userId || '').trim()
  return (mode === 'order' && !!orderId) || (mode === 'user' && !!userId)
}

/** Mijozni olish uchun ruxsat yo'q bo'lsa — auth yoki to'lov sahifasi */
export function resolveOrderTakeAccessRedirect(opts: {
  user?: IUser | null
  fullPath: string
}): OrderTakeAccessRedirect | null {
  const user = opts.user
  if (isAdminUser(user)) return null

  if (!user?.verified) {
    return { path: '/auth', query: { next: opts.fullPath } }
  }

  if (!isTariffActive(user)) {
    return { path: '/driver/payment', query: { tab: 'tariff', next: opts.fullPath } }
  }

  return null
}
