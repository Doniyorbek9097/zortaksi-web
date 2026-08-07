import type { IUser } from '~/types'
import { isAdminUser } from '~/utils/userRole'
import { isTariffActive } from '~/utils/tariffActive'

export type OrderTakeAccessRedirect = {
  path: string
  query: Record<string, string>
}

export type OrderTakeAccessPatch = {
  active?: boolean
  verified?: boolean
  tariffExpireAt?: string | Date | null
}

/** /me/order-take-access javobidan user cache yangilash */
export function patchUserFromOrderTakeAccess(
  user: IUser,
  data: OrderTakeAccessPatch,
): IUser {
  const next: IUser = {
    ...user,
    ...(data.active != null ? { active: !!data.active } : {}),
    ...(data.verified != null ? { verified: !!data.verified } : {}),
    ...(data.tariffExpireAt !== undefined
      ? { tariffExpireAt: data.tariffExpireAt }
      : {}),
  }

  // Server tarif faol deb tasdiqlagan — local isTariffActive uchun stub
  if (data.active && !next.tariff) {
    next.tariff = { name: 'Active', price: 0, expireDays: 0 }
  }

  return next
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
