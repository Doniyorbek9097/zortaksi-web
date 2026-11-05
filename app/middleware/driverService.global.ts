import { getAuthCookieOptions } from '~/utils/authCookie'
import { resolveAuthToken } from '~/utils/activeAccount'
import { isDriverAppAuthenticated, isGuestDriverPath } from '~/utils/authSession'

/**
 * Haydovchi ilovasi: dashboard/profil mehmon uchun ochiq;
 * qolgan /driver/* — Telegram ro'yxatdan o'tish (/auth).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/driver')) return
  if (isGuestDriverPath(to.path)) return

  const authStore = useAuthStore()
  if (!authStore.sessionReady) return

  if (isDriverAppAuthenticated()) return

  return navigateTo({ path: '/auth', query: { next: to.fullPath } })
})
