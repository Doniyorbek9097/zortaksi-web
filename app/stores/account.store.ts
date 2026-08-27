import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'
import { getAuthCookieOptions } from '~/utils/authCookie'
import {
  ACCOUNTS_KEY,
  MAX_LOCAL_ACCOUNTS,
  readActiveToken,
  readActiveUserId,
  resolveAuthToken,
  writeActiveSession,
  writeAuthCookie,
} from '~/utils/activeAccount'
import { normalizeUserRole, resolveHomePath } from '~/utils/userRole'
import { AUTH_API_TIMEOUT_MS, getApiErrorMessage } from '~/utils/apiError'

/**
 * Accountlar localStorage'da. Faol hisob — reactive ref + localStorage.
 * Switch: soft (getMe + navigateTo) — admin uchun hard reload SSR cookie bilan buziladi.
 */
export const useAccountStore = defineStore('account', () => {
  const accounts = ref<ILocalAccount[]>([])
  const isLoading = ref(false)
  const switching = ref(false)
  /** Reactive faol userId (localStorage o'zi Vue ni trigger qilmaydi) */
  const activeId = ref<string | null>(null)

  const token = useCookie<string | null>('auth_token', { ...getAuthCookieOptions() })

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
    // Avval LS (refresh manbai), keyin cookie — tartib muhim
    writeActiveSession(uid, authToken)
    token.value = authToken
    writeAuthCookie(authToken)

    const auth = useAuthStore()
    auth.user = null
    auth.token = authToken
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
      // API role ustun — eski local admin role qolib ketmasin
      role: user.role != null ? normalizeUserRole(user.role) : (existing?.role || 'driver'),
    })
    activeId.value = userId
    writeActiveSession(userId, authToken)
  }

  /**
   * Cookie dagi joriy sessiyani user bilan moslashtirish.
   * Cookie yo'q bo'lsa localStorage dan login qilmaydi (admin "tirilishi" yo'q).
   */
  const syncFromStorage = async (): Promise<boolean> => {
    if (!import.meta.client) return false
    load()
    const cookieToken = token.value
    if (!cookieToken) return false

    const auth = useAuthStore()
    if (auth.user) {
      ensureCurrent(auth.user)
      return false
    }

    try {
      await auth.getMe({ authToken: cookieToken })
      if (auth.user) {
        ensureCurrent(auth.user)
        return true
      }
    } catch { /* */ }
    return false
  }

  const digitsPhone = (phone?: string | null) => String(phone || '').replace(/\D/g, '')

  const isAtAccountLimit = () => accounts.value.length >= MAX_LOCAL_ACCOUNTS

  const accountLimitMessage = () =>
    `Bir qurilmada ${MAX_LOCAL_ACCOUNTS} tadan ortiq hisob qo‘shib bo‘lmaydi.`

  const hasAccount = (opts: { phone?: string | null; userId?: string | null }) => {
    load()
    const phone = digitsPhone(opts.phone)
    const userId = opts.userId != null ? String(opts.userId) : ''
    return accounts.value.some((a) => {
      // Tokensiz yozuv — qayta login uchun joy ochiq
      if (!a.token) return false
      if (userId && String(a.userId) === userId) return true
      if (phone && digitsPhone(a.phoneNumber) === phone) return true
      return false
    })
  }

  const authOpts = { timeout: AUTH_API_TIMEOUT_MS }

  const sendCode = async (phone: string, opts?: { forceSms?: boolean }) => {
    load()
    if (isAtAccountLimit() && !hasAccount({ phone })) {
      return { success: false, message: accountLimitMessage() }
    }
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    try {
      return await useApi('/send-code', {
        method: 'POST',
        body: { phone, forceSms: opts?.forceSms || undefined },
        ...authOpts,
      })
    } catch (error) {
      throw Object.assign(error as object, {
        userMessage: getApiErrorMessage(error, 'Kod yuborib bo\'lmadi'),
      })
    }
  }

  const verifyCode = async (phone: string, code: string) => {
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    try {
      const res = await useApi('/verify-code', { method: 'POST', body: { phone, code }, ...authOpts })
      if (res.success && res.data?.authToken) {
        const activated = activateNew(res.data.user, res.data.authToken)
        if (!activated.ok) return { success: false, message: activated.message }
      }
      return res
    } catch (error) {
      throw Object.assign(error as object, {
        userMessage: getApiErrorMessage(error, 'Kod tasdiqlanmadi'),
      })
    }
  }

  const verifyPassword = async (phone: string, password: string) => {
    if (hasAccount({ phone })) {
      return {
        success: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }
    try {
      const res = await useApi('/verify-password', {
        method: 'POST',
        body: { phone, password },
        ...authOpts,
      })
      if (res.success && res.data?.authToken) {
        const activated = activateNew(res.data.user, res.data.authToken)
        if (!activated.ok) return { success: false, message: activated.message }
      }
      return res
    } catch (error) {
      throw Object.assign(error as object, {
        userMessage: getApiErrorMessage(error, 'Parol tasdiqlanmadi'),
      })
    }
  }

  const activateNew = (user: any, authToken: string): { ok: true } | { ok: false; message: string } => {
    load()
    const userId = String(user.userId)
    const phone = digitsPhone(user?.phoneNumber)
    const existing = accounts.value.find(
      (a) =>
        String(a.userId) === userId ||
        (phone && digitsPhone(a.phoneNumber) === phone)
    )

    // Tokeni bor hisob — dublikat
    if (existing?.token) {
      return {
        ok: false,
        message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
      }
    }

    if (!existing && isAtAccountLimit()) {
      return { ok: false, message: accountLimitMessage() }
    }

    // Tokensiz eski yozuv yoki yangi — upsert
    upsert({
      userId,
      token: authToken,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role != null ? normalizeUserRole(user.role) : 'driver',
    })
    applyToken(authToken, userId)
    // Token qo'yildi — user hali null; getMe/finish sahifada yuklaydi
    return { ok: true }
  }

  const homeForUser = (user: { role?: string } | null | undefined) =>
    resolveHomePath(user)

  const reconnectSocket = () => {
    if (!import.meta.client) return
    try {
      const nuxt = useNuxtApp() as any
      if (typeof nuxt.$reconnectSocket === 'function') nuxt.$reconnectSocket()
    } catch { /* */ }
  }

  /**
   * Soft switch — xotira token + aniq Bearer.
   * Muvaffaqiyatli bo'lsa true.
   */
  const switchAccount = async (userId: string): Promise<boolean> => {
    if (!import.meta.client || switching.value) return false
    load()
    const target = String(userId)
    const acc = accounts.value.find((a) => String(a.userId) === target)
    if (!acc?.token) {
      console.warn('[account] switch: token yo\'q', target)
      return false
    }

    const auth = useAuthStore()
    const sameId = (a: unknown, b: unknown) => String(a ?? '') === String(b ?? '')

    if (
      sameId(activeUserId.value, target) &&
      auth.user &&
      sameId(auth.user.userId, target)
    ) {
      await navigateTo(homeForUser(auth.user), { replace: true })
      return true
    }

    switching.value = true
    const prevToken = resolveAuthToken(token.value)
    const prevId = activeUserId.value

    const restorePrev = async () => {
      if (!prevToken || !prevId) return
      applyToken(prevToken, String(prevId))
      try {
        await auth.getMe({ authToken: prevToken })
        if (auth.user) ensureCurrent(auth.user)
      } catch { /* */ }
    }

    try {
      // 1) Yangi hisob tokenini majburan o'rnatish
      applyToken(acc.token, target)
      writeAuthCookie(acc.token)
      token.value = acc.token
      try { auth.token = acc.token } catch { /* */ }

      // 2) Profil — Bearer = yangi token (Telegram live check endi /me ni to'smaydi)
      const res = await auth.getMe({ authToken: acc.token })
      const gotId =
        res?.data?.userId != null
          ? String(res.data.userId)
          : String(auth.user?.userId || '')

      if (!res?.success || !auth.user || !sameId(gotId, target)) {
        console.warn('[account] switch mismatch', { target, gotId, success: res?.success })
        await restorePrev()
        return false
      }

      // 3) Sinxron saqlash — LS + cookie bir xil (refresh SSR ham to'g'ri)
      const uid = String(auth.user.userId)
      ensureCurrent(auth.user)
      writeActiveSession(uid, acc.token)
      token.value = acc.token
      writeAuthCookie(acc.token)
      try { auth.token = acc.token } catch { /* */ }
      activeId.value = uid
      auth.sessionReady = true
      reconnectSocket()

      // Hard navigation — cookie brauzerga yozilgach toza yuklash (refresh flash yo'q)
      const dest = homeForUser(auth.user)
      if (import.meta.client) {
        window.location.assign(dest)
        return true
      }
      await navigateTo(dest, { replace: true })
      return true
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.message
      console.warn('[account] switch failed', status, msg)
      await restorePrev()
      return false
    } finally {
      switching.value = false
    }
  }

  const removeAccount = async (userId: string) => {
    if (!import.meta.client) return
    load()
    const target = String(userId)
    const wasActive = String(activeUserId.value || '') === target
      || String(readActiveUserId() || '') === target

    accounts.value = accounts.value.filter((a) => String(a.userId) !== target)

    try {
      if (accounts.value.length) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.value))
      } else {
        localStorage.removeItem(ACCOUNTS_KEY)
      }
    } catch { /* */ }

    if (!wasActive) return

    const next = accounts.value[0]
    if (next?.token) {
      await switchAccount(String(next.userId))
    }
    // Boshqa hisob yo'q — faol sessiya saqlanadi
  }

  /** Hisob yangi Telegramga ko'chirilgach — eski yozuvni olib, yangisini faol qilish */
  const completeMigration = (fromUserId: string, user: any, authToken: string) => {
    if (!import.meta.client || !user?.userId || !authToken) return
    load()
    const from = String(fromUserId)
    const to = String(user.userId)
    accounts.value = accounts.value.filter((a) => String(a.userId) !== from)
    upsert({
      userId: to,
      token: authToken,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      role: user.role != null ? normalizeUserRole(user.role) : 'driver',
    })
    applyToken(authToken, to)
    persist()
  }

  return {
    accounts,
    isLoading,
    switching,
    activeUserId,
    maxAccounts: MAX_LOCAL_ACCOUNTS,
    isAtAccountLimit,
    accountLimitMessage,
    load,
    ensureCurrent,
    syncFromStorage,
    hasAccount,
    sendCode,
    verifyCode,
    verifyPassword,
    switchAccount,
    removeAccount,
    completeMigration,
  }
})
