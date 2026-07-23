import { authCookieOptions } from '~/utils/authCookie'

/**
 * Ilova ochilganda Telegram session tekshiriladi.
 * Eskirgan / yaroqsiz bo'lsa token tozalanadi va /auth ga yo'naltiriladi.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token', { ...authCookieOptions })

  if (!token.value) return

  try {
    // Middleware allaqachon user yuklagan bo'lsa ham sessionni qayta tekshiramiz
    await authStore.getMe()
  } catch (e: any) {
    const status = e?.response?.status
    const code = e?.response?.data?.code
    if (status === 401 || status === 403 || code === 'SESSION_EXPIRED') {
      token.value = null
      authStore.user = null
      await navigateTo('/auth')
    }
  }
})
