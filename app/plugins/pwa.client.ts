export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  const { subscribe } = useWebPush()
  const token = useCookie('auth_token')

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type !== 'NOTIFICATION_CLICK') return
      const url = String(event.data.url || '/driver/orders')
      router.push(url)
    })
  }

  const trySubscribe = async () => {
    if (!token.value) return
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready
      } catch {
        return
      }
    }
    await subscribe()
  }

  watch(
    token,
    (v) => {
      if (v) setTimeout(trySubscribe, 2500)
    },
    { immediate: true }
  )
})
