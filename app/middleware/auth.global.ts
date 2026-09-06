import { setResponseHeader } from 'h3'
import { getAuthCookieOptions } from '~/utils/authCookie'
import {
    clearActiveAuth,
    readActiveUserId,
    resolveAuthToken,
    syncSelectedAccountToCookie,
    writeActiveSession,
    writeAuthCookie,
} from '~/utils/activeAccount'
import {
    isAdminUser,
    hasPanelShellAccess,
    isPanelUser,
    resolveHomePath,
    resolveSafeNextPath,
} from '~/utils/userRole'
import { isMainTabHop, normalizePath } from '~/utils/driverTabRoutes'
import {
    classifyApiError,
    isConnectivityError,
} from '~/utils/connectionError'
import { resolveTelegramStartNavigation, captureTelegramStartParam, readTelegramStartParam } from '~/utils/telegramStartParam'

const isProtectedPath = (path: string) =>
    path.startsWith('/driver') || path.startsWith('/admin')

const isAuthEntryPath = (path: string) =>
    path === '/' || path === '/auth' || path === '/login' || path === '/register'

const isConnectionErrorPath = (path: string) => path === '/connection-error'

function redirectConnectionError(next: string, reason: 'offline' | 'server') {
    return navigateTo({
        path: '/connection-error',
        query: { next, reason },
    })
}

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

function looksLikeTelegramMiniApp(): boolean {
    if (!import.meta.client) return false
    if (document.documentElement.dataset.ztEmbed === 'telegram') return true
    try {
        const tg = (window as Window & { Telegram?: { WebApp?: { initData?: string; platform?: string } } }).Telegram?.WebApp
        if (tg?.initData) return true
        const p = String(tg?.platform || '')
        return !!p && p !== 'unknown'
    } catch {
        return false
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    applyPrivateCacheHeaders(to.path)

    const token = useCookie('auth_token', { ...getAuthCookieOptions() })
    const authStore = useAuthStore()

    /**
     * SSR: user yo'q, sessionReady=false — SessionGate loading.
     * Cookie dagi "oxirgi" hisob HTML ga tushmasin.
     */
    if (import.meta.server) {
        authStore.user = null
        authStore.sessionReady = false

        if (!token.value && isProtectedPath(to.path)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } })
        }
        // "/" — Telegram start_param faqat client hash/initData da; SSR dashboard ga otmasin
        if (token.value && isAuthEntryPath(to.path) && to.path !== '/') {
            return navigateTo('/driver/dashboard')
        }
        return
    }

    // ——— CLIENT ———
    captureTelegramStartParam()
    const telegramStartTarget = resolveTelegramStartNavigation(to)
    if (telegramStartTarget) {
        return navigateTo(telegramStartTarget, { replace: true })
    }

    if (isConnectionErrorPath(to.path)) {
        authStore.sessionReady = true
        return
    }

    const tabHop =
        authStore.user &&
        authStore.sessionReady &&
        isMainTabHop(from?.path || '', to.path)

    // Tab orasida o'tishda to'liq ekran loading ko'rsatilmaydi
    if (!tabHop) {
        authStore.sessionReady = false
    }

    syncSelectedAccountToCookie((t) => {
        token.value = t
    })

    let resolved = resolveAuthToken(token.value)
    if (resolved && token.value !== resolved) {
        writeAuthCookie(resolved)
        token.value = resolved
    }

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()

    const markReady = () => {
        authStore.sessionReady = true
    }

    const clearSession = () => {
        token.value = null
        authStore.user = null
        clearActiveAuth()
        markReady()
    }

    if (to.path === '/auth' && (to.query.switch === '1' || to.query.switch === 'true')) {
        clearSession()
        const q = { ...to.query }
        delete q.switch
        return navigateTo({ path: '/auth', query: q }, { replace: true })
    }

    if (!hasToken()) {
        authStore.user = null
        markReady()
        if (isProtectedPath(to.path)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } })
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

    if (
        import.meta.client &&
        typeof navigator !== 'undefined' &&
        !navigator.onLine &&
        needsUserRefresh()
    ) {
        markReady()
        if (!authStore.user && isProtectedPath(to.path)) {
            return redirectConnectionError(to.fullPath, 'offline')
        }
    }

    if (needsUserRefresh()) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const kind = classifyApiError(e)
            if (kind === 'auth') {
                clearSession()
                if (isProtectedPath(to.path) || to.path === '/auth') {
                    return navigateTo({ path: '/auth', query: { next: to.fullPath } })
                }
                return
            }
            if (isConnectivityError(kind)) {
                markReady()
                if (!authStore.user && isProtectedPath(to.path)) {
                    return redirectConnectionError(
                        to.fullPath,
                        kind === 'offline' ? 'offline' : 'server',
                    )
                }
                return
            }
            // Noma'lum xato — SessionGate qotib qolmasin
            markReady()
            if (!authStore.user && isProtectedPath(to.path)) {
                return redirectConnectionError(to.fullPath, 'server')
            }
            return
        }
    }

    if (!authStore.user) {
        if (isProtectedPath(to.path)) {
            if (hasToken()) {
                return redirectConnectionError(to.fullPath, 'server')
            }
            clearSession()
            return navigateTo({ path: '/auth', query: { next: to.fullPath } })
        }
        markReady()
        return
    }

    // Tanlangan hisobni cookie + LS ga qayta yozish (refresh barqaror)
    const t = authToken()
    if (t && authStore.user.userId) {
        const uid = String(authStore.user.userId)
        writeActiveSession(uid, t)
        writeAuthCookie(t)
        token.value = t
    }

    // Redirectlar — sessionReady hali false (loading), keyin yangi sahifada true
    if (isAuthEntryPath(to.path)) {
        const startTarget = resolveTelegramStartNavigation(to)
        if (startTarget) {
            return navigateTo(startTarget, { replace: true })
        }
        const canSkipAuth =
            !!authStore.user?.verified || hasPanelShellAccess(authStore.user)
        if (to.path === '/auth') {
            const next = resolveSafeNextPath(to.query.next, authStore.user)
            if (next && canSkipAuth) return navigateTo(next)
            markReady()
            return
        }
        if (canSkipAuth) {
            if (
                to.path === '/' &&
                looksLikeTelegramMiniApp() &&
                !readTelegramStartParam()
            ) {
                markReady()
                return
            }
            return navigateTo(resolveHomePath(authStore.user))
        }
        markReady()
        return
    }

    // Eski take-order havolalari — minimal query bilan chat/open ga
    if (
        to.path === '/driver/take-order' &&
        String(to.query.orderId || '').trim()
    ) {
        return navigateTo(
            {
                path: '/driver/chat/open',
                query: {
                    open: String(to.query.open || 'order'),
                    orderId: String(to.query.orderId),
                    ...(String(to.query.fromGroup || '').trim() === '1'
                        ? { fromGroup: '1' }
                        : {}),
                },
            },
            { replace: true },
        )
    }

    if (to.path.startsWith('/admin') && !hasPanelShellAccess(authStore.user)) {
        return navigateTo(resolveHomePath(authStore.user))
    }

    // Panel roli — driver dashboard emas, admin home
    if (hasPanelShellAccess(authStore.user) && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }

    // Driver tanlangan, lekin URL admin — driver home
    if (!hasPanelShellAccess(authStore.user) && to.path.startsWith('/admin')) {
        return navigateTo('/driver/dashboard')
    }

    const lateTelegramStart = resolveTelegramStartNavigation(to)
    if (lateTelegramStart) {
        return navigateTo(lateTelegramStart, { replace: true })
    }

    // Shu sahifada qolamiz — endi UI ochilsin
    markReady()
})
