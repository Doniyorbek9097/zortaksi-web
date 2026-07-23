import { defineStore } from 'pinia'
import type { IUser } from '~/types'
import { authCookieOptions } from '~/utils/authCookie'
import { readActiveUserId, resolveAuthToken, writeActiveSession, writeAuthCookie } from '~/utils/activeAccount'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie('auth_token', { ...authCookieOptions })
    const user = ref<IUser | null>(null)
    const isAuthenticated = computed(() => !!resolveAuthToken(token.value))
    const isLoading = ref(false)

    const persistSession = (authToken: string, nextUser: any) => {
        token.value = authToken
        user.value = nextUser
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
                user.value = response.data
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
        getMe,
        sendCode,
        verifyCode,
        verifyPassword,
        logout,
    }
})
