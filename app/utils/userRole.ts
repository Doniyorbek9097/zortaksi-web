/** Backend `User.role`: admin | subadmin | driver | customer */

export type AppUserRole = 'admin' | 'subadmin' | 'driver' | 'customer'

export function normalizeUserRole(
  role?: string | null
): AppUserRole {
  const r = String(role || '').trim().toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'subadmin') return 'subadmin'
  if (r === 'customer') return 'customer'
  return 'driver'
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'admin'
}

export function isSubadminRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'subadmin'
}

export function isPanelRole(role?: string | null): boolean {
  const r = normalizeUserRole(role)
  return r === 'admin' || r === 'subadmin'
}

export function isAdminUser(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): boolean {
  return isAdminRole(user?.role)
}

/** Admin yoki faol subadmin — panel va buyurtmalar boshqaruvi */
export function isPanelUser(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): boolean {
  if (!user) return false
  if (isAdminRole(user.role)) return true
  if (!isSubadminRole(user.role) || !user.active) return false
  const exp = user.tariffExpireAt ? new Date(user.tariffExpireAt).getTime() : 0
  if (exp && !Number.isNaN(exp) && exp < Date.now()) return false
  return true
}

/** Login / `/` / account switch — role bo'yicha asosiy sahifa */
export function resolveHomePath(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): '/admin/dashboard' | '/driver/dashboard' {
  return isPanelUser(user) ? '/admin/dashboard' : '/driver/dashboard'
}

/**
 * `/auth?next=...` — faqat xavfsiz ichki yo'l.
 * Non-panel `/admin/*` ga o'tkazilmaydi.
 */
export function resolveSafeNextPath(
  next: unknown,
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): string | null {
  if (typeof next !== 'string' || !next) return null
  if (!next.startsWith('/') || next.startsWith('//')) return null
  if (next.startsWith('/auth')) return null
  if (next.startsWith('/admin') && !isPanelUser(user)) return null
  if (next.startsWith('/admin/subadmins') && !isAdminUser(user)) return null
  return next
}

/** next (agar ruxsat) yoki role home */
export function resolvePostAuthPath(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null,
  next?: unknown
): string {
  return resolveSafeNextPath(next, user) || resolveHomePath(user)
}
