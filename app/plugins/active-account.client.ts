import {
  findUserIdByToken,
  readActiveToken,
  readActiveUserId,
  syncSelectedAccountToCookie,
  writeActiveSession,
} from '~/utils/activeAccount'
import { migrateLegacyOrderFilterToUser } from '~/utils/orderFilterKeywords'
import { getAuthCookieOptions } from '~/utils/authCookie'

/**
 * Cookie bor + LS da tanlov bor → cookie ni tanlovga moslashtirish.
 * Cookie yo'q → LS dan tiriltirmaslik.
 */
export default defineNuxtPlugin({
  name: 'active-account-sync',
  setup() {
    const cookie = useCookie<string | null>('auth_token', { ...getAuthCookieOptions() })

    try {
      useAuthStore().sessionReady = false
    } catch { /* */ }

    if (!cookie.value) {
      const orphan = readActiveToken()
      if (orphan) writeActiveSession(null, null)
      return
    }

    const selected = syncSelectedAccountToCookie((t) => {
      cookie.value = t
    })
    if (selected) {
      try {
        const auth = useAuthStore()
        auth.token = selected.token
        auth.user = null
      } catch { /* */ }
      const activeUid = readActiveUserId()
      if (activeUid) migrateLegacyOrderFilterToUser(activeUid)
      return
    }

    const uid = findUserIdByToken(cookie.value)
    if (uid) writeActiveSession(uid, cookie.value)

    const activeUid = readActiveUserId()
    if (activeUid) migrateLegacyOrderFilterToUser(activeUid)
  },
})
