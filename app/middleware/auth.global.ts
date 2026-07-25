import { setResponseHeader } from 'h3'
import { authCookieOptions } from '~/utils/authCookie'
import {
    clearAllAuthStorage,
    readActiveUserId,
    resolveAuthToken,
    writeAuthCookie,
} from '~/utils/activeAccount'
import {
    isAdminUser,
    resolveHomePath,
    resolveSafeNextPath,
} from '~/utils/userRole'

const isProtectedPath = (path: string) =>
    path.startsWith('/driver') || path.startsWith('/admin')

const isAuthEntryPath = (path: string) =>
    path === '/' || path === '/auth' || path === '/login' || path === '/register'

export default defineNuxtRouteMiddleware(async (to) => {
    // Kesh: auth HTML begonalarga ketmasin
    if (import.meta.server) {
        try {
            const event = useRequestEvent()
            if (event && (isProtectedPath(to.path) || isAuthEntryPath(to.path))) {
                setResponseHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
                setResponseHeader(event, 'Vary', 'Cookie')
            }
        } catch { /* */ }

        /**
         * SSR: Pinia store'ga tegilmaydi (_s xatosi / payload leak yo'q).
         * Faqat cookie bor-yo'qligi — himoyalangan yo'lga token siz kirmaslik.
         */
        const token = useCookie('auth_token', { ...authCookieOptions })
        if (!token.value && isProtectedPath(to.path)) {
            return navigateTo('/auth')
        }
        return
    }

    // ——— CLIENT (haqiqiy auth) ———
    const token = useCookie('auth_token', { ...authCookieOptions })
    const authStore = useAuthStore()

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()

    const clearSession = () => {
        token.value = null
        clearAllAuthStorage()
        authStore.user = null
    }

    if (!hasToken()) {
        authStore.user = null
        if (isProtectedPath(to.path)) {
            clearAllAuthStorage()
            return navigateTo('/auth')
        }
        return
    }

    const resolved = resolveAuthToken(token.value)
    if (resolved && token.value !== resolved) {
        writeAuthCookie(resolved)
        token.value = resolved
        authStore.user = null
    }

    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession()
        const q = { ...to.query }
        delete q.switch
        return navigateTo({ path: '/auth', query: q }, { replace: true })
    }

    const storeUserId = () =>
        authStore.user?.userId != null ? String(authStore.user.userId) : ''
    const activeUserId = () => {
        const fromStorage = readActiveUserId()
        return fromStorage ? String(fromStorage) : ''
    }

    const needsUserRefresh = () => {
        if (!authStore.user) return true
        const wanted = activeUserId()
        const got = storeUserId()
        return !!(wanted && got && wanted !== got)
    }

    if (needsUserRefresh()) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const statusCode = e?.response?.status
            const code = e?.response?.data?.code
            if (statusCode === 401 || statusCode === 403 || code === 'SESSION_EXPIRED') {
                clearSession()
                if (isProtectedPath(to.path) || to.path === '/auth') {
                    return navigateTo('/auth')
                }
                return
            }
            if (isProtectedPath(to.path) && !authStore.user) {
                return navigateTo('/auth')
            }
        }
    }

    if (!authStore.user) {
        if (isProtectedPath(to.path)) {
            clearSession()
            return navigateTo('/auth')
        }
        return
    }

    if (isAuthEntryPath(to.path)) {
        if (to.path === '/auth') {
            const next = resolveSafeNextPath(to.query.next, authStore.user)
            if (next) return navigateTo(next)
        }
        return navigateTo(resolveHomePath(authStore.user))
    }

    if (to.path.startsWith('/admin') && !isAdminUser(authStore.user)) {
        return navigateTo(resolveHomePath(authStore.user))
    }

    if (isAdminUser(authStore.user) && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }
})
