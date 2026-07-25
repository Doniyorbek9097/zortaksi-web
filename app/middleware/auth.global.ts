import { setResponseHeader } from 'h3'
import { getAuthCookieOptions } from '~/utils/authCookie'
import {
    clearActiveAuth,
    readActiveUserId,
    resolveAuthToken,
    syncSelectedAccountToCookie,
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

/** CDN/shared cache — shaxsiy HTML begonalarga ketmasin */
function applyPrivateCacheHeaders(path: string) {
    if (!import.meta.server) return
    if (!isProtectedPath(path) && !isAuthEntryPath(path)) return
    try {
        const event = useRequestEvent()
        if (!event) return
        setResponseHeader(event, 'Cache-Control', 'private, no-store, no-cache, must-revalidate')
        setResponseHeader(event, 'Vary', 'Cookie')
        setResponseHeader(event, 'Pragma', 'no-cache')
    } catch { /* */ }
}

export default defineNuxtRouteMiddleware(async (to) => {
    applyPrivateCacheHeaders(to.path)

    const token = useCookie('auth_token', { ...getAuthCookieOptions() })
    const authStore = useAuthStore()

    // Client: tanlangan hisob (LS) cookie dan ustun — refreshda oxirgi hisobga qaytmasin
    if (import.meta.client) {
        syncSelectedAccountToCookie((t) => {
            token.value = t
        })
        const resolved = resolveAuthToken(token.value)
        if (resolved && token.value !== resolved) {
            writeAuthCookie(resolved)
            token.value = resolved
        }
        const active = readActiveUserId()
        if (
            resolved &&
            authStore.user &&
            active &&
            String(authStore.user.userId) !== String(active)
        ) {
            authStore.user = null
        }
    }

    /** SSR: faqat shu request cookie; client: cookie + memory */
    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()

    const clearSession = () => {
        token.value = null
        authStore.user = null
        // Multi-account ro'yxatini o'chirmaymiz — faqat joriy sessiya
        if (import.meta.client) clearActiveAuth()
    }

    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession()
        if (import.meta.client) {
            const q = { ...to.query }
            delete q.switch
            return navigateTo({ path: '/auth', query: q }, { replace: true })
        }
        return navigateTo('/auth')
    }

    if (!hasToken()) {
        authStore.user = null
        if (isProtectedPath(to.path)) {
            return navigateTo('/auth')
        }
        return
    }

    const storeUserId = () =>
        authStore.user?.userId != null ? String(authStore.user.userId) : ''
    const activeUserId = () => {
        // SSR da localStorage yo'q — faqat store
        if (!import.meta.client) return ''
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
            // Faqat JWT yaroqsiz — Telegram session yo'qligi endi 401 emas
            if (statusCode === 401 || statusCode === 403) {
                clearSession()
                if (isProtectedPath(to.path) || to.path === '/auth') {
                    return navigateTo('/auth')
                }
                return
            }
            // SSR tarmoq xatosi — himoyalangan sahifaga user siz kiritmaymiz
            if (isProtectedPath(to.path) && !authStore.user) {
                return navigateTo('/auth')
            }
        }
    }

    if (!authStore.user) {
        if (isProtectedPath(to.path)) {
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
