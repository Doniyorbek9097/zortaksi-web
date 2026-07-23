import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'

const STORAGE_KEY = 'zt_accounts'
const ACTIVE_KEY = 'zt_active_user'

/**
 * Accountlar faqat frontend localStorage'da saqlanadi. Har biri mustaqil login
 * (o'z JWT tokeni bilan). Ustiga bosilganda o'sha accountning tokeniga almashadi.
 */
export const useAccountStore = defineStore('account', () => {
    const accounts = ref<ILocalAccount[]>([])
    const isLoading = ref(false)

    /** Bitta cookie manbai — auth.store bilan bir xil opts */
    const token = useCookie<string | null>('auth_token', { ...authCookieOptions })

    const readActiveId = () => {
        if (!import.meta.client) return null
        try {
            return localStorage.getItem(ACTIVE_KEY)
        } catch {
            return null
        }
    }

    const writeActiveId = (userId: string | null) => {
        if (!import.meta.client) return
        try {
            if (userId) localStorage.setItem(ACTIVE_KEY, userId)
            else localStorage.removeItem(ACTIVE_KEY)
        } catch { /* private mode */ }
    }

    const activeUserId = computed(() => {
        const t = token.value
        if (t) {
            const byToken = accounts.value.find((a) => a.token === t)
            if (byToken) return String(byToken.userId)
        }

        // Token mos kelmasa (eski token / sync kechikishi) — saqlangan active id
        const saved = readActiveId()
        if (saved && accounts.value.some((a) => String(a.userId) === saved)) {
            return saved
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
        } catch { /* */ }
    }

    const load = () => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
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

    /** Cookie + auth.store ni birga yangilash (mobil Safari uchun muhim) */
    const applyToken = (authToken: string | null, userId?: string | null) => {
        const auth = useAuthStore()
        auth.user = null
        auth.token = authToken
        token.value = authToken
        if (userId) writeActiveId(String(userId))
        else if (!authToken) writeActiveId(null)

        // iOS/PWA: useCookie ba'zan reload dan oldin yozib ulgurmaydi
        if (import.meta.client) {
            const maxAge = 30 * 24 * 60 * 60
            const secure = window.location.protocol === 'https:' ? '; Secure' : ''
            if (authToken) {
                document.cookie = `auth_token=${authToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
            } else {
                document.cookie = `auth_token=; Path=/; Max-Age=0; SameSite=Lax${secure}`
            }
        }
    }

    const hardReload = (path = '/driver/profile') => {
        if (!import.meta.client) return
        // Cookie yozilishi uchun qisqa kutish (iOS Safari)
        window.setTimeout(() => {
            window.location.replace(path)
        }, 60)
    }

    const ensureCurrent = (user: any) => {
        if (!import.meta.client || !user?.userId || !token.value) {
            return
        }
        if (!accounts.value.length) load()
        const userId = String(user.userId)
        upsert({
            userId,
            token: token.value,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
        })
        writeActiveId(userId)
    }

    const digitsPhone = (phone?: string | null) => String(phone || '').replace(/\D/g, '')

    /** localStorage'da shu telefon / userId bo'lsa true */
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
                return {
                    success: false,
                    message: activated.message,
                }
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
                return {
                    success: false,
                    message: activated.message,
                }
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

    const switchAccount = (userId: string) => {
        if (!import.meta.client) return
        load()
        const target = String(userId)
        const acc = accounts.value.find((a) => String(a.userId) === target)
        if (!acc?.token) return

        // Allaqachon shu hisobda bo'lsa — chiqish
        if (String(activeUserId.value) === target && token.value === acc.token) return

        applyToken(acc.token, target)
        hardReload('/driver/profile')
    }

    const removeAccount = (userId: string) => {
        load()
        const target = String(userId)
        const wasActive = String(activeUserId.value || '') === target
        accounts.value = accounts.value.filter((a) => String(a.userId) !== target)
        persist()

        if (wasActive) {
            const next = accounts.value[0]
            if (next) {
                applyToken(next.token, String(next.userId))
                hardReload('/driver/profile')
            } else {
                applyToken(null)
                if (import.meta.client) window.location.replace('/')
            }
        }
    }

    return {
        accounts,
        isLoading,
        activeUserId,
        load,
        ensureCurrent,
        hasAccount,
        sendCode,
        verifyCode,
        verifyPassword,
        switchAccount,
        removeAccount,
    }
})
