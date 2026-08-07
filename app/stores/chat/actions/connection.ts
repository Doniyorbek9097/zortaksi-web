import type { Socket } from 'socket.io-client'
import type { IChat } from '~/types'
import type { ChatStoreRefs, ConnStatus } from '../types'

const CONNECT_TIMEOUT_MS = 45000

type ConnectAck = {
    success: boolean
    data?: {
        status?: ConnStatus
        reason?: string
        viaUserbotId?: string
        accessHash?: string
    }
    message?: string
}

const getSocket = (): Socket | null => {
    if (!import.meta.client) return null
    const nuxt = useNuxtApp() as { $socket?: () => Socket | null }
    return nuxt.$socket?.() ?? null
}

const waitForSocketConnected = (maxMs = 8000): Promise<Socket | null> => {
    const existing = getSocket()
    if (existing?.connected) return Promise.resolve(existing)
    if (!existing) return Promise.resolve(null)

    return new Promise((resolve) => {
        const deadline = Date.now() + maxMs
        const tick = () => {
            const s = getSocket()
            if (s?.connected) {
                resolve(s)
                return
            }
            if (Date.now() >= deadline) {
                resolve(null)
                return
            }
            setTimeout(tick, 200)
        }
        tick()
    })
}

/** Sender ulanish — faqat socket orqali (chat:connect:request → ack + chat:connect push) */
const requestConnectViaSocket = async (
    chatId: string,
    opts: { viaProxy?: boolean } = {},
): Promise<ConnectAck> => {
    let socket = await waitForSocketConnected()
    if (!socket?.connected) {
        const nuxt = useNuxtApp() as { $reconnectSocket?: () => void }
        nuxt.$reconnectSocket?.()
        socket = await waitForSocketConnected(5000)
    }
    if (!socket?.connected) {
        throw new Error('Socket ulanmagan')
    }

    return new Promise((resolve, reject) => {
        socket!
            .timeout(CONNECT_TIMEOUT_MS)
            .emit(
                'chat:connect:request',
                { chatId, viaProxy: !!opts.viaProxy },
                (err: Error | null, res: ConnectAck) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(res ?? { success: false, message: 'Javob kelmedi' })
                },
            )
    })
}

/** In-app chat — Telegram peer link shart emas */
export function isInAppChatLike(
    chat: { kind?: string; inAppOnly?: boolean } | null | undefined,
): boolean {
    if (!chat) return false
    return chat.kind === 'support' || chat.kind === 'direct' || !!chat.inAppOnly
}

/** Haqiqiy Telegram yuborish tayyorligi — viaUserbotId + accessHash */
export function hasTelegramPeerLink(
    chat: {
        kind?: string
        inAppOnly?: boolean
        peer?: {
            viaUserbotId?: string
            accessHash?: string
        }
    } | null
    | undefined,
): boolean {
    if (!chat) return false
    if (isInAppChatLike(chat)) return true
    return !!(chat.peer?.viaUserbotId && chat.peer?.accessHash)
}

/** Chat allaqachon Telegramga ulanishi mumkinmi — faqat haqiqiy peer link yoki in-app */
export function isChatLikelyReady(
    chat: {
        kind?: string
        inAppOnly?: boolean
        peer?: {
            viaUserbotId?: string
            accessHash?: string
        }
    } | null
    | undefined,
): boolean {
    return hasTelegramPeerLink(chat)
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

    /** Ro'yxat/API dan — faqat haqiqiy peer link bo'lsa ready */
    const primeFromChat = (chat: IChat | null | undefined) => {
        if (!chat) return
        if (hasTelegramPeerLink(chat)) {
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

        if (data.viaUserbotId || data.accessHash) {
            patchChatPeerLink(chatId, {
                viaUserbotId: data.viaUserbotId,
                accessHash: data.accessHash,
            })
        }

        const chat = findChatById(chatId)
        const next = (data.status || 'unreachable') as ConnStatus

        // Socket/HTTP: tayyor holatni keyinroq unreachable bilan buzmaymiz
        if (
            connectionStatus.value === 'ready' &&
            hasTelegramPeerLink(chat) &&
            next !== 'ready'
        ) {
            return
        }

        connectionStatus.value = next
        connectionReason.value = data.reason ?? ''
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

    const runConnect = async (
        chatId: string,
        opts: { silent?: boolean; viaProxy?: boolean } = {},
    ) => {
        const maxAttempts = opts.silent ? 2 : 2
        const chat = findChatById(chatId) ?? currentChat.value
        if (hasTelegramPeerLink(chat)) {
            connectionStatus.value = 'ready'
            connectionReason.value = ''
        } else if (!isInAppChatLike(chat)) {
            connectionStatus.value = 'connecting'
            connectionReason.value = ''
        }
        activeConnectChatId = chatId

        let lastError: unknown = null
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const res = await requestConnectViaSocket(chatId, {
                    viaProxy: opts.viaProxy,
                })
                if (res.success) {
                    const next = (res.data?.status ?? 'unreachable') as ConnStatus

                    if (next === 'unreachable' && attempt < maxAttempts) {
                        continue
                    }

                    if (next !== 'ready') {
                        const linked = findChatById(chatId)
                        if (
                            hasTelegramPeerLink(linked) ||
                            connectionStatus.value === 'ready'
                        ) {
                            return res
                        }
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
                console.error('connect error (socket):', error)
                if (attempt < maxAttempts) continue
                if (!opts.silent) {
                    connectionStatus.value = 'unreachable'
                    connectionReason.value = error?.message ?? ''
                }
            }
        }
        return lastError
    }

    /**
     * Senderga ulanish — duplicate so'rovlar bitta inflight ga birlashtiriladi.
     * Ro'yxatdan oldin silent preconnect mumkin.
     */
    const connect = async (
        chatId: string,
        opts: { silent?: boolean; viaProxy?: boolean } = {},
    ) => {
        const key = `${chatId}:${opts.viaProxy ? 'proxy' : 'own'}`
        const inflight = connectInflight.get(key)
        if (inflight) return inflight

        const job = runConnect(chatId, opts).finally(() => {
            connectInflight.delete(key)
            if (activeConnectChatId === chatId) activeConnectChatId = null
        })
        connectInflight.set(key, job)
        return job
    }

    const findChatById = (chatId: string) =>
        currentChat.value?._id === chatId
            ? currentChat.value
            : chats.value.find((c) => c._id === chatId) ?? null

    /**
     * Yuborishdan oldin Telegram peer link tayyor bo'lishini kutadi.
     * Mavjud connect inflight promise qayta ishlatiladi.
     */
    const ensureTelegramReady = async (chatId: string): Promise<boolean> => {
        const chat = findChatById(chatId)
        if (!chat || isInAppChatLike(chat)) return true
        if (hasTelegramPeerLink(chat) || connectionStatus.value === 'ready') return true

        await connect(chatId, { silent: true })

        const updated = findChatById(chatId)
        return hasTelegramPeerLink(updated) || connectionStatus.value === 'ready'
    }

    /** Socket: chat:connect — warm/connect natijasi (push) */
    const onChatConnect = (data: {
        chatId: string
        status: ConnStatus
        reason?: string
        viaUserbotId?: string
        accessHash?: string
    }) => {
        if (!data?.chatId) return
        const isRelevant =
            currentChat.value?._id === data.chatId ||
            activeConnectChatId === data.chatId ||
            !currentChat.value?._id
        if (!isRelevant) return
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
        ensureTelegramReady,
        primeFromChat,
        isChatLikelyReady,
        hasTelegramPeerLink,
        fetchPresence,
        resetConnection,
        isPeerTyping,
        onChatConnect,
        onPeerPresence,
        onPeerTyping,
        clearTypingForChat,
    }
}
