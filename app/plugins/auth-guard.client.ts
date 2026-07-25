import { authCookieOptions } from '~/utils/authCookie'
import { clearAllAuthStorage, resolveAuthToken } from '~/utils/activeAccount'

/**
 * Pinia tayyor bo'lgach: cookie yo'q bo'lsa auth holatini tozalash.
 * enforce: 'pre' ishlatilmaydi — aks holda pinia._s xatosi.
 */
export default defineNuxtPlugin({
  name: 'auth-guard',
  setup() {
    const token = useCookie<string | null>('auth_token', { ...authCookieOptions })
    const auth = useAuthStore()
    const resolved = resolveAuthToken(token.value)

    if (!resolved) {
      auth.user = null
      token.value = null
      clearAllAuthStorage()
      return
    }

    // Cookie bor — eski hydrated user ishonchsiz
    auth.user = null
  },
})
