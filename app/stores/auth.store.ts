import { defineStore } from 'pinia'
import type { IUser } from '~/types'
import { getAuthCookieOptions } from '~/utils/authCookie'
import {
    clearAllAuthStorage,
    readActiveUserId,
    resolveAuthToken,
    writeActiveSession,
    writeAuthCookie,
} from '~/utils/activeAccount'
import { isTariffActive } from '~/utils/tariffActive'
import { normalizeUserRole } from '~/utils/userRole'
import { AUTH_API_TIMEOUT_MS, getApiErrorMessage } from '~/utils/apiError'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie('auth_token', { ...getAuthCookieOptions() })
    const user = ref<IUser | null>(null)
    /** Client tanlangan hisobni yuklamaguncha UI kutadi (noto'g'ri account flash yo'q) */
    const sessionReady = ref(false)
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
                // Session sync faqat client — SSR da writeActiveSession/memory leak bo'lmasin
                if (import.meta.client) {
                    const t = forced || resolveAuthToken(token.value)
                    const wanted = readActiveUserId()
                    const gotId = response.data?.userId != null ? String(response.data.userId) : ''
                    if (t && gotId && (!wanted || wanted === gotId)) {
                        writeActiveSession(gotId, t)
                        token.value = t
                        writeAuthCookie(t)
                    }
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

    const sendCode = async (phone: string, opts?: { forceSms?: boolean }) => {
        try {
            isLoading.value = true
            const response = await useApi('/send-code', {
                method: 'POST',
                body: { phone, forceSms: opts?.forceSms || undefined },
                timeout: AUTH_API_TIMEOUT_MS,
            })
            return response
        } catch (error) {
            console.error('SendCode error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Kod yuborib bo\'lmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const verifyCode = async (phone: string, code: string, referrerId?: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/verify-code', {
                method: 'POST',
                body: { phone, code, referrerId: referrerId || undefined },
                timeout: AUTH_API_TIMEOUT_MS,
            })
            if (response.success && response.data?.authToken) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyCode error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Kod tasdiqlanmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const verifyPassword = async (phone: string, password: string, referrerId?: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/verify-password', {
                method: 'POST',
                body: { phone, password, referrerId: referrerId || undefined },
                timeout: AUTH_API_TIMEOUT_MS,
            })
            if (response.success && response.data?.authToken) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyPassword error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Parol tasdiqlanmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const applyUserUpdate = (raw: any) => {
        const next = normalizeUser(raw)
        if (next) user.value = next
        return next
    }

    const sendAccountMigrateCode = async (phone: string, opts?: { forceSms?: boolean }) => {
        try {
            isLoading.value = true
            return await useApi('/me/migrate/send-code', {
                method: 'POST',
                body: { phone, forceSms: opts?.forceSms || undefined },
                timeout: AUTH_API_TIMEOUT_MS,
            })
        } catch (error) {
            console.error('SendAccountMigrateCode error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Kod yuborib bo\'lmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const verifyAccountMigrateCode = async (phone: string, code: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/me/migrate/verify-code', {
                method: 'POST',
                body: { phone, code },
                timeout: AUTH_API_TIMEOUT_MS,
            })
            if (response.success && response.data?.authToken && response.data?.user) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyAccountMigrateCode error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Kod tasdiqlanmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const verifyAccountMigratePassword = async (phone: string, password: string) => {
        try {
            isLoading.value = true
            const response = await useApi('/me/migrate/verify-password', {
                method: 'POST',
                body: { phone, password },
                timeout: AUTH_API_TIMEOUT_MS,
            })
            if (response.success && response.data?.authToken && response.data?.user) {
                persistSession(response.data.authToken, response.data.user)
            }
            return response
        } catch (error) {
            console.error('VerifyAccountMigratePassword error:', error)
            throw Object.assign(error as object, {
                userMessage: getApiErrorMessage(error, 'Parol tasdiqlanmadi'),
            })
        } finally {
            isLoading.value = false
        }
    }

    const logout = async () => {
        try {
            isLoading.value = true
            clearExpireTimer()
            let response: any = { success: true }
            try {
                response = await useApi('/logout', { method: 'POST' })
            } catch {
                /* tarmoq xatosida ham lokal sessiyani tozalash */
            }
            token.value = null
            user.value = null
            clearAllAuthStorage()
            return response
        } catch (error) {
            console.error('Logout error:', error)
            token.value = null
            user.value = null
            clearAllAuthStorage()
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        token,
        user,
        sessionReady,
        isAuthenticated,
        isLoading,
        tariffActive,
        markTariffExpired,
        getMe,
        sendCode,
        verifyCode,
        verifyPassword,
        sendAccountMigrateCode,
        verifyAccountMigrateCode,
        verifyAccountMigratePassword,
        logout,
    }
})
