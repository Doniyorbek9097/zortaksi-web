import {
  findUserIdByToken,
  readActiveToken,
  syncSelectedAccountToCookie,
  writeActiveSession,
} from '~/utils/activeAccount'
import { getAuthCookieOptions } from '~/utils/authCookie'

/**
 * Tanlangan hisob (zt_active_*) — refreshdan keyin ham saqlansin.
 * Cookie bo'sh bo'lsa LS dan login qilinmaydi (xavfsizlik).
 * Cookie eski/oxirgi hisobda qolgan bo'lsa — LS dagi tanlov cookie ga yoziladi.
 */
export default defineNuxtPlugin({
  name: 'active-account-sync',
  setup() {
    const cookie = useCookie<string | null>('auth_token', { ...getAuthCookieOptions() })

    // 1) Tanlangan hisob LS da bor — cookie ni shunga moslashtir (oxirgi hisobga qaytmasin)
    if (cookie.value) {
      const selected = syncSelectedAccountToCookie((t) => {
        cookie.value = t
      })
      if (selected) {
        try {
          const auth = useAuthStore()
          auth.token = selected.token
          if (auth.user && String(auth.user.userId) !== selected.userId) {
            auth.user = null
          }
        } catch { /* pinia hali tayyor emas bo'lishi mumkin */ }
        return
      }

      // LS active yo'q — cookie dan active ni to'ldirish
      const uid = findUserIdByToken(cookie.value)
      if (uid) writeActiveSession(uid, cookie.value)
      return
    }

    // 2) Cookie yo'q — active keys ni tozalash (tiriltirmaslik)
    const orphan = readActiveToken()
    if (orphan) writeActiveSession(null, null)
  },
})
