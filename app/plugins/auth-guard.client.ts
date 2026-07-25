import { authCookieOptions } from '~/utils/authCookie'
import { clearAllAuthStorage, resolveAuthToken } from '~/utils/activeAccount'

/**
 * Ilova ochilishi bilan: cookie yo'q bo'lsa barcha auth holatini tozalash.
 * SSR/CDN dan "yopishgan" user qolmasin.
 */
export default defineNuxtPlugin({
  name: 'auth-guard',
  enforce: 'pre',
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

    // Cookie bor — hydrated user ishonchsiz, /me middlewareda yangilanadi
    auth.user = null
  },
})
