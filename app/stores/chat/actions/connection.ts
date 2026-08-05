import type { IChat } from '~/types'
import type { ChatStoreRefs, ConnStatus } from '../types'

/** Chat allaqachon Telegramga ulanishi mumkinmi (optimistik ready) */
export function isChatLikelyReady(
    chat: {
        kind?: string
        inAppOnly?: boolean
        orderId?: string
        peer?: {
            viaUserbotId?: string
            accessHash?: string
            phone?: string
            username?: string
        }
    } | null
    | undefined,
): boolean {
    if (!chat) return false
    if (chat.kind === 'support' || chat.kind === 'direct' || chat.inAppOnly) return true
    if (chat.peer?.viaUserbotId && chat.peer?.accessHash) return true
    // Order chat: telefon/username bor — connect fonda, composer ochiq
    if (
        chat.orderId &&
        (String(chat.peer?.phone || '').replace(/\D/g, '').length >= 7 ||
            String(chat.peer?.username || '').trim())
    ) {
        return true
    }
    return false
}

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
        chats,
    } = refs

    let typingClearTimer: ReturnType<typeof setTimeout> | null = null
    const connectInflight = new Map<string, Promise<unknown>>()
    let activeConnectChatId: string | null = null

    const patchChatPeerLink = (
        chatId: string,
        patch: { viaUserbotId?: string; accessHash?: string },
    ) => {
        const apply = (c: IChat | null) => {
            if (!c || c._id !== chatId) return c
            return {
                ...c,
                peer: { ...c.peer, ...patch },
            } as IChat
        }
        if (currentChat.value?._id === chatId) {
            currentChat.value = apply(currentChat.value)!
        }
        const idx = chats.value.findIndex((c) => c._id === chatId)
        if (idx !== -1) {
            chats.value[idx] = apply(chats.value[idx])!
        }
    }

    /** Ro'yxat/API dan — composer darhol ochiladi */
    const primeFromChat = (chat: IChat | null | undefined) => {
        if (!chat) return
        if (isChatLikelyReady(chat)) {
            connectionStatus.value = 'ready'
            connectionReason.value = ''
        }
    }

    const applyConnectResult = (
        chatId: string,
        data: {
            status?: ConnStatus
            reason?: string
            viaUserbotId?: string
            accessHash?: string
        },
    ) => {
        const isRelevant =
            !currentChat.value?._id ||
            currentChat.value._id === chatId ||
            activeConnectChatId === chatId
        if (!isRelevant) return

        const next = (data.status || 'unreachable') as ConnStatus
        connectionStatus.value = next
        connectionReason.value = data.reason ?? ''

        if (data.viaUserbotId || data.accessHash) {
            patchChatPeerLink(chatId, {
                viaUserbotId: data.viaUserbotId,
                accessHash: data.accessHash,
            })
        }
    }

    /** Suhbatdosh onlayn / oxirgi kirishni yuklash */
    const fetchPresence = async (chatId: string) => {
        try {
            const res = await useApi(`/chats/${chatId}/presence`, { method: 'GET' })
            if (res.success) peerPresence.value = res.data
        } catch (error) {
            console.error('fetchPresence error:', error)
        }
    }

    const runConnect = async (chatId: string, opts: { silent?: boolean } = {}) => {
        const maxAttempts = opts.silent ? 2 : 2
        if (!opts.silent && !isChatLikelyReady(currentChat.value)) {
            connectionStatus.value = 'connecting'
            connectionReason.value = ''
        } else if (opts.silent && isChatLikelyReady(currentChat.value)) {
            connectionStatus.value = 'ready'
            connectionReason.value = ''
        }
        activeConnectChatId = chatId

        let lastError: unknown = null
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await useApi(`/chats/${chatId}/connect`, {
                    method: 'POST',
                    timeout: 45000,
                })
                if (res.success) {
                    const next = (res.data?.status ?? 'unreachable') as ConnStatus

                    if (next === 'unreachable' && attempt < maxAttempts) {
                        continue
                    }

                    applyConnectResult(chatId, {
                        status: next,
                        reason: res.data?.reason,
                        viaUserbotId: res.data?.viaUserbotId,
                        accessHash: res.data?.accessHash,
                    })

                    if (next === 'ready') {
                        void fetchPresence(chatId)
                    }
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
                if (attempt < maxAttempts) continue
                if (!opts.silent) {
                    connectionStatus.value = 'unreachable'
                    connectionReason.value = error?.response?.data?.message ?? ''
                }
            }
        }
        return lastError
    }

    /**
     * Senderga ulanish — duplicate so'rovlar bitta inflight ga birlashtiriladi.
     * Ro'yxatdan oldin silent preconnect mumkin.
     */
    const connect = async (chatId: string, opts: { silent?: boolean } = {}) => {
        const inflight = connectInflight.get(chatId)
        if (inflight) return inflight

        const job = runConnect(chatId, opts).finally(() => {
            connectInflight.delete(chatId)
            if (activeConnectChatId === chatId) activeConnectChatId = null
        })
        connectInflight.set(chatId, job)
        return job
    }

    /** Socket: chat:connect — HTTP kutmasdan UI yangilanadi */
    const onChatConnect = (data: {
        chatId: string
        status: ConnStatus
        reason?: string
        viaUserbotId?: string
        accessHash?: string
    }) => {
        if (!data?.chatId) return
        // Joriy chat yoki ochilayotgan chat — HTTP kutmasdan yangilash
        const isRelevant =
            currentChat.value?._id === data.chatId ||
            activeConnectChatId === data.chatId
        if (!isRelevant && currentChat.value?._id) return
        applyConnectResult(data.chatId, data)
        if (data.status === 'ready') {
            void fetchPresence(data.chatId)
        }
    }

    /** Ulanish / presence / typing holatini tozalash */
    const resetConnection = () => {
        connectionStatus.value = 'idle'
        connectionReason.value = ''
        peerPresence.value = null
        peerTypingChatId.value = null
        activeConnectChatId = null
        if (typingClearTimer) {
            clearTimeout(typingClearTimer)
            typingClearTimer = null
        }
    }

    const isPeerTyping = computed(
        () =>
            !!peerTypingChatId.value &&
            peerTypingChatId.value === currentChat.value?._id,
    )

    const onPeerPresence = (data: { peerUserId: string; presence: any }) => {
        if (!currentChat.value || currentChat.value.peer?.userId !== data.peerUserId) return
        peerPresence.value = data.presence
    }

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

    const clearTypingForChat = (chatId: string) => {
        if (peerTypingChatId.value === chatId) peerTypingChatId.value = null
    }

    return {
        connect,
        primeFromChat,
        isChatLikelyReady,
        fetchPresence,
        resetConnection,
        isPeerTyping,
        onChatConnect,
        onPeerPresence,
        onPeerTyping,
        clearTypingForChat,
    }
}
