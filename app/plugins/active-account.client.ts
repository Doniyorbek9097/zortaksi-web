import {
  findUserIdByToken,
  readActiveToken,
  writeActiveSession,
} from '~/utils/activeAccount'
import { authCookieOptions } from '~/utils/authCookie'

/**
 * Cookie — sessiya manbai.
 * LS dagi active token cookie dan farq qilsa: LS ni cookie ga moslashtirish
 * (tozalash emas — aks holda account switch buziladi).
 * Cookie bo'sh bo'lsa active keys ni tozalash; zt_accounts saqlanadi.
 */
export default defineNuxtPlugin({
  name: 'active-account-sync',
  setup() {
    const cookie = useCookie<string | null>('auth_token', { ...authCookieOptions })

    if (!cookie.value) {
      const orphan = readActiveToken()
      if (orphan) writeActiveSession(null, null)
      return
    }

    const stored = readActiveToken()
    if (stored && stored === cookie.value) return

    // Cookie ustun — active session ni cookie tokeniga bog'lash
    const uid = findUserIdByToken(cookie.value)
    if (uid) {
      writeActiveSession(uid, cookie.value)
    }
  },
})
