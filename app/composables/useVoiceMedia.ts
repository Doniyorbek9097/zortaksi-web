/**
 * Chat media (voice/photo) auth bilan yuklab, blob URL keshida saqlaydi.
 * Cross-origin <audio>/<img> cookie yubormasligi mumkin — shuning uchun fetch+blob.
 */
const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

export function useVoiceMedia() {
    return useChatMedia()
}

export function useChatMedia() {
    const getUrl = async (messageId: string): Promise<string> => {
        if (!messageId || messageId.startsWith('temp-')) return ''
        const hit = cache.get(messageId)
        if (hit) return hit

        const pending = inflight.get(messageId)
        if (pending) return pending

        const job = (async () => {
            const config = useRuntimeConfig()
            const token = useCookie('auth_token')
            const res = await fetch(`${config.public.baseUrl}/chats/messages/${messageId}/media`, {
                headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
                credentials: 'include',
            })
            if (!res.ok) throw new Error('Media yuklanmadi')
            const blob = await res.blob()
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
                getUrl(m._id).catch(() => {})
            }
        }
    }

    const revokeAll = () => {
        for (const url of cache.values()) URL.revokeObjectURL(url)
        cache.clear()
        inflight.clear()
    }

    return { getUrl, prefetch, revokeAll }
}
