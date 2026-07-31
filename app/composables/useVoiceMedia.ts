/**
 * Chat media (voice/photo):
 * 1) memory blob URL
 * 2) IndexedDB (qurilma keshi)
 * 3) server → Telegram on-demand
 */
import {
  idbGetMedia,
  idbPutMedia,
  idbDeleteMedia,
  idbClearMedia,
  idbMediaStats,
} from '~/utils/mediaIdb'
import { isCorruptMediaBlob, isValidMediaBlob } from '~/utils/mediaBlobValidate'
import { ensureMediaCacheReady, MEDIA_CACHE_SCHEMA_VERSION } from '~/utils/mediaCacheReady'
import { agentDebugLog } from '~/utils/agentDebugLog'
import type { InjectionKey } from 'vue'

/** Interest chat: /orders/.../messages/:id/media */
export type ChatMediaUrlBuilder = (messageId: string) => string
export const chatMediaUrlKey: InjectionKey<ChatMediaUrlBuilder> = Symbol('ztChatMediaUrl')

export type GetMediaUrlOpts = {
  forceNetwork?: boolean
  /** Interest chat prefetch — inject o'rniga aniq URL */
  urlBuilder?: ChatMediaUrlBuilder | null
}

const MAX_MEMORY_ENTRIES = 96
const cache = new Map<string, string>()
const cacheOrder: string[] = []
const inflight = new Map<string, Promise<string>>()
/** temp→real handoff: mahalliy preview server javobigacha saqlanadi */
const localOnly = new Set<string>()

function normalizeMessageId(messageId: string): string {
  return String(messageId || '').trim()
}

function mimeFromResponse(res: Response, fallback: string): string {
  const raw = res.headers.get('Content-Type') || fallback
  return raw.split(';')[0]?.trim() || fallback
}

function touchCacheOrder(id: string) {
  const i = cacheOrder.indexOf(id)
  if (i >= 0) cacheOrder.splice(i, 1)
  cacheOrder.push(id)
  while (cacheOrder.length > MAX_MEMORY_ENTRIES) {
    let evicted = false
    for (let j = 0; j < cacheOrder.length; j++) {
      const victim = cacheOrder[j]
      if (!victim || localOnly.has(victim)) continue
      cacheOrder.splice(j, 1)
      revokeCachedUrl(victim)
      evicted = true
      break
    }
    if (!evicted) break
  }
}

function revokeCachedUrl(messageId: string) {
  const prev = cache.get(messageId)
  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
  cache.delete(messageId)
  localOnly.delete(messageId)
  const i = cacheOrder.indexOf(messageId)
  if (i >= 0) cacheOrder.splice(i, 1)
}

/** Buzilgan kesh — memory + IndexedDB */
export function invalidateChatMediaCache(messageId: string) {
  const id = normalizeMessageId(messageId)
  if (!id) return
  revokeCachedUrl(id)
  void idbDeleteMedia(id)
}

function resolveApiBase(): string {
  const config = useRuntimeConfig()
  let apiBase = String(config.public.baseUrl || '')
  if (/localhost|127\.0\.0\.1/i.test(apiBase)) {
    apiBase = 'https://api.zortaksi.uz/api/v1'
  }
  return apiBase.replace(/\/$/, '')
}

async function fetchMediaBlobFromNetwork(
  messageId: string,
  kind: 'voice' | 'photo',
  urlBuilder?: ChatMediaUrlBuilder | null,
): Promise<Blob> {
  const fallbackMime = kind === 'voice' ? 'audio/ogg' : 'image/jpeg'
  const token = useCookie('auth_token')
  const signal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(120_000)
      : undefined
  const apiBase = resolveApiBase()
  let url = urlBuilder
    ? urlBuilder(messageId)
    : `${apiBase}/chats/messages/${messageId}/media`
  const sep = url.includes('?') ? '&' : '?'
  url = `${url}${sep}_cb=${Date.now()}`
  const res = await fetch(url, {
    headers: token.value
      ? {
          Authorization: `Bearer ${token.value}`,
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        }
      : { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    credentials: 'include',
    cache: 'no-store',
    signal,
  })
  let errBody = ''
  if (!res.ok) {
    try {
      errBody = (await res.clone().text()).slice(0, 120)
    } catch {
      /* */
    }
  }
  agentDebugLog({
    hypothesisId: 'B',
    location: 'useVoiceMedia.ts:fetchMediaBlobFromNetwork',
    message: 'media_http_response',
    data: {
      messageId,
      kind,
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('Content-Type'),
      contentLength: res.headers.get('Content-Length'),
      hasToken: !!token.value,
      apiBase,
      mediaUrl: url,
      errBody,
      runId: 'chat-page-fix',
    },
  })
  if (!res.ok) throw new Error('Media yuklanmadi')

  let mime = mimeFromResponse(res, fallbackMime)
  if (/json|text\/html|text\/plain/i.test(mime)) {
    throw new Error('Media yuklanmadi')
  }

  const raw = await res.blob()
  if (kind === 'photo' && (!mime.startsWith('image/') || /json|text/i.test(mime))) {
    mime = 'image/jpeg'
  }
  if (kind === 'voice' && (/json|text/i.test(mime) || !mime.startsWith('audio/'))) {
    mime = raw.type?.startsWith('audio/') ? raw.type.split(';')[0]! : fallbackMime
  }
  const blob = raw.type === mime ? raw : new Blob([raw], { type: mime })

  agentDebugLog({
    hypothesisId: 'C',
    location: 'useVoiceMedia.ts:fetchMediaBlobFromNetwork',
    message: 'media_blob_ready',
    data: {
      messageId,
      kind,
      blobSize: blob.size,
      blobType: blob.type,
      headerMime: mime,
      rawType: raw.type,
    },
  })

  if (!blob.size) throw new Error('Media bo\'sh')
  if (await isCorruptMediaBlob(blob, kind)) {
    throw new Error('Media yuklanmadi')
  }
  return blob
}

async function blobToObjectUrl(
  messageId: string,
  blob: Blob,
  kind: 'voice' | 'photo',
  persistIdb: boolean,
): Promise<string> {
  if (await isCorruptMediaBlob(blob, kind)) {
    void idbDeleteMedia(messageId)
    throw new Error('Media buzilgan')
  }

  if (persistIdb && !messageId.startsWith('temp-')) {
    void idbPutMedia(messageId, blob, kind)
  }
  const url = URL.createObjectURL(blob)
  const existing = cache.get(messageId)
  if (existing && localOnly.has(messageId)) {
    URL.revokeObjectURL(url)
    return existing
  }
  if (existing?.startsWith('blob:') && existing !== url) {
    URL.revokeObjectURL(existing)
  }
  cache.set(messageId, url)
  touchCacheOrder(messageId)
  localOnly.delete(messageId)
  return url
}

async function loadFromIdb(
  id: string,
  kind: 'voice' | 'photo',
): Promise<Blob | null> {
  const idbBlob = await idbGetMedia(id)
  if (!idbBlob?.size) return null
  if (!(await isValidMediaBlob(idbBlob, kind))) {
    void idbDeleteMedia(id)
    return null
  }
  return idbBlob
}

export function useVoiceMedia() {
  return useChatMedia()
}

export function useChatMedia() {
  let injectedUrlBuilder: ChatMediaUrlBuilder | null = null
  try {
    injectedUrlBuilder = inject(chatMediaUrlKey, null)
  } catch {
    injectedUrlBuilder = null
  }

  const resolveBuilder = (override?: ChatMediaUrlBuilder | null) => {
    if (override !== undefined) return override
    return injectedUrlBuilder
  }

  const peekUrl = (messageId: string): string => cache.get(normalizeMessageId(messageId)) || ''

  const setLocalUrl = (messageId: string, blob: Blob) => {
    const id = normalizeMessageId(messageId)
    if (!id || !import.meta.client) return
    revokeCachedUrl(id)
    const url = URL.createObjectURL(blob)
    cache.set(id, url)
    touchCacheOrder(id)
    localOnly.add(id)
    if (!id.startsWith('temp-')) {
      void (async () => {
        const kind = blob.type.startsWith('image/') ? 'photo' : 'voice'
        if (!(await isCorruptMediaBlob(blob, kind))) {
          await idbPutMedia(id, blob, kind)
        }
      })()
    }
  }

  const adoptLocalUrl = (fromId: string, toId: string) => {
    const from = normalizeMessageId(fromId)
    const to = normalizeMessageId(toId)
    if (!from || !to || from === to) return
    const url = cache.get(from)
    if (!url) return
    const keepLocal = localOnly.has(from)
    cache.delete(from)
    localOnly.delete(from)
    const fi = cacheOrder.indexOf(from)
    if (fi >= 0) cacheOrder.splice(fi, 1)
    cache.set(to, url)
    touchCacheOrder(to)
    if (keepLocal) localOnly.add(to)

    void (async () => {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const kind = blob.type.startsWith('image/') ? 'photo' : 'voice'
        if (!(await isCorruptMediaBlob(blob, kind))) {
          await idbPutMedia(to, blob, kind)
        }
      } catch {
        /* */
      }
    })()
  }

  const getUrl = async (
    messageId: string,
    kind: 'voice' | 'photo' = 'photo',
    opts: GetMediaUrlOpts = {},
  ): Promise<string> => {
    await ensureMediaCacheReady()
    const id = normalizeMessageId(messageId)
    if (!id) return ''
    const builder = resolveBuilder(opts.urlBuilder)

    if (opts.forceNetwork) {
      if (!localOnly.has(id)) revokeCachedUrl(id)
      void idbDeleteMedia(id)
    }

    const cached = cache.get(id)
    if (cached && !opts.forceNetwork) {
      touchCacheOrder(id)
      return cached
    }

    if (id.startsWith('temp-')) return cache.get(id) || ''

    const pending = inflight.get(id)
    if (pending && !opts.forceNetwork) {
      try {
        await pending
      } catch {
        /* */
      }
      const afterPending = cache.get(id)
      if (afterPending) return afterPending
    }

    const job = (async () => {
      if (!opts.forceNetwork) {
        const idbBlob = await loadFromIdb(id, kind)
        if (idbBlob) {
          return blobToObjectUrl(id, idbBlob, kind, false)
        }
      }

      try {
        const blob = await fetchMediaBlobFromNetwork(id, kind, builder)
        return blobToObjectUrl(id, blob, kind, true)
      } catch (err) {
        if (!opts.forceNetwork) {
          const idbBlob = await loadFromIdb(id, kind)
          if (idbBlob) {
            return blobToObjectUrl(id, idbBlob, kind, false)
          }
        }
        throw err
      }
    })()

    inflight.set(id, job)
    try {
      return await job
    } catch (err) {
      revokeCachedUrl(id)
      throw err
    } finally {
      inflight.delete(id)
    }
  }

  const upgradeFromServer = (messageId: string, kind: 'voice' | 'photo') => {
    const id = normalizeMessageId(messageId)
    if (!id || id.startsWith('temp-') || !localOnly.has(id)) return
    void (async () => {
      try {
        const blob = await fetchMediaBlobFromNetwork(id, kind, injectedUrlBuilder)
        if (!localOnly.has(id)) return
        await blobToObjectUrl(id, blob, kind, true)
      } catch {
        const url = cache.get(id)
        if (url) {
          try {
            const res = await fetch(url)
            const blob = await res.blob()
            if (!(await isCorruptMediaBlob(blob, kind))) {
              await idbPutMedia(id, blob, kind)
            }
          } catch {
            /* */
          }
        }
      }
    })()
  }

  const prefetch = (
    messages: { _id: string; type?: string; mediaPath?: string; tgMessageId?: number }[],
    urlBuilder?: ChatMediaUrlBuilder | null,
  ) => {
    for (const m of messages) {
      const id = normalizeMessageId(m._id)
      if (!id || id.startsWith('temp-')) continue
      const isVoice = m.type === 'voice'
      const isPhoto = m.type === 'photo'
      if (!isVoice && !isPhoto) continue
      if (!m.mediaPath && !m.tgMessageId) continue
      const kind = isVoice ? 'voice' : 'photo'
      const opts: GetMediaUrlOpts = { urlBuilder }
      getUrl(id, kind, opts)
        .then(() => {
          if (!m.mediaPath || m.mediaPath === 'remote') {
            getUrl(id, kind, { ...opts, forceNetwork: true }).catch(() => {})
          }
        })
        .catch(() => {
          getUrl(id, kind, { ...opts, forceNetwork: true }).catch(() => {})
        })
    }
  }

  const revokeAll = () => {
    for (const url of cache.values()) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    cache.clear()
    cacheOrder.length = 0
    inflight.clear()
    localOnly.clear()
  }

  const clearDeviceCache = async () => {
    revokeAll()
    await idbClearMedia()
    if (import.meta.client) {
      try {
        localStorage.setItem('zt_media_cache_schema', MEDIA_CACHE_SCHEMA_VERSION)
      } catch {
        /* */
      }
    }
  }

  const invalidateMedia = (messageId: string) => {
    invalidateChatMediaCache(messageId)
  }

  const getCacheStats = () => idbMediaStats()

  return {
    getUrl,
    peekUrl,
    setLocalUrl,
    adoptLocalUrl,
    upgradeFromServer,
    prefetch,
    revokeAll,
    clearDeviceCache,
    invalidateMedia,
    getCacheStats,
  }
}
