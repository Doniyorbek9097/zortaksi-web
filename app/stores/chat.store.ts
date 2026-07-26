import { defineStore } from 'pinia'
import type { IChat, IChatMessage } from '~/types'

export interface FetchChatsParams {
    page?: number
    limit?: number
    search?: string
}

export const useChatStore = defineStore('chat', () => {
    const chats = ref<IChat[]>([])
    const currentChat = ref<IChat | null>(null)
    const messages = ref<IChatMessage[]>([])

    const isLoading = ref(false)
    const isLoadingMessages = ref(false)
    const isSending = ref(false)

    const total = ref(0)

    /** Tab badge — barcha chatlardagi o'qilmagan xabarlar yig'indisi */
    const unreadTotal = computed(() =>
        chats.value.reduce((sum, c) => sum + (Number(c.unreadCount) || 0), 0)
    )

    // Ulanish holati (senderga yozish mumkinmi):
    //  connecting -> tekshirilmoqda (loading)
    //  ready      -> 100% yozish mumkin
    //  restricted -> spam/blok/maxfiylik (reason ko'rsatiladi)
    //  unreachable-> umuman bog'lanib bo'lmaydi ("boshqa yo'lovchi toping")
    type ConnStatus = 'idle' | 'connecting' | 'ready' | 'restricted' | 'unreachable'
    const connectionStatus = ref<ConnStatus>('idle')
    const connectionReason = ref('')

    // Suhbatdosh onlayn / oxirgi kirish
    const peerPresence = ref<{
        online: boolean
        label: string
        lastSeenAt?: string
        kind?: string
    } | null>(null)

    /** Suhbatdosh yozmoqda (chatId → timeout) */
    const peerTypingChatId = ref<string | null>(null)
    let typingClearTimer: ReturnType<typeof setTimeout> | null = null

    // --- Senderga ulanishni tekshirish (xabar yubormasdan) ---
    // silent: true — UI loading ko'rsatilmaydi (allaqachon bog'langan chat)
    // Transient timeout/network: bir necha marta qayta urinadi, UI connecting da qoladi
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

    const fetchPresence = async (chatId: string) => {
        try {
            const res = await useApi(`/chats/${chatId}/presence`, { method: 'GET' })
            if (res.success) peerPresence.value = res.data
        } catch (error) {
            console.error('fetchPresence error:', error)
        }
    }

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

    const isPeerTyping = computed(() =>
        !!peerTypingChatId.value && peerTypingChatId.value === currentChat.value?._id
    )

    // --- Chatlar ro'yxati ---
    const fetchChats = async (params: FetchChatsParams = {}) => {
        try {
            isLoading.value = true
            const res = await useApi('/chats', { method: 'GET', params })
            if (res.success) {
                chats.value = res.data.chats
                total.value = res.data.pagination?.total ?? chats.value.length
            }
            return res
        } catch (error) {
            console.error('fetchChats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // --- Bitta chat xabarlari ---
    const fetchMessages = async (chatId: string) => {
        try {
            isLoadingMessages.value = true
            const res = await useApi(`/chats/${chatId}/messages`, { method: 'GET' })
            if (res.success) {
                currentChat.value = res.data.chat
                messages.value = res.data.messages
                // Ro'yxatdagi unread'ni nolga tushiramiz
                patchChat(chatId, { unreadCount: 0 })
                // Voice'larni oldindan yuklaymiz — tinglash darhol ishlaydi
                if (import.meta.client) {
                    useChatMedia().prefetch(messages.value)
                }
            }
            return res
        } catch (error) {
            console.error('fetchMessages error:', error)
            throw error
        } finally {
            isLoadingMessages.value = false
        }
    }

    // --- Xabar yuborish ---
    // Darhol "yuborilmoqda" (soat) bubble ko'rsatiladi; server javobi kelgach
    // haqiqiy holat (sent/failed) bilan almashtiriladi — foydalanuvchi aniq ko'radi.
    const sendMessage = async (chatId: string, text: string) => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const temp = {
            _id: tempId,
            chatId,
            direction: 'out',
            text,
            type: 'text',
            status: 'sending',
            date: new Date().toISOString(),
        } as unknown as IChatMessage
        messages.value.push(temp)

        try {
            isSending.value = true
            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'POST',
                body: { text },
            })
            if (res.success) {
                // Temp bubble'ni serverdagi haqiqiy xabar (sent/failed) bilan almashtiramiz.
                // Socket orqali shu xabar allaqachon kelib qolgan bo'lishi mumkin — dublikat qilmaymiz.
                const idx = messages.value.findIndex((m) => m._id === tempId)
                const exists = messages.value.some((m) => m._id === res.data._id)
                if (idx !== -1) {
                    if (exists) messages.value.splice(idx, 1) // socket'niki qoladi
                    else messages.value.splice(idx, 1, res.data)
                } else if (!exists) {
                    appendMessage(res.data)
                }
                patchChat(chatId, { lastMessage: res.data.text, lastMessageAt: res.data.date })
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            console.error('sendMessage error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    // --- Ovozli xabar yuborish ---
    const sendVoice = async (chatId: string, blob: Blob, duration: number) => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const temp = {
            _id: tempId,
            chatId,
            direction: 'out',
            text: '',
            type: 'voice',
            status: 'sending',
            duration,
            date: new Date().toISOString(),
        } as unknown as IChatMessage
        messages.value.push(temp)

        try {
            isSending.value = true
            const form = new FormData()
            const ext = blob.type.includes('ogg') ? 'ogg' : 'webm'
            form.append('file', blob, `voice.${ext}`)
            form.append('duration', String(Math.max(1, Math.round(duration))))

            const res = await useApi(`/chats/${chatId}/messages/voice`, {
                method: 'POST',
                body: form,
                timeout: 90000,
            })
            if (res.success) {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                const exists = messages.value.some((m) => m._id === res.data._id)
                if (idx !== -1) {
                    if (exists) messages.value.splice(idx, 1)
                    else messages.value.splice(idx, 1, res.data)
                } else if (!exists) {
                    appendMessage(res.data)
                }
                patchChat(chatId, {
                    lastMessage: `🎤 Ovozli xabar (${res.data.duration || duration}s)`,
                    lastMessageAt: res.data.date,
                })
                if (import.meta.client && res.data._id) {
                    useChatMedia().getUrl(res.data._id).catch(() => {})
                }
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            console.error('sendVoice error:', error)
            throw error
        } finally {
            isSending.value = false
        }
    }

    // --- Rasm yuborish ---
    const sendPhoto = async (chatId: string, file: File, caption = '') => {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const localUrl = URL.createObjectURL(file)
        const temp = {
            _id: tempId,
            chatId,
            direction: 'out',
            text: caption,
            type: 'photo',
            status: 'sending',
            date: new Date().toISOString(),
        } as unknown as IChatMessage
        messages.value.push(temp)

        try {
            isSending.value = true
            const form = new FormData()
            form.append('file', file, file.name || 'photo.jpg')
            if (caption) form.append('caption', caption)

            const res = await useApi(`/chats/${chatId}/messages/photo`, {
                method: 'POST',
                body: form,
                timeout: 90000,
            })
            if (res.success) {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                const exists = messages.value.some((m) => m._id === res.data._id)
                if (idx !== -1) {
                    if (exists) messages.value.splice(idx, 1)
                    else messages.value.splice(idx, 1, res.data)
                } else if (!exists) {
                    appendMessage(res.data)
                }
                patchChat(chatId, {
                    lastMessage: caption || '📷 Rasm',
                    lastMessageAt: res.data.date,
                })
                if (import.meta.client && res.data._id) {
                    useChatMedia().getUrl(res.data._id).catch(() => {})
                }
            } else {
                const idx = messages.value.findIndex((m) => m._id === tempId)
                if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            }
            return res
        } catch (error) {
            const idx = messages.value.findIndex((m) => m._id === tempId)
            if (idx !== -1) messages.value[idx] = { ...temp, status: 'failed' } as IChatMessage
            console.error('sendPhoto error:', error)
            throw error
        } finally {
            URL.revokeObjectURL(localUrl)
            isSending.value = false
        }
    }

    // --- Orderdan chat ochish (sender) ---
    const startChatFromOrder = async (orderId: string) => {
        const res = await useApi(`/chats/from-order/${orderId}`, { method: 'POST' })
        return res
    }

    // --- Agent: order egasi (owner) bilan chat ---
    const startChatWithOrderOwner = async (orderId: string) => {
        const res = await useApi(`/chats/from-order/${orderId}/agent`, { method: 'POST' })
        return res
    }

    // --- Band qilgan haydovchi bilan chat ---
    const startChatWithUser = async (userId: string, orderId?: string) => {
        const res = await useApi('/chats/with-user', {
            method: 'POST',
            body: { userId, orderId: orderId || undefined },
        })
        return res
    }

    const startChatWithBookedDriver = async (orderId: string) => {
        const res = await useApi(`/chats/from-order/${orderId}/booked-driver`, { method: 'POST' })
        return res
    }

    // --- O'qilgan deb belgilash ---
    const markRead = async (chatId: string) => {
        try {
            await useApi(`/chats/${chatId}/read`, { method: 'POST' })
            patchChat(chatId, { unreadCount: 0 })
        } catch (error) {
            console.error('markRead error:', error)
        }
    }

    // --- O'chirish ---
    const deleteChats = async (ids: string[]) => {
        const res = await useApi('/chats', { method: 'DELETE', body: { ids } })
        if (res.success) {
            chats.value = chats.value.filter((c) => !ids.includes(c._id))
        }
        return res
    }

    // ==================== Yordamchilar / socket ====================

    const patchChat = (chatId: string, patch: Partial<IChat>) => {
        const idx = chats.value.findIndex((c) => c._id === chatId)
        if (idx !== -1) chats.value[idx] = { ...chats.value[idx], ...patch } as IChat
        if (currentChat.value?._id === chatId) {
            currentChat.value = { ...currentChat.value, ...patch } as IChat
        }
    }

    const appendMessage = (msg: IChatMessage) => {
        if (currentChat.value?._id !== msg.chatId) return
        if (messages.value.some((m) => m._id === msg._id)) return
        messages.value.push(msg)
    }

    /** Socket: mavjud xabar matni/status yangilandi (masalan to'lov holati) */
    const onMessageUpdate = (msg: IChatMessage) => {
        if (!msg?._id) return
        const idx = messages.value.findIndex((m) => m._id === msg._id)
        if (idx !== -1) {
            messages.value[idx] = { ...messages.value[idx], ...msg } as IChatMessage
        }
    }

    // Socket: yangi xabar keldi (kiruvchi yoki chiquvchi)
    const onNewMessage = (msg: IChatMessage) => {
        appendMessage(msg)
        if (import.meta.client && (msg.type === 'voice' || msg.type === 'photo') && msg.mediaPath) {
            useChatMedia().getUrl(msg._id).catch(() => {})
        }

        // Ro'yxatda oxirgi xabar + tartibni yangilaymiz
        const idx = chats.value.findIndex((c) => c._id === msg.chatId)
        if (idx !== -1) {
            const preview =
                msg.type === 'voice'
                    ? `🎤 Ovozli xabar${msg.duration ? ` (${msg.duration}s)` : ''}`
                    : msg.type === 'photo'
                        ? (msg.text || '📷 Rasm')
                        : String(msg.text || '').includes('[[ZT_PAYMENT_CARDS]]')
                            ? "💳 To'lov ma'lumoti"
                            : String(msg.text || '').includes('[[ZT_PAYMENT_REQUEST]]')
                                ? "💰 Hisobni to'ldirish"
                                : msg.text
            const chat = { ...chats.value[idx], lastMessage: preview, lastMessageAt: msg.date } as IChat
            // Ochiq chat bo'lmasa va kiruvchi bo'lsa — unread oshiramiz
            if (msg.direction === 'in' && currentChat.value?._id !== msg.chatId) {
                chat.unreadCount = (chat.unreadCount || 0) + 1
            }
            chats.value.splice(idx, 1)
            chats.value.unshift(chat)
        }

        // Ochiq chatga kiruvchi kelsa — darrov o'qilgan deb belgilaymiz
        if (msg.direction === 'in' && currentChat.value?._id === msg.chatId) {
            markRead(msg.chatId)
        }
    }

    // Socket: chat holati yangilandi (unread, oxirgi xabar)
    const onChatUpdate = (chat: IChat) => {
        const idx = chats.value.findIndex((c) => c._id === chat._id)
        if (idx !== -1) {
            chats.value[idx] = { ...chats.value[idx], ...chat } as IChat
        } else {
            chats.value.unshift(chat)
        }
        if (currentChat.value?._id === chat._id) {
            currentChat.value = { ...currentChat.value, ...chat } as IChat
        }
    }

    // Socket: peer xabarlarimizni o'qidi — ikki ✓
    const onMessagesRead = (data: { chatId: string; maxTgMessageId: number }) => {
        if (!data?.chatId) return
        const chatId = String(data.chatId)
        messages.value = messages.value.map((m) => {
            if (
                String(m.chatId) === chatId &&
                m.direction === 'out' &&
                m.status !== 'failed' &&
                m.status !== 'read' &&
                m.tgMessageId != null &&
                m.tgMessageId <= data.maxTgMessageId
            ) {
                return { ...m, status: 'read' } as IChatMessage
            }
            return m
        })
    }

    // Socket: suhbatdosh onlayn/oxirgi kirish
    const onPeerPresence = (data: { peerUserId: string; presence: any }) => {
        if (!currentChat.value || currentChat.value.peer?.userId !== data.peerUserId) return
        peerPresence.value = data.presence
    }

    // Socket: yozmoqda...
    const onPeerTyping = (data: { chatId: string; typing: boolean }) => {
        if (!data?.chatId) return
        if (!data.typing) {
            if (peerTypingChatId.value === data.chatId) peerTypingChatId.value = null
            return
        }
        peerTypingChatId.value = data.chatId
        if (typingClearTimer) clearTimeout(typingClearTimer)
        // Signal kelmasa ham 6s dan keyin o'chadi
        typingClearTimer = setTimeout(() => {
            if (peerTypingChatId.value === data.chatId) peerTypingChatId.value = null
        }, 6000)
    }

    // Yangi xabar kelganda typing o'chadi
    const onNewMessageWithTyping = (msg: IChatMessage) => {
        if (peerTypingChatId.value === msg.chatId) peerTypingChatId.value = null
        onNewMessage(msg)
    }

    return {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMessages,
        isSending,
        total,
        unreadTotal,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
        isPeerTyping,
        connect,
        fetchPresence,
        resetConnection,
        fetchChats,
        fetchMessages,
        sendMessage,
        sendVoice,
        sendPhoto,
        startChatFromOrder,
        startChatWithOrderOwner,
        startChatWithUser,
        startChatWithBookedDriver,
        markRead,
        deleteChats,
        onNewMessage: onNewMessageWithTyping,
        onMessageUpdate,
        onChatUpdate,
        onMessagesRead,
        onPeerPresence,
        onPeerTyping,
    }
})
