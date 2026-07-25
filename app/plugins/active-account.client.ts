import {
  readActiveToken,
  writeActiveSession,
} from '~/utils/activeAccount'
import { authCookieOptions } from '~/utils/authCookie'

/**
 * Cookie yo'q bo'lsa localStorage faol sessiyasini tozalash.
 * LS → cookie "tiriltirish" YO'Q (boshqa user admin bo'lib kirib ketmasin).
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

    // Cookie ustun — LS dagi boshqa tokenni active qilib yozmaymiz
    const stored = readActiveToken()
    if (stored && stored !== cookie.value) {
      writeActiveSession(null, null)
    }
  },
})
