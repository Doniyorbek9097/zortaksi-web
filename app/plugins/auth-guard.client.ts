import { authCookieOptions } from '~/utils/authCookie'
import { clearActiveAuth, resolveAuthToken } from '~/utils/activeAccount'

/**
 * Cookie yo'q bo'lsa — joriy sessiyani tozalash (accountlar ro'yxati qoladi).
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
      clearActiveAuth()
    }
  },
})

