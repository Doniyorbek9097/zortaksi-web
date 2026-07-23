/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Offline navigation fallback — only if `/` was precached (SSR/Nuxt often skips HTML).
try {
  const handler = createHandlerBoundToURL('/')
  registerRoute(
    new NavigationRoute(handler, {
      denylist: [/^\/api\//, /^\/sw\.js$/, /^\/manifest\.webmanifest$/, /^\/workbox-/],
    })
  )
} catch {
  /* no precached index — online navigations still work */
}

function iconUrl(path: string) {
  return new URL(path, self.location.origin).href
}

const PREFS_CACHE = 'app-prefs'
const SOUND_PREF_KEY = '/__notification_sound__'
let soundEnabled = true

async function loadSoundPref() {
  try {
    const cache = await caches.open(PREFS_CACHE)
    const res = await cache.match(SOUND_PREF_KEY)
    if (res) {
      const data = await res.json()
      soundEnabled = data.enabled !== false
    }
  } catch {
    /* ignore */
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_NOTIFICATION_SOUND') {
    soundEnabled = event.data.enabled !== false
  }
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      await loadSoundPref()

      let data: {
        title?: string
        body?: string
        url?: string
        type?: string
        orderId?: string
        chatId?: string
        messageId?: string
      } = {
        title: 'ZorTaksi',
        body: '',
        url: '/driver/orders',
      }

      try {
        if (event.data) data = { ...data, ...event.data.json() }
      } catch {
        /* ignore */
      }

      const tag =
        data.type === 'chat' && data.chatId
          ? `chat-${data.chatId}`
          : data.orderId
            ? `order-${data.orderId}`
            : `push-${Date.now()}`

      await self.registration.showNotification(data.title || 'ZorTaksi', {
        body: data.body || 'Yangi bildirishnoma',
        icon: iconUrl('/logo.jpg'),
        badge: iconUrl('/icons/icon-64x64.png'),
        tag,
        data: {
          url: data.url || '/driver/orders',
          type: data.type || '',
          orderId: data.orderId || '',
          chatId: data.chatId || '',
          messageId: data.messageId || '',
        },
        vibrate: soundEnabled ? [200, 100, 200] : [],
        renotify: true,
        silent: !soundEnabled,
      })
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const rawUrl = event.notification.data?.url || '/driver/orders'
  const targetUrl = new URL(rawUrl, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (!client.url.startsWith(self.location.origin)) continue
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          url: rawUrl,
          data: event.notification.data || {},
        })
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
      return undefined
    })
  )
})
