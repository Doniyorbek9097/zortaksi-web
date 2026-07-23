import { defineStore } from 'pinia'
import type { ILocalAccount } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'

const STORAGE_KEY = 'zt_accounts'

// #region agent log
const dbg = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>, runId = 'post-fix') => {
    if (!import.meta.client) return
    const payload = { sessionId: '1179ab', runId, hypothesisId, location, message, data, timestamp: Date.now() }
    fetch('http://127.0.0.1:7750/ingest/fe00ea7a-4a26-4abf-929d-8d61a735465e', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1179ab' }, body: JSON.stringify(payload) }).catch(() => {})
    fetch('/api/_debug/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
    try {
        const base = useRuntimeConfig().public.baseUrl as string
        if (base) {
            fetch(`${base}/_debug/log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {})
        }
    } catch { /* */ }
}
// #endregion

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
        // #region agent log
        dbg('H1', 'account.store.ts:persist', 'persist accounts', {
            count: accounts.value.length,
            userIds: accounts.value.map((a) => String(a.userId)),
        })
        // #endregion
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
            // #region agent log
            dbg('H5', 'account.store.ts:load', 'load from localStorage', {
                rawLen: raw?.length || 0,
                count: accounts.value.length,
                userIds: accounts.value.map((a) => a.userId),
            })
            // #endregion
        } catch (e: any) {
            accounts.value = []
            // #region agent log
            dbg('H5', 'account.store.ts:load', 'load parse failed', { error: String(e?.message || e) })
            // #endregion
        }
    }

    const upsert = (acc: ILocalAccount) => {
        const userId = String(acc.userId)
        const beforeCount = accounts.value.length
        const beforeIds = accounts.value.map((a) => String(a.userId))
        const idx = accounts.value.findIndex((a) => String(a.userId) === userId)
        const next = { ...acc, userId }
        if (idx !== -1) accounts.value[idx] = { ...accounts.value[idx], ...next }
        else accounts.value.push(next)
        // #region agent log
        dbg('H1', 'account.store.ts:upsert', 'upsert account', {
            userId,
            idx,
            beforeCount,
            afterCount: accounts.value.length,
            beforeIds,
            afterIds: accounts.value.map((a) => String(a.userId)),
            possibleWipe: beforeCount === 0,
        })
        // #endregion
        persist()
    }

    const ensureCurrent = (user: any) => {
        if (!import.meta.client || !user?.userId || !token.value) {
            // #region agent log
            dbg('H4', 'account.store.ts:ensureCurrent', 'ensureCurrent skipped', {
                hasUser: !!user?.userId,
                hasToken: !!token.value,
                memCount: accounts.value.length,
            })
            // #endregion
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

    const activateNew = (user: any, authToken: string) => {
        // #region agent log
        const storageRaw = typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || '') : ''
        let storageCount = 0
        try { storageCount = storageRaw ? JSON.parse(storageRaw).length : 0 } catch { /* */ }
        dbg('H1', 'account.store.ts:activateNew', 'activateNew before load', {
            userId: user?.userId != null ? String(user.userId) : null,
            memCount: accounts.value.length,
            storageCount,
            storageRawLen: storageRaw.length,
        })
        // #endregion

        // Muhim: xotira bo'sh bo'lsa ham localStorage'dagi hisoblarni saqlab qolish
        load()

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

        // #region agent log
        dbg('H1', 'account.store.ts:activateNew', 'activateNew after load+upsert', {
            userId: String(user.userId),
            memCount: accounts.value.length,
            memIds: accounts.value.map((a) => String(a.userId)),
        })
        // #endregion
    }

    const switchAccount = (userId: string) => {
        load()
        const target = String(userId)
        const acc = accounts.value.find((a) => String(a.userId) === target)
        const sameToken = !!(acc && acc.token === token.value)
        // #region agent log
        dbg('H2', 'account.store.ts:switchAccount', 'switchAccount attempt', {
            targetUserId: target,
            found: !!acc,
            sameToken,
            memCount: accounts.value.length,
            memIds: accounts.value.map((a) => String(a.userId)),
            activeByToken: activeUserId.value,
            willNoop: !acc || sameToken,
        })
        // #endregion
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
        sendCode,
        verifyCode,
        verifyPassword,
        switchAccount,
        removeAccount,
    }
})
