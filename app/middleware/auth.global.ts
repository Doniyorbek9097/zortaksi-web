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

    /**
     * SSR: user yuklanmaydi — cookie oxirgi hisob bo'lishi mumkin,
     * LS dagi tanlangan hisobni server bilmaydi. Noto'g'ri profil flash bo'lmasin.
     */
    if (import.meta.server) {
        authStore.user = null
        authStore.sessionReady = false

        if (!token.value && isProtectedPath(to.path)) {
            return navigateTo('/auth')
        }
        // Token bor — shell ni client yuklaydi (to'g'ri hisob bilan)
        return
    }

    // ——— CLIENT ———

    // Tanlangan hisob (LS) → cookie (refresh uchun ham)
    syncSelectedAccountToCookie((t) => {
        token.value = t
    })

    const resolved = resolveAuthToken(token.value)
    if (resolved && token.value !== resolved) {
        writeAuthCookie(resolved)
        token.value = resolved
    }

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()

    const clearSession = () => {
        token.value = null
        authStore.user = null
        clearActiveAuth()
        authStore.sessionReady = true
    }

    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession()
        const q = { ...to.query }
        delete q.switch
        return navigateTo({ path: '/auth', query: q }, { replace: true })
    }

    if (!hasToken()) {
        authStore.user = null
        authStore.sessionReady = true
        if (isProtectedPath(to.path)) {
            return navigateTo('/auth')
        }
        return
    }

    const active = readActiveUserId()
    if (
        authStore.user &&
        active &&
        String(authStore.user.userId) !== String(active)
    ) {
        authStore.user = null
    }

    const needsUserRefresh = () => {
        if (!authStore.user) return true
        const wanted = active ? String(active) : ''
        const got = authStore.user?.userId != null ? String(authStore.user.userId) : ''
        return !!(wanted && got && wanted !== got)
    }

    if (needsUserRefresh()) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const statusCode = e?.response?.status
            if (statusCode === 401 || statusCode === 403) {
                clearSession()
                if (isProtectedPath(to.path) || to.path === '/auth') {
                    return navigateTo('/auth')
                }
                return
            }
            if (isProtectedPath(to.path) && !authStore.user) {
                authStore.sessionReady = true
                return navigateTo('/auth')
            }
        }
    }

    authStore.sessionReady = true

    if (!authStore.user) {
        if (isProtectedPath(to.path)) {
            clearSession()
            return navigateTo('/auth')
        }
        return
    }

    // Cookie ni tanlangan hisob bilan qayta yozish (keyingi refresh SSR to'g'ri)
    const t = authToken()
    if (t && authStore.user.userId) {
        writeAuthCookie(t)
        token.value = t
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
