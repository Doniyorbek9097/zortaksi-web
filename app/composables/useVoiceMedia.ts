/**
 * Chat media (voice/photo):
 * - Yuborilayotgan xabar: mahalliy blob (temp)
 * - Qolganlari: har safar serverdan (IndexedDB / uzoq kesh yo'q)
 */
import { idbClearMedia, idbDeleteMedia, idbMediaStats } from '~/utils/mediaIdb'
import { isCorruptMediaBlob } from '~/utils/mediaBlobValidate'
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
}

/** Faqat yuborilayotgan temp preview */
const localUrls = new Map<string, string>()
const localOnly = new Set<string>()
const inflight = new Map<string, Promise<string>>()

function normalizeMessageId(messageId: string): string {
  return String(messageId || '').trim()
}

function revokeLocalUrl(messageId: string) {
  const id = normalizeMessageId(messageId)
  if (!id) return
  const url = localUrls.get(id)
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  localUrls.delete(id)
  localOnly.delete(id)
}

/** Eski IndexedDB yozuvi + mahalliy preview tozalash */
export function invalidateChatMediaCache(messageId: string) {
  const id = normalizeMessageId(messageId)
  if (!id) return
  revokeLocalUrl(id)
  void idbDeleteMedia(id)
}

export function invalidateChatMediaCaches(messageIds: string[]) {
  for (const raw of messageIds) invalidateChatMediaCache(raw)
}

/** Profil / chat o'chirish — bubble qayta yuklash */
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
        'Cache-Control': 'no-cache, no-store',
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

  const peekUrl = (messageId: string): string =>
    localUrls.get(normalizeMessageId(messageId)) || ''

  /** Yuborilayotgan ovoz/rasm preview (faqat shu sessiya) */
  const setLocalUrl = (messageId: string, blob: Blob) => {
    const id = normalizeMessageId(messageId)
    if (!id || !import.meta.client) return
    revokeLocalUrl(id)
    const url = URL.createObjectURL(blob)
    localUrls.set(id, url)
    localOnly.add(id)
  }

  const adoptLocalUrl = (fromId: string, toId: string) => {
    const from = normalizeMessageId(fromId)
    const to = normalizeMessageId(toId)
    if (!from || !to || from === to) return
    const url = localUrls.get(from)
    if (!url) return
    localUrls.delete(from)
    localOnly.delete(from)
    localUrls.set(to, url)
    localOnly.add(to)
  }

  /**
   * Serverdan to'g'ridan-to'g'ri blob URL (keshsiz).
   * Caller blob URL ni unmount da revoke qilishi kerak.
   */
  const getUrl = async (
    messageId: string,
    kind: 'voice' | 'photo' = 'photo',
    opts: GetMediaUrlOpts = {},
  ): Promise<string> => {
    await ensureMediaCacheReady()
    const id = normalizeMessageId(messageId)
    if (!id) return ''
    const builder = resolveBuilder(opts.urlBuilder)

    if (localOnly.has(id) || id.startsWith('temp-')) {
      return localUrls.get(id) || ''
    }

    if (!opts.forceNetwork) {
      const pending = inflight.get(id)
      if (pending) {
        try {
          return await pending
        } catch {
          /* qayta urinadi */
        }
      }
    }

    const job = (async () => {
      const blob = await fetchMediaBlobFromNetwork(id, kind, builder)
      return URL.createObjectURL(blob)
    })()

    inflight.set(id, job)
    try {
      return await job
    } finally {
      inflight.delete(id)
    }
  }

  /** Outgoing temp — server javobidan keyin endi kerak emas */
  const upgradeFromServer = (_messageId: string, _kind: 'voice' | 'photo') => {}

  /** Kesh yo'q — fon yuklash o'chirilgan */
  const prefetch = (
    _messages: { _id: string; type?: string; mediaPath?: string; tgMessageId?: number }[],
    _urlBuilder?: ChatMediaUrlBuilder | null,
  ) => {}

  const revokeAll = () => {
    for (const url of localUrls.values()) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    }
    localUrls.clear()
    localOnly.clear()
    inflight.clear()
  }

  const clearDeviceCache = async () => {
    revokeAll()
    await clearMediaCachesOnly()
    mediaCacheEpoch.value += 1
  }

  const invalidateMedia = (messageId: string) => {
    invalidateChatMediaCache(messageId)
  }

  const getCacheStats = async () => {
    const legacy = await idbMediaStats()
    let bytes = 0
    for (const url of localUrls.values()) {
      try {
        const res = await fetch(url)
        const b = await res.blob()
        bytes += b.size
      } catch {
        /* */
      }
    }
    return {
      count: localUrls.size + legacy.count,
      bytes: bytes + legacy.bytes,
    }
  }

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
