import { ensureMediaCacheReady } from '~/utils/mediaCacheReady'

/** Chat media IDB migratsiyasi — app ishga tushishidan oldin */
export default defineNuxtPlugin(() => {
  void ensureMediaCacheReady()
})
