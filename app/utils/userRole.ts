/** Backend `User.role`: admin | driver | customer */

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
  user?: { role?: string | null } | null
): boolean {
  return isAdminRole(user?.role)
}

/** Login / `/` / account switch — role bo'yicha asosiy sahifa */
export function resolveHomePath(
  user?: { role?: string | null } | null
): '/admin/dashboard' | '/driver/dashboard' {
  return isAdminUser(user) ? '/admin/dashboard' : '/driver/dashboard'
}

/**
 * `/auth?next=...` — faqat xavfsiz ichki yo'l.
 * Non-admin `/admin/*` ga o'tkazilmaydi.
 */
export function resolveSafeNextPath(
  next: unknown,
  user?: { role?: string | null } | null
): string | null {
  if (typeof next !== 'string' || !next) return null
  if (!next.startsWith('/') || next.startsWith('//')) return null
  if (next.startsWith('/auth')) return null
  if (next.startsWith('/admin') && !isAdminUser(user)) return null
  return next
}

/** next (agar ruxsat) yoki role home */
export function resolvePostAuthPath(
  user?: { role?: string | null } | null,
  next?: unknown
): string {
  return resolveSafeNextPath(next, user) || resolveHomePath(user)
}
