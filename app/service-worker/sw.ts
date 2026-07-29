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

// Offline navigation — auth sahifalar denylist (boshqa user shell/keshiga tushmasin)
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
