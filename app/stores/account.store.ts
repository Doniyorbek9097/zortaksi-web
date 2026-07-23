import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'

const STORAGE_KEY = 'zt_accounts'

/**
 * Accountlar faqat frontend localStorage'da saqlanadi. Har biri mustaqil login
 * (o'z JWT tokeni bilan). Ustiga bosilganda o'sha accountning tokeniga almashadi.
 */
export const useAccountStore = defineStore('account', () => {
    const accounts = ref<ILocalAccount[]>([])
    const isLoading = ref(false)

    const token = useCookie('auth_token', { ...authCookieOptions })

    const activeUserId = computed(() => {
        const t = token.value
        if (!t) return null
        const hit = accounts.value.find((a) => a.token === t)
        return hit ? String(hit.userId) : null
    })

    const persist = () => {
        if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
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

    const ensureCurrent = (user: any) => {
        if (!import.meta.client || !user?.userId || !token.value) {
            return
        }
        if (!accounts.value.length) load()
        upsert({
            userId: String(user.userId),
            token: token.value,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
        })
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
        // Muhim: xotira bo'sh bo'lsa ham localStorage'dagi hisoblarni saqlab qolish
        load()

        if (hasAccount({ phone: user?.phoneNumber, userId: user?.userId })) {
            return {
                ok: false,
                message: 'Bu hisob allaqachon qo\'shilgan. Boshqa raqam kiriting.',
            }
        }

        upsert({
            userId: String(user.userId),
            token: authToken,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
        })
        token.value = authToken
        return { ok: true }
    }

    const switchAccount = (userId: string) => {
        load()
        const target = String(userId)
        const acc = accounts.value.find((a) => String(a.userId) === target)
        const sameToken = !!(acc && acc.token === token.value)
        if (!acc || sameToken) return

        // auth.store bilan bir xil cookie opts orqali yozish
        token.value = acc.token
        try {
            const auth = useAuthStore()
            auth.token = acc.token
        } catch { /* */ }

        if (import.meta.client) window.location.reload()
    }

    const removeAccount = (userId: string) => {
        load()
        const target = String(userId)
        const wasActive = activeUserId.value === target
        accounts.value = accounts.value.filter((a) => String(a.userId) !== target)
        persist()

        if (wasActive) {
            const next = accounts.value[0]
            if (next) {
                token.value = next.token
                try {
                    const auth = useAuthStore()
                    auth.token = next.token
                } catch { /* */ }
                if (import.meta.client) window.location.reload()
            } else {
                token.value = null
                if (import.meta.client) navigateTo('/')
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
