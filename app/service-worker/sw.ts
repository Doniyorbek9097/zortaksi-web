/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'
import { NetworkOnly } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Chat media — hech qachon SW keshiga tushmasin (eski 404/JSON ushlanmasin)
registerRoute(
  ({ request, url }) =>
    request.method === 'GET' &&
    (url.pathname.endsWith('/media') || url.pathname.includes('/messages/') && /\/media$/.test(url.pathname)),
  new NetworkOnly(),
)

// Offline navigation — auth sahifalar denylist
try {
  const handler = createHandlerBoundToURL('/')
  registerRoute(
    new NavigationRoute(handler, {
      denylist: [
        /^\/api\//,
        /^\/sw\.js$/,
        /^\/manifest\.webmanifest$/,
        /^\/workbox-/,
        /^\/driver\//,
        /^\/admin\//,
        /^\/auth/,
        /^\/login/,
        /^\/register/,
      ],
    })
  )
} catch {
  /* no precached index — online navigations still work */
}
