import { defineStore } from 'pinia'
import type { IUser } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'
import { readActiveUserId, resolveAuthToken, writeActiveSession, writeAuthCookie } from '~/utils/activeAccount'
import { isTariffActive } from '~/utils/tariffActive'
import { normalizeUserRole } from '~/utils/userRole'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie('auth_token', { ...authCookieOptions })
    const user = ref<IUser | null>(null)
    const isAuthenticated = computed(() => !!resolveAuthToken(token.value))
    const isLoading = ref(false)
    const tariffActive = computed(() => isTariffActive(user.value))

    let expireTimer: ReturnType<typeof setTimeout> | null = null
    const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000

    const clearExpireTimer = () => {
        if (expireTimer) {
            clearTimeout(expireTimer)
            expireTimer = null
        }
    }

    const markTariffExpired = () => {
        if (!user.value?.active) return
        user.value = { ...user.value, active: false }
    }

    /** Muddat tugashi bilan UI darhol inactive; keyin getMe DB ni sync qiladi */
    const scheduleTariffExpiry = () => {
        if (!import.meta.client) return
        clearExpireTimer()
        const u = user.value
        if (!u?.active || !u.tariff || !u.tariffExpireAt) return
        const end = new Date(u.tariffExpireAt).getTime()
        if (Number.isNaN(end)) return
        const delay = end - Date.now()
        if (delay <= 0) {
            const wasActive = !!u.active
            markTariffExpired()
            // DB sync — faqat hali active bo'lganida (loop oldini olish)
            if (wasActive) void getMe().catch(() => {})
            return
        }
        expireTimer = setTimeout(() => {
            scheduleTariffExpiry()
        }, Math.min(delay + 50, MAX_TIMEOUT_MS))
    }

    if (import.meta.client) {
        watch(user, () => scheduleTariffExpiry(), { deep: true })
    }

    const normalizeUser = (raw: any): IUser | null => {
        if (!raw || typeof raw !== 'object') return null
        return {
            ...raw,
            role: normalizeUserRole(raw.role),
        } as IUser
    }

    const persistSession = (authToken: string, nextUser: any) => {
        token.value = authToken
        user.value = normalizeUser(nextUser)
        writeAuthCookie(authToken)
        if (nextUser?.userId) {
            writeActiveSession(String(nextUser.userId), authToken)
        }
    }

    const getMe = async (opts?: { authToken?: string }) => {
        try {
            isLoading.value = true
            const forced = opts?.authToken
            const response = await useApi('/me', forced ? { authToken: forced } : {})
            if (response.success) {
                user.value = normalizeUser(response.data)
                const t = forced || resolveAuthToken(token.value)
                const wanted = readActiveUserId()
                const gotId = response.data?.userId != null ? String(response.data.userId) : ''
                // Kutilgan hisob bilan mos bo'lsa — session sync
                if (t && gotId && (!wanted || wanted === gotId)) {
                    writeActiveSession(gotId, t)
                    token.value = t
                    writeAuthCookie(t)
                }
            }
            return response
        } catch (error) {
            console.error('GetMe error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const sendCode = async (phone: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/send-code', {
                method: 'POST',
                body: { phone }
            })
            return response
        } catch (error) {
            console.error('SendCode error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const verifyCode = async (phone: string, code: string, referrerId?: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/verify-code', {
                method: 'POST',
                body: { phone, code, referrerId: referrerId || undefined }
            })
            if (response.success && response.data?.authToken) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyCode error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const verifyPassword = async (phone: string, password: string, referrerId?: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/verify-password', {
                method: 'POST',
                body: { phone, password, referrerId: referrerId || undefined }
            })
            if (response.success && response.data?.authToken) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyPassword error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const logout = async () => {
        try {
            isLoading.value = true
            clearExpireTimer()
            const response = await useApi('/logout', {
                method: 'POST'
            })
            token.value = null
            user.value = null
            writeActiveSession(null, null)
            writeAuthCookie(null)
            return response
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        token,
        user,
        isAuthenticated,
        isLoading,
        tariffActive,
        markTariffExpired,
        getMe,
        sendCode,
        verifyCode,
        verifyPassword,
        logout,
    }
})
