import { authCookieOptions } from '~/utils/authCookie'
import { clearActiveAuth, resolveAuthToken } from '~/utils/activeAccount'

/**
 * Ilova ochilganda Telegram session tekshiriladi.
 * Eskirgan bo'lsa joriy sessiya tozalanadi — boshqa accountlar saqlanadi.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token', { ...authCookieOptions })

  const resolved = resolveAuthToken(token.value)
  if (!resolved) return

  try {
    await authStore.getMe({ authToken: resolved })
  } catch (e: any) {
    const status = e?.response?.status
    const code = e?.response?.data?.code
    if (status === 401 || status === 403 || code === 'SESSION_EXPIRED') {
      token.value = null
      authStore.user = null
      clearActiveAuth()
      await navigateTo('/auth')
    }
  }
})

