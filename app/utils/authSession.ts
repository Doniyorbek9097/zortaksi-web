import { getAuthCookieOptions } from '~/utils/authCookie'
import { resolveAuthToken } from '~/utils/activeAccount'
import { normalizePath } from '~/utils/driverTabRoutes'

/** Ro'yxatdan o'tmasdan ko'rish mumkin bo'lgan haydovchi sahifalari */
export const GUEST_DRIVER_PATHS = new Set([
  '/driver/dashboard',
  '/driver/profile',
  '/driver/download-app',
])

export function isGuestDriverPath(path: string): boolean {
  return GUEST_DRIVER_PATHS.has(normalizePath(path))
}

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
