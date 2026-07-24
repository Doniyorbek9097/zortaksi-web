import { authCookieOptions } from '~/utils/authCookie'
import {
  resolveAuthToken,
  writeActiveSession,
  writeAuthCookie,
} from '~/utils/activeAccount'

/**
 * Ilova ochilganda Telegram session tekshiriladi.
 * Eskirgan / yaroqsiz bo'lsa token tozalanadi va /auth ga yo'naltiriladi.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token', { ...authCookieOptions })

  const resolved = resolveAuthToken(token.value)
  if (!resolved) return

  if (token.value !== resolved) {
    writeAuthCookie(resolved)
    token.value = resolved
  }

  try {
    // Middleware allaqachon user yuklagan bo'lsa ham sessionni qayta tekshiramiz
    await authStore.getMe({ authToken: resolved })
  } catch (e: any) {
    const status = e?.response?.status
    const code = e?.response?.data?.code
    if (status === 401 || status === 403 || code === 'SESSION_EXPIRED') {
      token.value = null
      writeAuthCookie(null)
      writeActiveSession(null, null)
      authStore.user = null
      await navigateTo('/auth')
    }
  }
})
