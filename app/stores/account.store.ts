import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'

const STORAGE_KEY = 'zt_accounts'

/**
 * Accountlar faqat frontend localStorage'da saqlanadi. Har biri mustaqil login
 * (o'z JWT tokeni bilan). Ustiga bosilganda o'sha accountning tokeniga almashadi.
 * Backendda "account" tushunchasi yo'q — har biri oddiy login qilingan foydalanuvchi.
 */
export const useAccountStore = defineStore('account', () => {
    const accounts = ref<ILocalAccount[]>([])
    const isLoading = ref(false)

    const token = useCookie('auth_token', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        watch: true,
        sameSite: 'lax',
    })

    // Hozir faol account — joriy token qaysi accountga tegishli
    const activeUserId = computed(
        () => accounts.value.find((a) => a.token === token.value)?.userId || null
    )

    // --- localStorage bilan ishlash ---
    const persist = () => {
        if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
    }

    const load = () => {
        if (!import.meta.client) return
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            accounts.value = raw ? JSON.parse(raw) : []
        } catch {
            accounts.value = []
        }
    }

    const upsert = (acc: ILocalAccount) => {
        const idx = accounts.value.findIndex((a) => a.userId === acc.userId)
        if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], ...acc }
        else accounts.value.push(acc)
        persist()
    }

    // Joriy login qilingan foydalanuvchini ro'yxatga qo'shib qo'yamiz (profil ochilganda)
    const ensureCurrent = (user: any) => {
        if (!import.meta.client || !user?.userId || !token.value) return
        upsert({
            userId: user.userId,
            token: token.value,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
        })
    }

    // --- Account qo'shish: LOGIN oqimi (auth endpointlari) ---
    const sendCode = (phone: string) => useApi('/send-code', { method: 'POST', body: { phone } })

    const verifyCode = async (phone: string, code: string) => {
        const res = await useApi('/verify-code', { method: 'POST', body: { phone, code } })
        if (res.success && res.data?.authToken) activateNew(res.data.user, res.data.authToken)
        return res
    }

    const verifyPassword = async (phone: string, password: string) => {
        const res = await useApi('/verify-password', { method: 'POST', body: { phone, password } })
        if (res.success && res.data?.authToken) activateNew(res.data.user, res.data.authToken)
        return res
    }

    // Yangi login qilingan accountni saqlab, o'shanga o'tamiz
    const activateNew = (user: any, authToken: string) => {
        upsert({
            userId: user.userId,
            token: authToken,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
        })
        token.value = authToken
    }

    // --- Almashtirish: shu accountning tokeniga o'tib, ilovani qayta yuklaymiz ---
    const switchAccount = (userId: string) => {
        const acc = accounts.value.find((a) => a.userId === userId)
        if (!acc || acc.token === token.value) return
        token.value = acc.token
        if (import.meta.client) window.location.reload()
    }

    // --- O'chirish: ro'yxatdan olib tashlaymiz; faol bo'lsa 0-indexdagi accountga o'tamiz ---
    const removeAccount = (userId: string) => {
        const wasActive = activeUserId.value === userId
        accounts.value = accounts.value.filter((a) => a.userId !== userId)
        persist()

        if (wasActive) {
            const next = accounts.value[0]
            if (next) {
                token.value = next.token
                if (import.meta.client) window.location.reload()
            } else {
                // Hech qanday account qolmadi — chiqish
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
        sendCode,
        verifyCode,
        verifyPassword,
        switchAccount,
        removeAccount,
    }
})
