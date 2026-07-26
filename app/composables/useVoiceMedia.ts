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
  // Kelgan voice serverdan M4A (audio/mp4) keladi — brauzer/WebView ijro qiladi
  const fallbackMime = kind === 'voice' ? 'audio/mp4' : 'image/jpeg'
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const signal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(120_000)
      : undefined
  const res = await fetch(`${config.public.baseUrl}/chats/messages/${messageId}/media`, {
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    credentials: 'include',
    signal,
  })
  if (!res.ok) throw new Error('Media yuklanmadi')
  const mime = mimeFromResponse(res, fallbackMime)
  const raw = await res.blob()
  return raw.type === mime ? raw : new Blob([raw], { type: mime })
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

    const cached = cache.get(id)
    if (cached && (!opts.forceNetwork || !localOnly.has(id))) return cached

    if (id.startsWith('temp-')) return cache.get(id) || ''

    const pending = inflight.get(id)
    if (pending) {
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
        // Eski OGG kesh (ijro bo'lmagan) — M4A uchun serverdan qayta olish
        const staleOgg =
          kind === 'voice' &&
          idbBlob &&
          /ogg|opus/i.test(idbBlob.type || '')
        if (idbBlob?.size && !staleOgg) {
          return blobToObjectUrl(id, idbBlob, kind, false)
        }
      }

      // 2) Server → Telegram (voice M4A)
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
   * mediaPath 'remote' yoki bo'sh bo'lsa ham — Telegramdan olinadi.
   */
  const prefetch = (
    messages: { _id: string; type?: string; mediaPath?: string; tgMessageId?: number }[],
  ) => {
    for (const m of messages) {
      if (m._id.startsWith('temp-')) continue
      const isVoice = m.type === 'voice'
      const isPhoto = m.type === 'photo'
      if (!isVoice && !isPhoto) continue
      // 'remote' — hali serverga yuklanmagan, kutamiz (socket update)
      if (!m.mediaPath || m.mediaPath === 'remote') continue
      getUrl(m._id, isVoice ? 'voice' : 'photo').catch(() => {})
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
