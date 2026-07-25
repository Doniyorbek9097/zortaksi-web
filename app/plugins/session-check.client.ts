import { getAuthCookieOptions } from '~/utils/authCookie'
import { clearActiveAuth, resolveAuthToken } from '~/utils/activeAccount'

/**
 * JWT yaroqsiz bo'lsa chiqarish.
 * Telegram session yo'qligi — logout EMAS (account switch ishlashi uchun).
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token', { ...getAuthCookieOptions() })

  const resolved = resolveAuthToken(token.value)
  if (!resolved) return

  try {
    await authStore.getMe({ authToken: resolved })
  } catch (e: any) {
    const status = e?.response?.status
    // Faqat JWT/auth yo'qolganda — SESSION_EXPIRED endi /me dan kelmaydi
    if (status === 401 || status === 403) {
      token.value = null
      authStore.user = null
      clearActiveAuth()
      await navigateTo('/auth')
    }
  }
})
