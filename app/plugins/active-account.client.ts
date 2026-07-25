import { readActiveToken, writeAuthCookie } from '~/utils/activeAccount'
import { authCookieOptions } from '~/utils/authCookie'

/**
 * Sahifa ochilishi bilan localStorage dagi faol hisob tokenini
 * cookie + auth.store ga sinxronlaydi.
 */
export default defineNuxtPlugin({
  name: 'active-account-sync',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return

    const stored = readActiveToken()
    if (!stored) return

    const cookie = useCookie<string | null>('auth_token', { ...authCookieOptions })
    if (cookie.value === stored) return

    writeAuthCookie(stored)
    cookie.value = stored

    try {
      const auth = useAuthStore()
      // Boshqa hisob tokeni — eski user (masalan admin) bilan aralashmasin
      auth.user = null
      auth.token = stored
    } catch { /* */ }
  },
})
