function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export const useWebPush = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const subscribed = ref(false)
  const error = ref('')

  const supported = computed(() => {
    if (!import.meta.client) return false
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  })

  const subscribe = async () => {
    if (!supported.value || !token.value) return false
    const vapid = String(config.public.vapidKey || '')
    if (!vapid) {
      error.value = 'VAPID kalit sozlanmagan'
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        error.value = 'Bildirishnomaga ruxsat berilmadi'
        return false
      }

      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        })
      }

      const json = sub.toJSON()
      await useApi('/push/subscribe', {
        method: 'POST',
        body: {
          endpoint: json.endpoint,
          keys: json.keys,
        },
      })
      subscribed.value = true
      error.value = ''
      return true
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || 'Push ulanmadi'
      console.warn('[push]', error.value)
      return false
    }
  }

  const unsubscribe = async () => {
    if (!supported.value) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await useApi('/push/unsubscribe', {
          method: 'POST',
          body: { endpoint: sub.endpoint },
        })
        await sub.unsubscribe()
      }
      subscribed.value = false
    } catch (e) {
      console.warn('[push] unsubscribe', e)
    }
  }

  return { supported, subscribed, error, subscribe, unsubscribe }
}
