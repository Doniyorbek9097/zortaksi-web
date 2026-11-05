import { getAuthCookieOptions } from '~/utils/authCookie'
import { resolveAuthToken } from '~/utils/activeAccount'

/** JWT + /me user — xizmatlar uchun */
export function isDriverAppAuthenticated(): boolean {
  const auth = useAuthStore()
  const token = useCookie<string | null>('auth_token', { ...getAuthCookieOptions() })
  return !!resolveAuthToken(token.value) && !!auth.user
}

export function navigateToServiceAuth(next?: string) {
  const route = useRoute()
  const target = next || route.fullPath
  return navigateTo({ path: '/auth', query: { next: target } })
}

/** Xizmat (to'lov, band qilish, chat…) — ro'yxatdan o'tish talab qilinadi */
export function requireServiceAuth(next?: string): boolean {
  if (isDriverAppAuthenticated()) return true
  void navigateToServiceAuth(next)
  return false
}
