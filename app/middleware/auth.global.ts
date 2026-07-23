export default defineNuxtRouteMiddleware(async (to, from) => {
    const token = useCookie('auth_token', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        watch: true,
        sameSite: 'lax'
    })
    const authStore = useAuthStore()

    // Token bor — /me orqali user + Telegram session tekshiriladi
    if (token.value && !authStore.user) {
        try {
            await authStore.getMe()
        } catch (e: any) {
            const statusCode = e.response?.status
            const code = e.response?.data?.code
            // Token yoki Telegram session yaroqsiz
            if (statusCode === 401 || statusCode === 403 || code === 'SESSION_EXPIRED') {
                token.value = null
                authStore.user = null
                if (to.path.startsWith('/driver') || to.path.startsWith('/admin')) {
                    return navigateTo('/auth')
                }
            } else {
                console.warn("[Middleware] Tarmoq yoki server xatosi, lekin cookie saqlab qolindi:", e.message)
            }
        }
    }

    const isAdmin = authStore.user?.role === 'admin'
    const homePath = isAdmin ? '/admin/dashboard' : '/driver/dashboard'

    // Login qilgan foydalanuvchini landing/auth'dan o'z dashboardiga yo'naltirish
    if (token.value && authStore.user && (to.path === '/' || to.path === '/auth' || to.path === '/login' || to.path === '/register')) {
        return navigateTo(homePath)
    }

    // Login qilmagan — himoyalangan sahifalarga kira olmasin
    if (!token.value && (to.path.startsWith('/driver') || to.path.startsWith('/admin'))) {
        return navigateTo('/auth')
    }

    // Admin bo'lmagan /admin ga kirmasin
    if (token.value && to.path.startsWith('/admin') && !isAdmin) {
        return navigateTo('/driver/dashboard')
    }

    // Admin asosiy sahifaga kelsa — admin dashboard
    if (token.value && isAdmin && to.path === '/driver/dashboard') {
        return navigateTo('/admin/dashboard')
    }
})
