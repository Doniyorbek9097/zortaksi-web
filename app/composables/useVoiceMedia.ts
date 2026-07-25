/**
 * Chat media (voice/photo) auth bilan yuklab, blob URL keshida saqlaydi.
 * Cross-origin <audio>/<img> cookie yubormasligi mumkin — shuning uchun fetch+blob.
 */
const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

function mimeFromResponse(res: Response, fallback: string): string {
  const raw = res.headers.get('Content-Type') || fallback
  return raw.split(';')[0]?.trim() || fallback
}

export function useVoiceMedia() {
  return useChatMedia()
}

export function useChatMedia() {
  /** Yuborilayotgan temp xabar uchun mahalliy blob URL (darhol ijro). */
  const setLocalUrl = (messageId: string, blob: Blob) => {
    if (!messageId || !import.meta.client) return
    const prev = cache.get(messageId)
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
    const url = URL.createObjectURL(blob)
    cache.set(messageId, url)
  }

  const adoptLocalUrl = (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return
    const url = cache.get(fromId)
    if (!url) return
    cache.set(toId, url)
    cache.delete(fromId)
  }

  const getUrl = async (messageId: string, kind: 'voice' | 'photo' = 'photo'): Promise<string> => {
    if (!messageId) return ''
    const hit = cache.get(messageId)
    if (hit) return hit

    if (messageId.startsWith('temp-')) return ''

    const pending = inflight.get(messageId)
    if (pending) return pending

    const fallbackMime = kind === 'voice' ? 'audio/mp4' : 'image/jpeg'

    const job = (async () => {
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
      const url = URL.createObjectURL(blob)
      cache.set(messageId, url)
      return url
    })()

    inflight.set(messageId, job)
    try {
      return await job
    } finally {
      inflight.delete(messageId)
    }
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
  }

  return { getUrl, setLocalUrl, adoptLocalUrl, prefetch, revokeAll }
}
