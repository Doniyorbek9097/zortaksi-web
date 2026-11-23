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
import { resolveTelegramStartNavigation, captureTelegramStartParam, readTelegramStartParam, routeFromTelegramStartParam } from '~/utils/telegramStartParam'
import {
    buildRouteFullPath,
    isOrderTakeChatOpen,
    resolveOrderTakeAccessRedirect,
} from '~/utils/orderTakeAccess'
import { isTelegramMiniApp, mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

const isAdminPath = (path: string) => path.startsWith('/admin')

/** Faqat admin panel — majburiy login */
const isProtectedPath = (path: string) => isAdminPath(path)

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

        if (!token.value && isAdminPath(to.path)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } })
        }
        // "/" — Telegram start_param faqat client hash/initData da; SSR dashboard ga otmasin
        if (token.value && isAuthEntryPath(to.path) && to.path !== '/') {
            return navigateTo('/driver/dashboard')
        }
        // start_param — client hash da; SSR da dashboard ga zorlamaymiz
        return
    }

    // start_param — faqat saqlash; yo'naltirish sessiya tekshiruvidan keyin
    if (import.meta.client) {
        captureTelegramStartParam()
    }

    if (isConnectionErrorPath(to.path)) {
        authStore.sessionReady = true
        return
    }

    const tabHop =
        authStore.user &&
        authStore.sessionReady &&
        isMainTabHop(from?.path || '', to.path)

    const isOrderChatOpen =
        to.path === '/driver/chat/open' && !!String(to.query.orderId || '').trim()

    const isDriverChatNav = to.path.startsWith('/driver/chat/')

    // Tab orasida o'tishda to'liq ekran loading ko'rsatilmaydi
    // Buyurtma/chat — darhol UI (SessionGate bloklamasligi uchun)
    if (!tabHop && !isOrderChatOpen && !isDriverChatNav) {
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
        if (isAdminPath(to.path)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } })
        }
        if (isOrderTakeChatOpen(to.path, to.query as Record<string, unknown>)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } }, { replace: true })
        }
        if (to.path === '/' && import.meta.client) {
            const startParam = readTelegramStartParam()
            const target = routeFromTelegramStartParam(startParam)
            const targetPath = String((target as { path?: string })?.path || '')
            if (targetPath === '/driver/chat/open') {
                const q = (target as { query?: Record<string, string> }).query || {}
                const qs = new URLSearchParams()
                for (const [k, v] of Object.entries(q)) {
                    if (v != null && String(v).trim()) qs.set(k, String(v))
                }
                const next = qs.toString()
                    ? `/driver/chat/open?${qs.toString()}`
                    : '/driver/chat/open'
                return navigateTo({ path: '/auth', query: { next } }, { replace: true })
            }
            return navigateTo('/driver/dashboard', { replace: true })
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
        if (!authStore.user && isAdminPath(to.path)) {
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
                if (
                    isAdminPath(to.path) ||
                    to.path === '/auth' ||
                    isOrderTakeChatOpen(to.path, to.query as Record<string, unknown>)
                ) {
                    return navigateTo({ path: '/auth', query: { next: to.fullPath } })
                }
                markReady()
                return
            }
            if (isConnectivityError(kind)) {
                markReady()
                if (!authStore.user && isAdminPath(to.path)) {
                    return redirectConnectionError(
                        to.fullPath,
                        kind === 'offline' ? 'offline' : 'server',
                    )
                }
                return
            }
            // Noma'lum xato — SessionGate qotib qolmasin
            markReady()
            if (!authStore.user && isAdminPath(to.path)) {
                return redirectConnectionError(to.fullPath, 'server')
            }
            return
        }
    }

    if (!authStore.user) {
        if (isOrderTakeChatOpen(to.path, to.query as Record<string, unknown>)) {
            return navigateTo({ path: '/auth', query: { next: to.fullPath } }, { replace: true })
        }
        if (isAdminPath(to.path)) {
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
        if (to.path === '/') {
            markReady()
            return navigateTo('/driver/dashboard', { replace: true })
        }
        if (canSkipAuth) {
            captureTelegramStartParam()
            const startTarget =
                resolveTelegramStartNavigation(to) ||
                routeFromTelegramStartParam(readTelegramStartParam())
            if (startTarget) {
                return navigateTo(startTarget, { replace: true })
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

    if (isOrderTakeChatOpen(to.path, to.query as Record<string, unknown>)) {
        const blocked = resolveOrderTakeAccessRedirect({
            user: authStore.user,
            fullPath: to.fullPath,
        })
        if (blocked) {
            return navigateTo(blocked, { replace: true })
        }
    }

    // Mini App startapp=order_* — avval ro'yxat/tarif, keyin chat/open
    if (import.meta.client) {
        const telegramStartTarget = resolveTelegramStartNavigation(to)
        if (telegramStartTarget) {
            const targetPath = String(
                (telegramStartTarget as { path?: string }).path || '',
            )
            if (targetPath === '/driver/chat/open') {
                const full = buildRouteFullPath(telegramStartTarget)
                const blocked = resolveOrderTakeAccessRedirect({
                    user: authStore.user,
                    fullPath: full,
                })
                if (blocked) {
                    return navigateTo(blocked, { replace: true })
                }
            }
            return navigateTo(telegramStartTarget, { replace: true })
        }
    }

    // Shu sahifada qolamiz — endi UI ochilsin
    markReady()
})
