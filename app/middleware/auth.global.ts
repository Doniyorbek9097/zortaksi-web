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

const clearSession = (authStore: ReturnType<typeof useAuthStore>, clearToken: () => void) => {
    clearToken()
    clearAllAuthStorage()
    authStore.user = null
}

export default defineNuxtRouteMiddleware(async (to) => {
    const token = useCookie('auth_token', { ...authCookieOptions })
    const authStore = useAuthStore()

    // Auth sahifalar CDN/proxy da keshlanmasin — boshqa user HTML olmasin
    if (import.meta.server && isProtectedPath(to.path)) {
        const event = useRequestEvent()
        if (event) {
            setResponseHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
        }
    }

    // Client: faqat xotira (switch) cookie dan ustun; LS dan cookie ga yozilmaydi
    if (import.meta.client) {
        const resolved = resolveAuthToken(token.value)
        if (resolved && token.value !== resolved) {
            // memoryToken switch — cookie ni yangilash
            writeAuthCookie(resolved)
            token.value = resolved
            authStore.user = null
        }
    }

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()
    const wipeToken = () => {
        token.value = null
    }

    const storeUserId = () =>
        authStore.user?.userId != null ? String(authStore.user.userId) : ''
    const activeUserId = () => {
        const fromStorage = readActiveUserId()
        return fromStorage ? String(fromStorage) : ''
    }

    // Token bor — /me orqali user yuklash
    const needsUserRefresh = () => {
        if (!hasToken()) return false
        if (!authStore.user) return true
        const wanted = activeUserId()
        const got = storeUserId()
        return !!(wanted && got && wanted !== got)
    }

    if (needsUserRefresh()) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const statusCode = e.response?.status
            const code = e.response?.data?.code
            if (statusCode === 401 || statusCode === 403 || code === 'SESSION_EXPIRED') {
                clearSession(authStore, wipeToken)
                if (isProtectedPath(to.path)) {
                    return navigateTo('/auth')
                }
            } else {
                console.warn('[Middleware] Tarmoq yoki server xatosi, lekin cookie saqlab qolindi:', e.message)
            }
        }
    }

    // /auth?switch=1 — boshqa hisob: eski sessiyani to'liq tozalash
    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession(authStore, wipeToken)
        if (to.query.switch) {
            const q = { ...to.query }
            delete q.switch
            return navigateTo({ path: '/auth', query: q }, { replace: true })
        }
    }

    // Login qilgan — landing/auth'dan o'z dashboardiga
    if (hasToken() && authStore.user && (to.path === '/' || to.path === '/auth' || to.path === '/login' || to.path === '/register')) {
        if (to.path === '/auth') {
            const next = resolveSafeNextPath(to.query.next, authStore.user)
            if (next) return navigateTo(next)
        }
        return navigateTo(resolveHomePath(authStore.user))
    }

    // Login yo'q — /driver va /admin yopiq (SSR + client, fail-closed)
    if (!hasToken() && isProtectedPath(to.path)) {
        return navigateTo('/auth')
    }

    // /admin — faqat tasdiqlangan admin
    if (to.path.startsWith('/admin')) {
        if (!hasToken()) {
            return navigateTo('/auth')
        }

        if (!authStore.user) {
            try {
                await authStore.getMe({ authToken: authToken() || undefined })
            } catch {
                clearSession(authStore, wipeToken)
                return navigateTo('/auth')
            }
        }

        if (!authStore.user || !isAdminUser(authStore.user)) {
            return navigateTo(resolveHomePath(authStore.user))
        }
    }

    // Token bor, user yo'q, himoyalangan sahifa — qayta urinish yoki /auth
    if (hasToken() && !authStore.user && isProtectedPath(to.path)) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch {
            clearSession(authStore, wipeToken)
            return navigateTo('/auth')
        }
        if (!authStore.user) {
            return navigateTo('/auth')
        }
        if (to.path.startsWith('/admin') && !isAdminUser(authStore.user)) {
            return navigateTo(resolveHomePath(authStore.user))
        }
    }

    // Admin asosiy sahifaga kelsa — admin dashboard
    if (hasToken() && isAdminUser(authStore.user) && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }
})
