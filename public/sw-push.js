/* eslint-disable no-restricted-globals */
function iconUrl(path) {
  return new URL(path, self.location.origin).href;
}

const PREFS_CACHE = 'app-prefs';
const SOUND_PREF_KEY = '/__notification_sound__';
let soundEnabled = true;

async function loadSoundPref() {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match(SOUND_PREF_KEY);
    if (res) {
      const data = await res.json();
      soundEnabled = data.enabled !== false;
    }
  } catch {
    /* ignore */
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_NOTIFICATION_SOUND') {
    soundEnabled = event.data.enabled !== false;
  }
});

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    await loadSoundPref();

    let data = {
      title: 'Yangi buyurtma!',
      body: '',
      url: '/orders',
      orderId: '',
    };

    try {
      if (event.data) {
        const parsed = event.data.json();
        data = { ...data, ...parsed };
      }
    } catch {
      /* ignore */
    }

    const options = {
      body: data.body || 'Yangi e\'lon keldi',
      icon: iconUrl('/icons/icon-192x192.png'),
      badge: iconUrl('/icons/icon-64x64.png'),
      tag: data.orderId ? 'order-' + data.orderId : 'new-order',
      data: { url: data.url || '/orders', orderId: data.orderId || '' },
      vibrate: soundEnabled ? [200, 100, 200] : [],
      renotify: true,
      requireInteraction: false,
      silent: !soundEnabled,
    };

    await self.registration.showNotification(data.title, options);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawUrl = event.notification.data?.url || '/orders';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (!client.url.startsWith(self.location.origin)) continue;
        client.postMessage({ type: 'NOTIFICATION_CLICK', url: rawUrl });
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    }),
  );
});
