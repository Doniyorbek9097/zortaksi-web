import { authCookieOptions } from '~/utils/authCookie'
import {
    resolveAuthToken,
    writeActiveSession,
    writeAuthCookie,
} from '~/utils/activeAccount'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const token = useCookie('auth_token', { ...authCookieOptions })
    const authStore = useAuthStore()

    // Client: localStorage / xotira tokenini cookie bilan sinxronlash
    // (refreshda cookie bo'sh, localStorage to'liq bo'lsa — /auth flash oldini oladi)
    if (import.meta.client) {
        const resolved = resolveAuthToken(token.value)
        if (resolved && token.value !== resolved) {
            writeAuthCookie(resolved)
            token.value = resolved
        }
    }

    const authToken = () => resolveAuthToken(token.value)
    const hasToken = () => !!authToken()

    // Token bor — /me orqali user + Telegram session tekshiriladi
    if (hasToken() && !authStore.user) {
        try {
            await authStore.getMe({ authToken: authToken() || undefined })
        } catch (e: any) {
            const statusCode = e.response?.status
            const code = e.response?.data?.code
            // Token yoki Telegram session yaroqsiz
            if (statusCode === 401 || statusCode === 403 || code === 'SESSION_EXPIRED') {
                token.value = null
                writeAuthCookie(null)
                writeActiveSession(null, null)
                authStore.user = null
                if (to.path.startsWith('/driver') || to.path.startsWith('/admin')) {
                    return navigateTo('/auth')
                }
            } else {
                console.warn('[Middleware] Tarmoq yoki server xatosi, lekin cookie saqlab qolindi:', e.message)
            }
        }
    }

    const isAdmin = authStore.user?.role === 'admin'
    const homePath = isAdmin ? '/admin/dashboard' : '/driver/dashboard'

    // Login qilgan foydalanuvchini landing/auth'dan o'z dashboardiga yo'naltirish
    // /auth?next=/delete-account — maxsus yo'nalish (Play Console hisob o'chirish)
    if (hasToken() && authStore.user && (to.path === '/' || to.path === '/auth' || to.path === '/login' || to.path === '/register')) {
        if (to.path === '/auth') {
            const next = typeof to.query.next === 'string' ? to.query.next : ''
            if (next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/auth')) {
                return navigateTo(next)
            }
        }
        return navigateTo(homePath)
    }

    // Login qilmagan — himoyalangan sahifalarga kira olmasin
    if (!hasToken() && (to.path.startsWith('/driver') || to.path.startsWith('/admin'))) {
        // SSR da localStorage yo'q — cookie bo'sh bo'lsa ham /auth ga otkazmaslik
        // (client middleware localStorage ni sinxronlab qayta tekshiradi)
        if (import.meta.server) return
        return navigateTo('/auth')
    }

    // Admin bo'lmagan /admin ga kirmasin
    // Muhim: clientda authStore.user allaqachon yangilangan bo'lsa (account switch) — shunga ishonamiz
    if (hasToken() && to.path.startsWith('/admin') && !isAdmin) {
        // Client navigatsiyada user hali yuklanmagan bo'lishi mumkin — qayta /me
        if (import.meta.client && !authStore.user) {
            try {
                await authStore.getMe({ authToken: authToken() || undefined })
            } catch { /* */ }
        }
        if (authStore.user?.role !== 'admin') {
            return navigateTo('/driver/dashboard')
        }
    }

    // Admin asosiy sahifaga kelsa — admin dashboard
    if (hasToken() && isAdmin && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }

    // Admin /driver/profile orqali kirsa ham — OK (hisob switch)
    // Boshqa /driver sahifalarida admin qolishi mumkin (buyurtmalar va h.k.)
})
