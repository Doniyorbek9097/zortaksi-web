import type { ChatStoreRefs } from '../types'

/**
 * Ulanish, presence va typing holatlari.
 * silent: true — UI loading ko'rsatilmaydi (allaqachon bog'langan chat).
 */
export function createConnectionActions(refs: ChatStoreRefs) {
    const {
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
        currentChat,
    } = refs

    let typingClearTimer: ReturnType<typeof setTimeout> | null = null

    /** Suhbatdosh onlayn / oxirgi kirishni yuklash */
    const fetchPresence = async (chatId: string) => {
        try {
            const res = await useApi(`/chats/${chatId}/presence`, { method: 'GET' })
            if (res.success) peerPresence.value = res.data
        } catch (error) {
            console.error('fetchPresence error:', error)
        }
    }

    /**
     * Senderga ulanishni tekshirish (xabar yubormasdan).
     * Transient timeout/network: bir necha marta qayta urinadi, UI connecting da qoladi.
     */
    const connect = async (chatId: string, opts: { silent?: boolean } = {}) => {
        const maxAttempts = opts.silent ? 1 : 3
        if (!opts.silent) {
            connectionStatus.value = 'connecting'
            connectionReason.value = ''
        }

        let lastError: any = null
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await useApi(`/chats/${chatId}/connect`, {
                    method: 'POST',
                    // Telegram resolve uzoqroq olishi mumkin — 8s yetmaydi
                    timeout: 45000,
                })
                if (res.success) {
                    const next = res.data?.status ?? 'unreachable'

                    // Transient unreachable — yana urinish (UI connecting da qoladi)
                    if (next === 'unreachable' && attempt < maxAttempts && !opts.silent) {
                        continue
                    }

                    // Silent: faqat ready/restricted yangilanadi — transient fail UI ni yopmasin
                    if (!opts.silent || next === 'ready' || next === 'restricted') {
                        connectionStatus.value = next
                        connectionReason.value = res.data?.reason ?? ''
                    }
                    fetchPresence(chatId)
                    return res
                }

                if (!opts.silent && attempt >= maxAttempts) {
                    connectionStatus.value = 'unreachable'
                    connectionReason.value = res.message ?? ''
                } else if (!opts.silent) {
                    continue
                }
                return res
            } catch (error: any) {
                lastError = error
                console.error('connect error:', error)
                if (attempt < maxAttempts && !opts.silent) continue
                if (!opts.silent) {
                    connectionStatus.value = 'unreachable'
                    connectionReason.value = error?.response?.data?.message ?? ''
                }
            }
        }
        return lastError
    }

    /** Ulanish / presence / typing holatini tozalash */
    const resetConnection = () => {
        connectionStatus.value = 'idle'
        connectionReason.value = ''
        peerPresence.value = null
        peerTypingChatId.value = null
        if (typingClearTimer) {
            clearTimeout(typingClearTimer)
            typingClearTimer = null
        }
    }

    /** Ochiq chatdagi suhbatdosh yozmoqda-mi */
    const isPeerTyping = computed(
        () =>
            !!peerTypingChatId.value &&
            peerTypingChatId.value === currentChat.value?._id,
    )

    /** Socket: suhbatdosh onlayn/oxirgi kirish */
    const onPeerPresence = (data: { peerUserId: string; presence: any }) => {
        if (!currentChat.value || currentChat.value.peer?.userId !== data.peerUserId) return
        peerPresence.value = data.presence
    }

    /** Socket: yozmoqda... (signal kelmasa 6s dan keyin o'chadi) */
    const onPeerTyping = (data: { chatId: string; typing: boolean }) => {
        if (!data?.chatId) return
        if (!data.typing) {
            if (peerTypingChatId.value === data.chatId) peerTypingChatId.value = null
            return
        }
        peerTypingChatId.value = data.chatId
        if (typingClearTimer) clearTimeout(typingClearTimer)
        typingClearTimer = setTimeout(() => {
            if (peerTypingChatId.value === data.chatId) peerTypingChatId.value = null
        }, 6000)
    }

    /** Yangi xabar kelganda typing indikatorini o'chirish */
    const clearTypingForChat = (chatId: string) => {
        if (peerTypingChatId.value === chatId) peerTypingChatId.value = null
    }

    return {
        connect,
        fetchPresence,
        resetConnection,
        isPeerTyping,
        onPeerPresence,
        onPeerTyping,
        clearTypingForChat,
    }
}
