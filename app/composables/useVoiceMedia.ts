/**
 * Chat media (voice/photo) auth bilan yuklab, blob URL keshida saqlaydi.
 * Cross-origin <audio>/<img> cookie yubormasligi mumkin — shuning uchun fetch+blob.
 */
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

async function fetchMediaBlob(messageId: string, kind: 'voice' | 'photo'): Promise<string> {
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
  const blob = raw.type === mime ? raw : new Blob([raw], { type: mime })
  return URL.createObjectURL(blob)
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
        /* inflight xato — kesh/local qayta tekshiriladi */
      }
      const afterPending = cache.get(id)
      if (afterPending) return afterPending
    }

    const job = (async () => {
      const url = await fetchMediaBlob(id, kind)
      const existing = cache.get(id)
      if (existing && localOnly.has(id)) {
        URL.revokeObjectURL(url)
        return existing
      }
      if (existing?.startsWith('blob:') && existing !== url) {
        URL.revokeObjectURL(existing)
      }
      cache.set(id, url)
      localOnly.delete(id)
      return url
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
        const url = await fetchMediaBlob(id, kind)
        if (!localOnly.has(id)) {
          URL.revokeObjectURL(url)
          return
        }
        const prev = cache.get(id)
        cache.set(id, url)
        localOnly.delete(id)
        if (prev?.startsWith('blob:') && prev !== url) URL.revokeObjectURL(prev)
      } catch {
        /* Mahalliy preview ishlayveradi */
      }
    })()
  }

  /** Voice va rasmlarni oldindan yuklaydi */
  const prefetch = (messages: { _id: string; type?: string; mediaPath?: string }[]) => {
    for (const m of messages) {
      if ((m.type === 'voice' || m.type === 'photo') && m.mediaPath && !m._id.startsWith('temp-')) {
        getUrl(m._id, m.type === 'voice' ? 'voice' : 'photo').catch(() => {})
      }
    }
  }

  const revokeAll = () => {
    for (const url of cache.values()) URL.revokeObjectURL(url)
    cache.clear()
    inflight.clear()
    localOnly.clear()
  }

  return { getUrl, peekUrl, setLocalUrl, adoptLocalUrl, upgradeFromServer, prefetch, revokeAll }
}
