/**
 * Navigatsiya bekor qilinsa yoki getMe kechiksa SessionGate qotib qolmasin.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const router = useRouter()

  const unblock = () => {
    if (!auth.sessionReady) auth.sessionReady = true
  }

  void router.isReady().then(() => {
    requestAnimationFrame(unblock)
    window.setTimeout(unblock, 1200)
  })

  router.onError(() => {
    unblock()
  })

  window.setTimeout(unblock, 22_000)
})