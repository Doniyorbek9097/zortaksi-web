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

const clearSession = (authStore: ReturnType<typeof useAuthStore>, clearToken: () => void) => {
    clearToken()
    clearAllAuthStorage()
    authStore.user = null
}

const noStoreHeaders = (path: string) => {
    if (!import.meta.server) return
    if (!isProtectedPath(path) && !isAuthEntryPath(path) && path !== '/auth') return
    const event = useRequestEvent()
    if (!event) return
    setResponseHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
    setResponseHeader(event, 'Vary', 'Cookie')
    setResponseHeader(event, 'Pragma', 'no-cache')
}

export default defineNuxtRouteMiddleware(async (to) => {
    noStoreHeaders(to.path)

    const token = useCookie('auth_token', { ...authCookieOptions })
    const authStore = useAuthStore()

    /**
     * SSR da hech qachon getMe / user yozilmasin.
     * Aks holda HTML payload ichida boshqa userning profili/tokeni
     * CDN orqali begona telefonga ketishi mumkin.
     */
    if (import.meta.server) {
        const cookieToken = token.value || null

        // SSR payload dan qolgan user — bekor
        authStore.user = null

        if (!cookieToken && isProtectedPath(to.path)) {
            return navigateTo('/auth')
        }

        // Cookie bor yoki yo'q — SSR da identity redirect qilmaymiz (faqat client)
        return
    }

    // ——— CLIENT ———

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()
    const wipeToken = () => {
        token.value = null
    }

    // Cookie yo'q — hydrated/eski user qolmasin
    if (!hasToken()) {
        if (authStore.user) authStore.user = null
        if (isProtectedPath(to.path)) {
            clearAllAuthStorage()
            return navigateTo('/auth')
        }
        return
    }

    // Cookie bor — switch xotirasi
    const resolved = resolveAuthToken(token.value)
    if (resolved && token.value !== resolved) {
        writeAuthCookie(resolved)
        token.value = resolved
        authStore.user = null
    }

    // /auth?switch=1
    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession(authStore, wipeToken)
        const q = { ...to.query }
        delete q.switch
        return navigateTo({ path: '/auth', query: q }, { replace: true })
    }

    // Har doim /me bilan tasdiqlash — SSR dan kelgan user ishonchsiz
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

    // User yo'q yoki hisob almashgan — /me majburiy (har navigatsiyada emas)
    if (needsUserRefresh()) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const statusCode = e.response?.status
            const code = e.response?.data?.code
            if (statusCode === 401 || statusCode === 403 || code === 'SESSION_EXPIRED') {
                clearSession(authStore, wipeToken)
                if (isProtectedPath(to.path) || isAuthEntryPath(to.path)) {
                    return navigateTo('/auth')
                }
                return
            }
            console.warn('[Middleware] getMe xato:', e?.message)
            if (isProtectedPath(to.path) && !authStore.user) {
                return navigateTo('/auth')
            }
        }
    }

    if (!authStore.user) {
        if (isProtectedPath(to.path)) {
            clearSession(authStore, wipeToken)
            return navigateTo('/auth')
        }
        return
    }

    // Login qilgan — auth/landing → home
    if (isAuthEntryPath(to.path)) {
        if (to.path === '/auth') {
            const next = resolveSafeNextPath(to.query.next, authStore.user)
            if (next) return navigateTo(next)
        }
        return navigateTo(resolveHomePath(authStore.user))
    }

    // /admin — faqat admin
    if (to.path.startsWith('/admin') && !isAdminUser(authStore.user)) {
        return navigateTo(resolveHomePath(authStore.user))
    }

    if (isAdminUser(authStore.user) && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }
})
