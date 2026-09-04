/** Backend `User.role` — ilovada panel faqat admin */

export type AppUserRole = 'admin' | 'driver' | 'customer'

export function normalizeUserRole(
  role?: string | null
): AppUserRole {
  const r = String(role || '').trim().toLowerCase()
  if (r === 'admin') return 'admin'
  if (r === 'customer') return 'customer'
  return 'driver'
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'admin'
}

export function isAdminUser(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): boolean {
  return isAdminRole(user?.role)
}

/** Admin panel shell */
export function hasPanelShellAccess(
  user?: { role?: string | null } | null
): boolean {
  return isAdminRole(user?.role)
}

/** Admin panel va buyurtmalar boshqaruvi */
export function isPanelUser(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): boolean {
  return isAdminRole(user?.role)
}

/** Login / `/` / account switch — role bo'yicha asosiy sahifa */
export function resolveHomePath(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null
): '/admin/dashboard' | '/driver/dashboard' {
  return hasPanelShellAccess(user) ? '/admin/dashboard' : '/driver/dashboard'
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
  if (next.startsWith('/admin') && !hasPanelShellAccess(user)) return null
  return next
}

/** next (agar ruxsat) yoki role home */
export function resolvePostAuthPath(
  user?: { role?: string | null; active?: boolean; tariffExpireAt?: string | Date | null } | null,
  next?: unknown
): string {
  return resolveSafeNextPath(next, user) || resolveHomePath(user)
}
