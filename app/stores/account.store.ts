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
 * Accountlar localStorage'da. Almashtirish localStorage token orqali
 * (mobil Safari cookie ga tayanmaydi).
 */
export const useAccountStore = defineStore('account', () => {
  const accounts = ref<ILocalAccount[]>([])
  const isLoading = ref(false)
  const switching = ref(false)

  const token = useCookie<string | null>('auth_token', { ...authCookieOptions })

  const activeUserId = computed(() => {
    const saved = readActiveUserId()
    if (saved && accounts.value.some((a) => String(a.userId) === saved)) {
      return saved
    }

    const t = resolveAuthToken(token.value)
    if (t) {
      const byToken = accounts.value.find((a) => a.token === t)
      if (byToken) return String(byToken.userId)
    }

    try {
      const auth = useAuthStore()
      const uid = auth.user?.userId
      if (uid && accounts.value.some((a) => String(a.userId) === String(uid))) {
        return String(uid)
      }
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
    writeActiveSession(userId ? String(userId) : null, authToken)
    writeAuthCookie(authToken)

    const auth = useAuthStore()
    auth.user = null
    auth.token = authToken
    token.value = authToken
  }

  const reconnectSocket = () => {
    if (!import.meta.client) return
    try {
      const nuxt = useNuxtApp() as any
      if (typeof nuxt.$reconnectSocket === 'function') {
        nuxt.$reconnectSocket()
        return
      }
    } catch { /* */ }
  }

  const ensureCurrent = (user: any) => {
    if (!import.meta.client || !user?.userId) return
    const authToken = resolveAuthToken(token.value)
    if (!authToken) return
    if (!accounts.value.length) load()

    const userId = String(user.userId)
    upsert({
      userId,
      token: authToken,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
    })
    writeActiveSession(userId, authToken)
  }

  /**
   * Cookie/SSR noto'g'ri user yuklagan bo'lsa — localStorage dagi
   * faol hisobga qaytaradi.
   */
  const syncFromStorage = async (): Promise<boolean> => {
    if (!import.meta.client) return false
    load()
    const activeId = readActiveUserId()
    const storedToken = readActiveToken()
    if (!activeId || !storedToken) return false

    const auth = useAuthStore()
    if (auth.user && String(auth.user.userId) === activeId && token.value === storedToken) {
      return false
    }

    applyToken(storedToken, activeId)
    try {
      await auth.getMe()
      ensureCurrent(auth.user)
      reconnectSocket()
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
      if (!activated.ok) {
        return { success: false, message: activated.message }
      }
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
      if (!activated.ok) {
        return { success: false, message: activated.message }
      }
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
    })
    applyToken(authToken, userId)
    return { ok: true }
  }

  /** Soft switch — reload yo'q (mobil uchun ishonchli) */
  const switchAccount = async (userId: string) => {
    if (!import.meta.client || switching.value) return
    load()
    const target = String(userId)
    const acc = accounts.value.find((a) => String(a.userId) === target)
    if (!acc?.token) return

    if (String(activeUserId.value) === target) {
      const auth = useAuthStore()
      if (auth.user && String(auth.user.userId) === target) return
    }

    switching.value = true
    try {
      applyToken(acc.token, target)
      const auth = useAuthStore()
      await auth.getMe()
      ensureCurrent(auth.user)
      reconnectSocket()
    } catch (e) {
      console.warn('[account] switch failed', e)
    } finally {
      switching.value = false
    }
  }

  const removeAccount = async (userId: string) => {
    load()
    const target = String(userId)
    const wasActive = String(activeUserId.value || '') === target
    accounts.value = accounts.value.filter((a) => String(a.userId) !== target)
    persist()

    if (!wasActive) return

    const next = accounts.value[0]
    if (next) {
      await switchAccount(String(next.userId))
    } else {
      applyToken(null)
      if (import.meta.client) await navigateTo('/')
    }
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
