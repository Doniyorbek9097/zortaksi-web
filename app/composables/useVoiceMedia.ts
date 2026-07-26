/**
 * Chat media (voice/photo):
 * 1) memory blob URL
 * 2) IndexedDB (qurilma keshi)
 * 3) server → Telegram on-demand
 */
import {
  idbGetMedia,
  idbPutMedia,
  idbClearMedia,
  idbMediaStats,
} from '~/utils/mediaIdb'
import { agentDebugLog } from '~/utils/agentDebugLog'

const cache = new Map<string, string>()
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

function revokeCachedUrl(messageId: string) {
  const prev = cache.get(messageId)
  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
  cache.delete(messageId)
  localOnly.delete(messageId)
}

async function fetchMediaBlobFromNetwork(
  messageId: string,
  kind: 'voice' | 'photo',
): Promise<Blob> {
  // Server M4A yoki OGG qaytarishi mumkin — Content-Type ga ishonamiz
  const fallbackMime = kind === 'voice' ? 'audio/ogg' : 'image/jpeg'
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const signal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(120_000)
      : undefined
  // Lokal API media bermaydi (disk yo'q + session Renderda) — productionga majburiy
  let apiBase = String(config.public.baseUrl || '')
  if (/localhost|127\.0\.0\.1/i.test(apiBase)) {
    apiBase = 'https://api.zortaksi.uz/api/v1'
  }
  const url = `${apiBase}/chats/messages/${messageId}/media`
  const res = await fetch(url, {
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    credentials: 'include',
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
  // #region agent log
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
      configBase: String(config.public.baseUrl || ''),
      errBody,
      runId: 'post-fix',
    },
  })
  // #endregion
  if (!res.ok) throw new Error('Media yuklanmadi')
  let mime = mimeFromResponse(res, fallbackMime)
  const raw = await res.blob()
  if (kind === 'photo' && (!mime.startsWith('image/') || /json|text/i.test(mime))) {
    mime = 'image/jpeg'
  }
  if (kind === 'voice' && (/json|text/i.test(mime) || !mime.startsWith('audio/'))) {
    mime = raw.type?.startsWith('audio/') ? raw.type.split(';')[0]! : fallbackMime
  }
  const blob = raw.type === mime ? raw : new Blob([raw], { type: mime })
  // #region agent log
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
  // #endregion
  if (!blob.size) throw new Error('Media bo\'sh')
  return blob
}

async function blobToObjectUrl(
  messageId: string,
  blob: Blob,
  kind: 'voice' | 'photo',
  persistIdb: boolean,
): Promise<string> {
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
  localOnly.delete(messageId)
  return url
}

export function useVoiceMedia() {
  return useChatMedia()
}

export function useChatMedia() {
  /** Keshdagi URL (sync) — temp xabarda ham ishlaydi */
  const peekUrl = (messageId: string): string => cache.get(normalizeMessageId(messageId)) || ''

  /** Yuborilayotgan temp xabar uchun mahalliy blob URL (darhol ijro). */
  const setLocalUrl = (messageId: string, blob: Blob) => {
    const id = normalizeMessageId(messageId)
    if (!id || !import.meta.client) return
    revokeCachedUrl(id)
    const url = URL.createObjectURL(blob)
    cache.set(id, url)
    localOnly.add(id)
    // Temp ham qurilmada saqlanadi — keyin real id ga ko'chiriladi
    if (!id.startsWith('temp-')) {
      void idbPutMedia(id, blob, blob.type.startsWith('image/') ? 'photo' : 'voice')
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
    cache.set(to, url)
    if (keepLocal) localOnly.add(to)

    // IndexedDB: temp blob ni real messageId ostida saqlash
    void (async () => {
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const kind = blob.type.startsWith('image/') ? 'photo' : 'voice'
        await idbPutMedia(to, blob, kind)
      } catch {
        /* */
      }
    })()
  }

  const getUrl = async (
    messageId: string,
    kind: 'voice' | 'photo' = 'photo',
    opts: { forceNetwork?: boolean } = {},
  ): Promise<string> => {
    const id = normalizeMessageId(messageId)
    if (!id) return ''

    // forceNetwork — keshni aylanib o'tadi (OGG/buzilgan blob qayta olinadi)
    const cached = cache.get(id)
    if (cached && !opts.forceNetwork) return cached
    if (opts.forceNetwork && cached && !localOnly.has(id)) {
      revokeCachedUrl(id)
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
      // 1) IndexedDB — tez lokal ijro
      if (!opts.forceNetwork) {
        const idbBlob = await idbGetMedia(id)
        // Faqat aniq buzilgan kesh — OGG ni rad etmaymiz (server shuni bersa play qilamiz)
        const staleVoice =
          kind === 'voice' &&
          !!idbBlob &&
          (!idbBlob.type || /octet-stream|json|text/i.test(idbBlob.type))
        const stalePhoto =
          kind === 'photo' &&
          !!idbBlob &&
          (!idbBlob.type || !idbBlob.type.startsWith('image/'))
        if (idbBlob?.size && !staleVoice && !stalePhoto) {
          return blobToObjectUrl(id, idbBlob, kind, false)
        }
      }

      // 2) Server → Telegram (voice M4A / audio/mp4)
      const blob = await fetchMediaBlobFromNetwork(id, kind)
      return blobToObjectUrl(id, blob, kind, true)
    })()

    inflight.set(id, job)
    try {
      return await job
    } catch (err) {
      const local = cache.get(id)
      if (local) return local
      throw err
    } finally {
      inflight.delete(id)
    }
  }

  /** Mahalliy preview mavjud bo'lsa, serverdan fon rejimida yangilash */
  const upgradeFromServer = (messageId: string, kind: 'voice' | 'photo') => {
    const id = normalizeMessageId(messageId)
    if (!id || id.startsWith('temp-') || !localOnly.has(id)) return
    void (async () => {
      try {
        const blob = await fetchMediaBlobFromNetwork(id, kind)
        if (!localOnly.has(id)) return
        await blobToObjectUrl(id, blob, kind, true)
      } catch {
        /* Mahalliy preview ishlayveradi — IndexedDB ga yozib qo'yamiz */
        const url = cache.get(id)
        if (url) {
          try {
            const res = await fetch(url)
            const blob = await res.blob()
            await idbPutMedia(id, blob, kind)
          } catch {
            /* */
          }
        }
      }
    })()
  }

  /**
   * Voice/photo oldindan yuklash.
   * 'remote' ham — server lazy Telegramdan yuklaydi (inbox).
   */
  const prefetch = (
    messages: { _id: string; type?: string; mediaPath?: string; tgMessageId?: number }[],
  ) => {
    for (const m of messages) {
      if (m._id.startsWith('temp-')) continue
      const isVoice = m.type === 'voice'
      const isPhoto = m.type === 'photo'
      if (!isVoice && !isPhoto) continue
      if (!m.mediaPath && !m.tgMessageId) continue
      const kind = isVoice ? 'voice' : 'photo'
      // remote: darhol + biroz kechiktirib qayta (fonda saqlanishi uchun)
      if (!m.mediaPath || m.mediaPath === 'remote') {
        getUrl(m._id, kind, { forceNetwork: true }).catch(() => {})
        setTimeout(() => {
          getUrl(m._id, kind, { forceNetwork: true }).catch(() => {})
        }, 2500)
        continue
      }
      getUrl(m._id, kind).catch(() => {})
    }
  }

  const revokeAll = () => {
    for (const url of cache.values()) URL.revokeObjectURL(url)
    cache.clear()
    inflight.clear()
    localOnly.clear()
  }

  /** Profil: memory + IndexedDB tozalash */
  const clearDeviceCache = async () => {
    revokeAll()
    await idbClearMedia()
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
    getCacheStats,
  }
}
