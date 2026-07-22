import { defineStore } from 'pinia'
import type { IUser } from '~/types'

export const useAuthStore = defineStore('auth', () => {
    const token = useCookie('auth_token', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        watch: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    })
    const user = ref<IUser | null>(null)
    const isAuthenticated = computed(() => !!token.value)
    const isLoading = ref(false)

    const getMe = async () => {
        try {
            isLoading.value = true
            const response = await useApi('/me')
            if (response.success) {
                user.value = response.data
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
                token.value = response.data.authToken
                user.value = response.data.user
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
                token.value = response.data.authToken
                user.value = response.data.user
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

