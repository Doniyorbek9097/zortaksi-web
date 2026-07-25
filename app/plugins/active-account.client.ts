import {
  readActiveToken,
  writeActiveSession,
  writeAuthCookie,
} from '~/utils/activeAccount'
import { authCookieOptions } from '~/utils/authCookie'

/**
 * Sessiya manbai — cookie.
 * localStorage dagi eski admin tokenini cookie ga yozib
 * boshqa userni admin qilib yubormaslik.
 */
export default defineNuxtPlugin({
  name: 'active-account-sync',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return

    const cookie = useCookie<string | null>('auth_token', { ...authCookieOptions })

    // Cookie yo'q — faol localStorage sessiyasini ham o'chirish (tiriltirmaslik)
    if (!cookie.value) {
      const orphan = readActiveToken()
      if (orphan) {
        writeActiveSession(null, null)
      }
      return
    }

    // Cookie bor — localStorage ni cookie bilan moslashtirish (aksincha emas)
    const stored = readActiveToken()
    if (stored && stored !== cookie.value) {
      // Eski LS token cookie dan farq qilsa — cookie ustun, LS ni yangilash
      // (userId keyin getMe/ensureCurrent da to'ldiriladi)
      writeAuthCookie(cookie.value)
      try {
        const auth = useAuthStore()
        if (auth.token !== cookie.value) {
          auth.user = null
          auth.token = cookie.value
        }
      } catch { /* */ }
    }
  },
})
