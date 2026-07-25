import { authCookieOptions } from '~/utils/authCookie'
import { clearAllAuthStorage, resolveAuthToken } from '~/utils/activeAccount'

/**
 * Cookie yo'q bo'lsa — auth tozalash.
 * Cookie bor + SSR dan user kelgan bo'lsa — saqlanadi (SSR foydali).
 * CDN leak Cache-Control: private bilan oldini olingan.
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
    }
  },
})
