/**
 * Chat media (voice/photo):
 * 1) xotira blob URL (sessiya)
 * 2) IndexedDB (qurilma — Telegram kelgan media uchun barqaror)
 * 3) server / Telegram on-demand
 */
import {
  idbGetMediaRecord,
  idbPutMedia,
  idbDeleteMedia,
  idbMediaStats,
} from '~/utils/mediaIdb'
import { isCorruptMediaBlob, isValidMediaBlob } from '~/utils/mediaBlobValidate'
import {
  ensureMediaCacheReady,
  clearMediaCachesOnly,
} from '~/utils/mediaCacheReady'
import { agentDebugLog } from '~/utils/agentDebugLog'
import { api } from '~/config/axios'
import { getAuthCookieOptions } from '~/utils/authCookie'
import { resolveAuthToken } from '~/utils/activeAccount'
import { buildApiUrl } from '~/utils/buildApiUrl'
import type { InjectionKey } from 'vue'

/** Interest chat: /orders/.../messages/:id/media */
export type ChatMediaUrlBuilder = (messageId: string) => string
export const chatMediaUrlKey: InjectionKey<ChatMediaUrlBuilder> = Symbol('ztChatMediaUrl')

export type GetMediaUrlOpts = {
  forceNetwork?: boolean
  urlBuilder?: ChatMediaUrlBuilder | null
  /** Serverdagi mediaPath — o'zgarganda eski IDB ishlatilmaydi */
  mediaPath?: string | null
}

const MAX_MEMORY_ENTRIES = 96
/** Sessiya blob URL — barcha bubble lar ulashadi, unmount da revoke qilinmaydi */
const cache = new Map<string, string>()
const cacheMediaPath = new Map<string, string>()
const cacheOrder: string[] = []
const inflight = new Map<string, Promise<string>>()
/** Yuborilayotgan temp preview */
const localOnly = new Set<string>()

function normalizeMessageId(messageId: string): string {
  return String(messageId || '').trim()
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
  const id = normalizeMessageId(messageId)
  if (!id) return
  const prev = cache.get(id)
  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
  cache.delete(id)
  cacheMediaPath.delete(id)
  localOnly.delete(id)
  const i = cacheOrder.indexOf(id)
  if (i >= 0) cacheOrder.splice(i, 1)
}

export function invalidateChatMediaCache(messageId: string) {
  const id = normalizeMessageId(messageId)
  if (!id) return
  revokeCachedUrl(id)
  void idbDeleteMedia(id)
}

export function invalidateChatMediaCaches(messageIds: string[]) {
  for (const raw of messageIds) invalidateChatMediaCache(raw)
}

export const mediaCacheEpoch = ref(0)

function resolveMediaRequestUrl(
  messageId: string,
  urlBuilder?: ChatMediaUrlBuilder | null,
): string {
  const config = useRuntimeConfig()
  let base = String(config.public.baseUrl || '').replace(/\/$/, '')
  if (import.meta.client && /localhost|127\.0\.0\.1/i.test(base)) {
    base = 'https://api.zortaksi.uz/api/v1'
  }
  const cb = Date.now()
  if (urlBuilder) {
    const built = urlBuilder(messageId)
    const sep = built.includes('?') ? '&' : '?'
    return `${built}${sep}_cb=${cb}`
  }
  return `${buildApiUrl(base, `/chats/messages/${messageId}/media`)}?_cb=${cb}`
}

async function fetchMediaBlobFromNetwork(
  messageId: string,
  kind: 'voice' | 'photo',
  urlBuilder?: ChatMediaUrlBuilder | null,
): Promise<Blob> {
  const fallbackMime = kind === 'voice' ? 'audio/ogg' : 'image/jpeg'
  const cookie = useCookie('auth_token', { ...getAuthCookieOptions() })
  const token = resolveAuthToken(cookie.value)
  const url = resolveMediaRequestUrl(messageId, urlBuilder)

  let res: { data: Blob; status: number; headers: Record<string, string> }
  try {
    res = await api.get<Blob>(url, {
      responseType: 'blob',
      timeout: 120_000,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
  } catch (err: any) {
    const status = err?.response?.status
    const errBody =
      err?.response?.data instanceof Blob
        ? await err.response.data.text().catch(() => '')
        : String(err?.response?.data || err?.message || '')
    agentDebugLog({
      hypothesisId: 'B',
      location: 'useVoiceMedia.ts:fetchMediaBlobFromNetwork',
      message: 'media_http_error',
      data: {
        messageId,
        kind,
        status,
        hasToken: !!token,
        mediaUrl: url,
        errBody: String(errBody).slice(0, 120),
      },
    })
    throw new Error('Media yuklanmadi')
  }

  const ct = String(
    (res.headers as Record<string, string> | undefined)?.['content-type'] || fallbackMime,
  )
  let mime = ct.split(';')[0]?.trim() || fallbackMime
  if (/json|text\/html|text\/plain/i.test(mime)) {
    throw new Error('Media yuklanmadi')
  }

  const raw = res.data
  if (kind === 'photo' && (!mime.startsWith('image/') || /json|text/i.test(mime))) {
    mime = 'image/jpeg'
  }
  if (kind === 'voice' && (/json|text/i.test(mime) || !mime.startsWith('audio/'))) {
    mime = raw.type?.startsWith('audio/') ? raw.type.split(';')[0]! : fallbackMime
  }
  const blob = raw.type === mime ? raw : new Blob([raw], { type: mime })

  if (!blob.size) throw new Error('Media bo\'sh')
  if (await isCorruptMediaBlob(blob, kind)) {
    throw new Error('Media yuklanmadi')
  }
  return blob
}

function isRemoteMediaPath(mediaPath?: string | null): boolean {
  const p = String(mediaPath || '').trim()
  return !p || p === 'remote'
}

function idbPathMatches(stored?: string, expected?: string | null): boolean {
  const exp = String(expected || '').trim()
  if (!exp || exp === 'remote') return true
  const got = String(stored || '').trim()
  if (!got) return false
  return got === exp
}

async function loadFromIdb(
  id: string,
  kind: 'voice' | 'photo',
  mediaPath?: string | null,
): Promise<Blob | null> {
  const row = await idbGetMediaRecord(id)
  const idbBlob = row?.blob
  if (!idbBlob?.size) return null
  if (!idbPathMatches(row?.mediaPath, mediaPath)) {
    void idbDeleteMedia(id)
    return null
  }
  if (!(await isValidMediaBlob(idbBlob, kind))) {
    void idbDeleteMedia(id)
    return null
  }
  return idbBlob
}

async function blobToObjectUrl(
  messageId: string,
  blob: Blob,
  kind: 'voice' | 'photo',
  persistIdb: boolean,
  mediaPath?: string | null,
): Promise<string> {
  if (await isCorruptMediaBlob(blob, kind)) {
    void idbDeleteMedia(messageId)
    throw new Error('Media buzilgan')
  }

  if (persistIdb && !messageId.startsWith('temp-') && !isRemoteMediaPath(mediaPath)) {
    void idbPutMedia(messageId, blob, kind, mediaPath)
  }

  const existing = cache.get(messageId)
  if (existing && localOnly.has(messageId)) {
    return existing
  }

  const url = URL.createObjectURL(blob)
  if (existing?.startsWith('blob:') && existing !== url) {
    URL.revokeObjectURL(existing)
  }
  cache.set(messageId, url)
  if (mediaPath && !isRemoteMediaPath(mediaPath)) {
    cacheMediaPath.set(messageId, String(mediaPath).trim())
  }
  touchCacheOrder(messageId)
  localOnly.delete(messageId)
  return url
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

  const peekUrl = (messageId: string, mediaPath?: string | null): string => {
    const id = normalizeMessageId(messageId)
    const url = cache.get(id) || ''
    if (!url) return ''
    const expected = String(mediaPath || '').trim()
    if (expected && expected !== 'remote') {
      const stored = cacheMediaPath.get(id)
      if (stored && stored !== expected) return ''
    }
    return url
  }

  const setLocalUrl = (messageId: string, blob: Blob) => {
    const id = normalizeMessageId(messageId)
    if (!id || !import.meta.client) return
    revokeCachedUrl(id)
    const url = URL.createObjectURL(blob)
    cache.set(id, url)
    touchCacheOrder(id)
    localOnly.add(id)
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
    const mediaPath = opts.mediaPath

    if (isRemoteMediaPath(mediaPath)) {
      return ''
    }

    if (opts.forceNetwork) {
      if (!localOnly.has(id)) revokeCachedUrl(id)
      void idbDeleteMedia(id)
    }

    if (localOnly.has(id) || id.startsWith('temp-')) {
      return cache.get(id) || ''
    }

    const cached = cache.get(id)
    if (cached && !opts.forceNetwork) {
      const expected = String(mediaPath || '').trim()
      if (expected && expected !== 'remote') {
        const stored = cacheMediaPath.get(id)
        if (stored && stored !== expected) {
          revokeCachedUrl(id)
        } else {
          touchCacheOrder(id)
          return cached
        }
      } else {
        touchCacheOrder(id)
        return cached
      }
    }

    if (!opts.forceNetwork) {
      const pending = inflight.get(id)
      if (pending) {
        try {
          return await pending
        } catch {
          /* */
        }
      }
    }

    const job = (async () => {
      if (!opts.forceNetwork) {
        const idbBlob = await loadFromIdb(id, kind, mediaPath)
        if (idbBlob) {
          return blobToObjectUrl(id, idbBlob, kind, false, mediaPath)
        }
      }

      try {
        const blob = await fetchMediaBlobFromNetwork(id, kind, builder)
        return blobToObjectUrl(id, blob, kind, true, mediaPath)
      } catch (err) {
        if (!opts.forceNetwork) {
          const idbBlob = await loadFromIdb(id, kind, mediaPath)
          if (idbBlob) {
            return blobToObjectUrl(id, idbBlob, kind, false, mediaPath)
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

  /** Chiquvchi temp — serverdan yuklab IDB ga yozish */
  const upgradeFromServer = (messageId: string, kind: 'voice' | 'photo') => {
    const id = normalizeMessageId(messageId)
    if (!id || id.startsWith('temp-') || !localOnly.has(id)) return
    void (async () => {
      try {
        const blob = await fetchMediaBlobFromNetwork(id, kind, injectedUrlBuilder)
        if (!localOnly.has(id)) return
        await blobToObjectUrl(id, blob, kind, true, undefined)
      } catch {
        const url = cache.get(id)
        if (!url) return
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
    })()
  }

  /** Fon: IDB ga oldindan yozish (faqat diskda tayyor media) */
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
      if (isRemoteMediaPath(m.mediaPath) && !m.tgMessageId) continue
      if (isRemoteMediaPath(m.mediaPath)) continue
      const kind = isVoice ? 'voice' : 'photo'
      getUrl(id, kind, { urlBuilder, mediaPath: m.mediaPath }).catch(() => {})
    }
  }

  const revokeAll = () => {
    for (const url of cache.values()) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    cache.clear()
    cacheMediaPath.clear()
    cacheOrder.length = 0
    inflight.clear()
    localOnly.clear()
  }

  const clearDeviceCache = async () => {
    revokeAll()
    await clearMediaCachesOnly()
    mediaCacheEpoch.value += 1
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
    invalidateMany: invalidateChatMediaCaches,
    getCacheStats,
    mediaCacheEpoch: readonly(mediaCacheEpoch),
  }
}
