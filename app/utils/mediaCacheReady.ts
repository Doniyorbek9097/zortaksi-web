import { idbClearMedia } from '~/utils/mediaIdb'

/** O'zgarganda barcha qurilmalarda media IDB tozalanadi */
export const MEDIA_CACHE_SCHEMA_VERSION = '4'

const LS_KEY = 'zt_media_cache_schema'

let readyPromise: Promise<void> | null = null

/** Ilova ochilganda bir marta — eski buzilgan IDB ni to'liq o'chirish */
export function ensureMediaCacheReady(): Promise<void> {
  if (!import.meta.client) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = (async () => {
      try {
        const prev = localStorage.getItem(LS_KEY)
        if (prev === MEDIA_CACHE_SCHEMA_VERSION) return
        localStorage.setItem(LS_KEY, MEDIA_CACHE_SCHEMA_VERSION)
        await idbClearMedia()
      } catch {
        /* */
      }
    })()
  }
  return readyPromise
}
