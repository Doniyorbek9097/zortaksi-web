import { authCookieOptions } from '~/utils/authCookie'
import {
    readActiveUserId,
    resolveAuthToken,
    writeActiveSession,
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
    writeAuthCookie(null)
    writeActiveSession(null, null)
    authStore.user = null
}

export default defineNuxtRouteMiddleware(async (to) => {
    const token = useCookie('auth_token', { ...authCookieOptions })
    const authStore = useAuthStore()

    // Client: localStorage / xotira tokenini cookie bilan sinxronlash
    // Token manbai o'zgarsa — eski user ishonchsiz (stale admin role oldini olish)
    if (import.meta.client) {
        const resolved = resolveAuthToken(token.value)
        if (resolved && token.value !== resolved) {
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
