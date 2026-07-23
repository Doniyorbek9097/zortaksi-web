import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'
import {
  ACCOUNTS_KEY,
  readActiveToken,
  readActiveUserId,
  resolveAuthToken,
  writeActiveSession,
  writeAuthCookie,
} from '~/utils/activeAccount'

/**
 * Accountlar localStorage'da. Faol hisob — reactive ref + localStorage.
 * Switch: localStorage yoziladi, keyin hard reload (mobil uchun ishonchli).
 */
export const useAccountStore = defineStore('account', () => {
  const accounts = ref<ILocalAccount[]>([])
  const isLoading = ref(false)
  const switching = ref(false)
  /** Reactive faol userId (localStorage o'zi Vue ni trigger qilmaydi) */
  const activeId = ref<string | null>(null)

  const token = useCookie<string | null>('auth_token', { ...authCookieOptions })

  const activeUserId = computed(() => {
    if (activeId.value) return activeId.value
    const saved = readActiveUserId()
    if (saved) return saved
    try {
      const auth = useAuthStore()
      if (auth.user?.userId) return String(auth.user.userId)
    } catch { /* */ }
    return null
  })

  const persist = () => {
    if (!import.meta.client) return
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.value))
    } catch { /* */ }
  }

  const load = () => {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      accounts.value = (Array.isArray(parsed) ? parsed : []).map((a: ILocalAccount) => ({
        ...a,
        userId: String(a.userId),
      }))
    } catch {
      accounts.value = []
    }
    if (!activeId.value) {
      activeId.value = readActiveUserId()
    }
  }

  const upsert = (acc: ILocalAccount) => {
    const userId = String(acc.userId)
    const idx = accounts.value.findIndex((a) => String(a.userId) === userId)
    const next = { ...acc, userId }
    if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], ...next }
    else accounts.value.push(next)
    persist()
  }

  const applyToken = (authToken: string | null, userId?: string | null) => {
    const uid = userId ? String(userId) : null
    activeId.value = uid
    writeActiveSession(uid, authToken)
    writeAuthCookie(authToken)

    const auth = useAuthStore()
    auth.user = null
    auth.token = authToken
    token.value = authToken
  }

  const ensureCurrent = (user: any) => {
    if (!import.meta.client || !user?.userId) return
    const authToken = resolveAuthToken(token.value)
    if (!authToken) return
    if (!accounts.value.length) load()

    const userId = String(user.userId)
    const existing = accounts.value.find((a) => String(a.userId) === userId)
    upsert({
      userId,
      token: authToken,
      firstName: user.firstName ?? existing?.firstName,
      lastName: user.lastName ?? existing?.lastName,
      username: user.username ?? existing?.username,
      phoneNumber: user.phoneNumber ?? existing?.phoneNumber,
      avatar: user.avatar ?? existing?.avatar,
      role: user.role ?? existing?.role,
    })
    activeId.value = userId
    writeActiveSession(userId, authToken)
  }

  const syncFromStorage = async (): Promise<boolean> => {
    if (!import.meta.client) return false
    load()
    const wantId = readActiveUserId()
    const storedToken = readActiveToken()
    if (!wantId || !storedToken) return false

    activeId.value = wantId
    const auth = useAuthStore()
    if (auth.user && String(auth.user.userId) === wantId) {
      if (token.value !== storedToken) {
        token.value = storedToken
        writeAuthCookie(storedToken)
      }
      return false
    }

    applyToken(storedToken, wantId)
    try {
      await auth.getMe()
      if (auth.user && String(auth.user.userId) === wantId) {
        ensureCurrent(auth.user)
      }
      return true
    } catch {
      return false
    }
  }

  const digitsPhone = (phone?: string | null) => String(phone || '').replace(/\D/g, '')

  const hasAccount = (opts: { phone?: string | null; userId?: string | null }) => {
    load()
    const phone = digitsPhone(opts.phone)
    const userId = opts.userId != null ? String(opts.userId) : ''
    return accounts.value.some((a) => {
      if (userId && String(a.userId) === userId) return true
      if (phone && digitsPhone(a.phoneNumber) === phone) return true
      return false
    })
  }

  const sendCode = async (phone: string) => {
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    return useApi('/send-code', { method: 'POST', body: { phone } })
  }

  const verifyCode = async (phone: string, code: string) => {
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    const res = await useApi('/verify-code', { method: 'POST', body: { phone, code } })
    if (res.success && res.data?.authToken) {
      const activated = activateNew(res.data.user, res.data.authToken)
      if (!activated.ok) return { success: false, message: activated.message }
    }
    return res
  }

  const verifyPassword = async (phone: string, password: string) => {
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    const res = await useApi('/verify-password', { method: 'POST', body: { phone, password } })
    if (res.success && res.data?.authToken) {
      const activated = activateNew(res.data.user, res.data.authToken)
      if (!activated.ok) return { success: false, message: activated.message }
    }
    return res
  }

  const activateNew = (user: any, authToken: string): { ok: true } | { ok: false; message: string } => {
    load()
    if (hasAccount({ phone: user?.phoneNumber, userId: user?.userId })) {
      return {
        ok: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    const userId = String(user.userId)
    upsert({
      userId,
      token: authToken,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role,
    })
    applyToken(authToken, userId)
    return { ok: true }
  }

  /** Switch: token yoziladi → rolga qarab home */
  const homeForAccount = (acc: ILocalAccount) => {
    if (acc.role === 'admin') return '/admin/dashboard'
    return '/driver/profile'
  }

  const switchAccount = (userId: string) => {
    if (!import.meta.client || switching.value) return
    load()
    const target = String(userId)
    const acc = accounts.value.find((a) => String(a.userId) === target)
    if (!acc?.token) {
      console.warn('[account] switch: token yo\'q', target)
      return
    }

    if (String(activeUserId.value) === target) {
      try {
        const auth = useAuthStore()
        if (auth.user && String(auth.user.userId) === target) return
      } catch { /* */ }
    }

    switching.value = true
    applyToken(acc.token, target)
    // Admin → admin dashboard; haydovchi → profil
    // Rol noma'lum bo'lsa `/` — middleware /me dan keyin to'g'ri joyga yuboradi
    const dest = acc.role ? homeForAccount(acc) : '/'
    window.location.assign(dest)
  }

  const removeAccount = (userId: string) => {
    if (!import.meta.client) return
    load()
    const target = String(userId)
    const wasActive = String(activeUserId.value || '') === target
      || String(readActiveUserId() || '') === target

    // Ro'yxatdan olib tashlash
    accounts.value = accounts.value.filter((a) => String(a.userId) !== target)

    // localStorage ga darhol yozish
    try {
      if (accounts.value.length) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.value))
      } else {
        localStorage.removeItem(ACCOUNTS_KEY)
      }
    } catch { /* */ }

    // Faol bo'lmagan hisob — faqat ro'yxatdan o'chirildi, sessiya saqlanadi
    if (!wasActive) return

    // Faol hisob o'chirildi — boshqa hisob bo'lsa shunga o'tamiz
    const next = accounts.value[0]
    if (next?.token) {
      switching.value = true
      applyToken(next.token, String(next.userId))
      window.location.assign(next.role ? homeForAccount(next) : '/')
      return
    }

    // Boshqa hisob yo'q — faol sessiya saqlanadi (logout qilinmaydi)
    // Joriy token/cookie/user o'zgarishsiz qoladi
  }

  return {
    accounts,
    isLoading,
    switching,
    activeUserId,
    load,
    ensureCurrent,
    syncFromStorage,
    hasAccount,
    sendCode,
    verifyCode,
    verifyPassword,
    switchAccount,
    removeAccount,
  }
})
