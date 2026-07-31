import { idbClearMedia } from '~/utils/mediaIdb'

/** O'zgarganda media IDB + Workbox kesh tozalanadi (auth/cookie saqlanadi) */
export const MEDIA_CACHE_SCHEMA_VERSION = '5'

const LS_KEY = 'zt_media_cache_schema'

let readyPromise: Promise<void> | null = null

/** Workbox / HTTP Cache Storage — cookie va localStorage ga tegmaydi */
async function clearWorkboxCaches(): Promise<void> {
  if (typeof caches === 'undefined') return
  const keys = await caches.keys()
  await Promise.all(keys.map((k) => caches.delete(k)))
}

async function refreshServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    await reg?.update()
  } catch {
    /* */
  }
}

/**
 * Ilova ochilganda bir marta:
 * - IndexedDB media
 * - Cache Storage (eski JS / 404 media javoblari)
 * Auth token va zt_accounts localStorage o'zgarmaydi.
 */
export function ensureMediaCacheReady(): Promise<void> {
  if (!import.meta.client) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = (async () => {
      try {
        const prev = localStorage.getItem(LS_KEY)
        if (prev === MEDIA_CACHE_SCHEMA_VERSION) return
        localStorage.setItem(LS_KEY, MEDIA_CACHE_SCHEMA_VERSION)
        await Promise.all([idbClearMedia(), clearWorkboxCaches(), refreshServiceWorker()])
      } catch {
        /* */
      }
    })()
  }
  return readyPromise
}

/** Profil: faqat media kesh (auth saqlanadi) */
export async function clearMediaCachesOnly(): Promise<void> {
  await Promise.all([idbClearMedia(), clearWorkboxCaches()])
  try {
    localStorage.setItem(LS_KEY, MEDIA_CACHE_SCHEMA_VERSION)
  } catch {
    /* */
  }
}
