import type { IChat, IChatMessage } from '~/types'
import { mergeOrderChatContext } from '~/utils/orderChatQuery'
import { invalidateChatMediaCaches, useChatMedia } from '~/composables/useVoiceMedia'
import { getApiErrorMessage } from '~/utils/apiError'
import { messageAlreadyExists, sortMessagesByDate } from '../helpers/merge-messages'
import { inferTextFormat } from '~/utils/telegramHtml'
import {
    restoreMessagesCache,
    saveMessagesCache,
} from '../helpers/message-cache'
import type { ChatStoreRefs, FetchChatsParams } from '../types'

/** Bir sahifadagi xabarlar soni (eng yangi batch) */
export const MESSAGES_PAGE_LIMIT = 10

/** Chatlar ro'yxati, xabarlar va chat ochish API lari */
export function createListActions(
    refs: ChatStoreRefs,
    patchChat: (chatId: string, patch: Partial<import('~/types').IChat>) => void,
) {
    const {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        isLoadingOlderMessages,
        total,
        page,
        totalPages,
        messagesPage,
        messagesTotalPages,
        messagesChatId,
    } = refs

    let messagesFetchGen = 0

    /** Bir order uchun parallel startChat dublikatini oldini oladi */
    const startChatInflight = new Map<string, Promise<unknown>>()

    const dedupeStartChat = (key: string, run: () => Promise<unknown>) => {
        const existing = startChatInflight.get(key)
        if (existing) return existing
        const job = run().finally(() => {
            if (startChatInflight.get(key) === job) startChatInflight.delete(key)
        })
        startChatInflight.set(key, job)
        return job
    }

    const invalidateMessagesFetch = () => {
        messagesFetchGen += 1
    }

    const hasMore = computed(() => page.value < totalPages.value)
    const hasMoreMessages = computed(
        () => messagesPage.value < messagesTotalPages.value,
    )

    const resetMessagesPagination = () => {
        messagesPage.value = 1
        messagesTotalPages.value = 1
    }

    const mapMessages = (list: unknown[]): IChatMessage[] =>
        (list || []).map((m: any) => ({
            ...m,
            _id: String(m._id || m.id || ''),
            textFormat: inferTextFormat(String(m.text || ''), m.textFormat),
        }))

    const mergeFetchedMessages = (
        incoming: IChatMessage[],
        prev: IChatMessage[],
    ): IChatMessage[] => {
        const prevById = new Map(prev.map((m) => [String(m._id), m]))
        return incoming.map((m) => {
            const old = prevById.get(String(m._id))
            if (!old) return m
            const textFormat =
                m.textFormat === 'html' || old.textFormat === 'html'
                    ? 'html'
                    : inferTextFormat(m.text || '', m.textFormat)
            return { ...m, textFormat }
        })
    }

    /** Chatlar ro'yxatini yuklash */
    const fetchChats = async (
        params: FetchChatsParams = {},
        opts: { append?: boolean; silent?: boolean } = {},
    ) => {
        try {
            if (opts.append) isLoadingMore.value = true
            else if (!opts.silent) isLoading.value = true

            const nextPage = params.page ?? 1
            const res = await useApi('/chats', {
                method: 'GET',
                params: {
                    page: nextPage,
                    limit: params.limit ?? 20,
                    search: params.search || undefined,
                },
            })
            if (res.success) {
                const list = res.data.chats ?? []
                if (opts.append) {
                    const seen = new Set(chats.value.map((c) => c._id))
                    chats.value = [...chats.value, ...list.filter((c: { _id: string }) => !seen.has(c._id))]
                } else {
                    chats.value = list
                }
                total.value = res.data.pagination?.total ?? chats.value.length
                page.value = res.data.pagination?.page ?? nextPage
                totalPages.value = res.data.pagination?.totalPages ?? 1
            }
            return res
        } catch (error) {
            console.error('fetchChats error:', error)
            throw error
        } finally {
            isLoading.value = false
            isLoadingMore.value = false
        }
    }

    /** Keyingi sahifa (infinite scroll) */
    const loadMoreChats = async (params: Omit<FetchChatsParams, 'page'> = {}) => {
        if (isLoading.value || isLoadingMore.value || !hasMore.value) return
        return fetchChats({ ...params, page: page.value + 1 }, { append: true })
    }

    /**
     * Eng yangi xabarlar (page=1).
     * Cache bo'lsa skeleton ko'rsatilmaydi — fon da yangilanadi.
     */
    const fetchMessages = async (chatId: string) => {
        const gen = messagesFetchGen
        const hadCached =
            messagesChatId.value === chatId && messages.value.length > 0
        try {
            if (!hadCached) {
                isLoadingMessages.value = true
                resetMessagesPagination()
            }

            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'GET',
                params: { page: 1, limit: MESSAGES_PAGE_LIMIT },
            })
            if (gen !== messagesFetchGen) return res

            if (res.success) {
                const incoming = res.data.chat as IChat
                const prev =
                    currentChat.value?._id === chatId ? currentChat.value : null
                currentChat.value = prev
                    ? (mergeOrderChatContext(prev, incoming) as IChat)
                    : incoming
                messages.value = mergeFetchedMessages(
                    mapMessages(res.data.messages || []),
                    messages.value,
                )
                messagesChatId.value = chatId
                messagesPage.value = res.data.pagination?.page ?? 1
                messagesTotalPages.value = res.data.pagination?.totalPages ?? 1
                patchChat(chatId, { unreadCount: 0 })
                saveMessagesCache(chatId, {
                    messages: messages.value,
                    page: messagesPage.value,
                    totalPages: messagesTotalPages.value,
                })
                if (import.meta.client) {
                    // Faqat oxirgi bir nechta media — RAM
                    useChatMedia().prefetch(messages.value.slice(-16), null)
                }
            }
            return res
        } catch (error) {
            console.error('fetchMessages error:', error)
            throw error
        } finally {
            if (gen === messagesFetchGen) {
                isLoadingMessages.value = false
            }
        }
    }

    /** Oldin ochilgan chat xabarlarini darhol tiklash */
    const hydrateMessagesFromCache = (chatId: string): boolean => {
        const cached = restoreMessagesCache(chatId)
        if (!cached) return false
        messages.value = cached.messages
        messagesChatId.value = chatId
        messagesPage.value = cached.page
        messagesTotalPages.value = cached.totalPages
        isLoadingMessages.value = false
        return true
    }

    /** Joriy chat xabarlarini cache ga saqlash (chat almashtirishdan oldin) */
    const persistCurrentMessagesCache = () => {
        const id = currentChat.value?._id
        if (!id || !messages.value.length) return
        saveMessagesCache(id, {
            messages: messages.value,
            page: messagesPage.value,
            totalPages: messagesTotalPages.value,
        })
    }

    /** Tepaga scroll — keyingi 10 ta eski xabar */
    const loadOlderMessages = async (chatId: string) => {
        if (
            isLoadingOlderMessages.value ||
            isLoadingMessages.value ||
            !hasMoreMessages.value
        ) {
            return null
        }

        const nextPage = messagesPage.value + 1
        try {
            isLoadingOlderMessages.value = true
            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'GET',
                params: { page: nextPage, limit: MESSAGES_PAGE_LIMIT },
            })
            if (!res.success) return res

            const older = mapMessages(res.data.messages || [])
            const merged = [...older]
            for (const m of messages.value) {
                if (!messageAlreadyExists(merged, m)) merged.push(m)
            }
            sortMessagesByDate(merged)
            // RAM: eski xabarlarni chegaralash
            const MAX_OPEN_MESSAGES = 120
            messages.value =
              merged.length > MAX_OPEN_MESSAGES
                ? merged.slice(merged.length - MAX_OPEN_MESSAGES)
                : merged

            messagesPage.value = res.data.pagination?.page ?? nextPage
            messagesTotalPages.value =
                res.data.pagination?.totalPages ?? messagesTotalPages.value

            if (import.meta.client) {
              // Faqat yangi kelgan batch — to'liq prefetch emas
              useChatMedia().prefetch(older.slice(-12), null)
            }
            return res
        } catch (error) {
            console.error('loadOlderMessages error:', error)
            throw error
        } finally {
            isLoadingOlderMessages.value = false
        }
    }

    /** Orderdan chat ochish (sender) */
    const startChatFromOrder = async (orderId: string) => {
        const oid = String(orderId || '').trim()
        if (!oid) {
            return { success: false, message: 'orderId kerak' }
        }
        return dedupeStartChat(`order:${oid}`, async () => {
            try {
                return await useApi(`/chats/from-order/${oid}`, {
                    method: 'POST',
                    timeout: 30_000,
                })
            } catch (error) {
                const data = (error as { response?: { data?: { code?: string } } })?.response
                    ?.data
                return {
                    success: false,
                    code: data?.code,
                    message: getApiErrorMessage(error, 'Chat ochib bo\'lmadi'),
                }
            }
        })
    }

    /** Agent: order egasi (owner) bilan chat */
    const startChatWithOrderOwner = async (orderId: string) => {
        try {
            return await useApi(`/chats/from-order/${orderId}/agent`, { method: 'POST' })
        } catch (error) {
            const data = (error as { response?: { data?: { code?: string } } })?.response?.data
            return {
                success: false,
                code: data?.code,
                message: getApiErrorMessage(error, 'Chat ochib bo\'lmadi'),
            }
        }
    }

    /** Foydalanuvchi bilan to'g'ridan-to'g'ri chat */
    const startChatWithUser = async (userId: string, orderId?: string) => {
        try {
            return await useApi('/chats/with-user', {
                method: 'POST',
                body: { userId, orderId: orderId || undefined },
            })
        } catch (error) {
            const data = (error as { response?: { data?: { code?: string } } })?.response?.data
            return {
                success: false,
                code: data?.code,
                message: getApiErrorMessage(error, 'Chat ochib bo\'lmadi'),
            }
        }
    }

    /** Band qilgan haydovchi bilan chat */
    const startChatWithBookedDriver = async (orderId: string) => {
        try {
            return await useApi(`/chats/from-order/${orderId}/booked-driver`, {
                method: 'POST',
            })
        } catch (error) {
            return {
                success: false,
                message: getApiErrorMessage(error, 'Chat ochib bo\'lmadi'),
            }
        }
    }

    /** O'qilgan deb belgilash */
    const markRead = async (chatId: string) => {
        try {
            await useApi(`/chats/${chatId}/read`, { method: 'POST' })
            patchChat(chatId, { unreadCount: 0 })
        } catch (error) {
            console.error('markRead error:', error)
        }
    }

    /** Barcha chatlarni o'qilgan qilish */
    const markAllRead = async () => {
        try {
            const res = await useApi('/chats/read-all', { method: 'POST' })
            if (res.success) {
                chats.value = chats.value.map((c) =>
                    c.unreadCount ? { ...c, unreadCount: 0 } : c,
                )
            }
            return res
        } catch (error) {
            console.error('markAllRead error:', error)
            throw error
        }
    }

    /** Chatlarni o'chirish — server media + qurilma IndexedDB keshi */
    const deleteChats = async (ids: string[]) => {
        const idSet = new Set(ids.map(String))
        const localMediaIds = messages.value
            .filter(
                (m) =>
                    idSet.has(String(m.chatId)) &&
                    (m.type === 'voice' || m.type === 'photo'),
            )
            .map((m) => String(m._id))

        const res = await useApi('/chats', { method: 'DELETE', body: { ids } })
        if (res.success) {
            chats.value = chats.value.filter((c) => !ids.includes(c._id))
            total.value = Math.max(0, total.value - ids.length)

            const serverIds = (res.data?.messageIds as string[] | undefined) || []
            const purgeIds = [...new Set([...localMediaIds, ...serverIds.map(String)])]
            if (purgeIds.length && import.meta.client) {
                invalidateChatMediaCaches(purgeIds)
            }

            if (currentChat.value && idSet.has(String(currentChat.value._id))) {
                currentChat.value = null
                messages.value = []
            } else {
                messages.value = messages.value.filter(
                    (m) => !idSet.has(String(m.chatId)),
                )
            }
        }
        return res
    }

    /** Ovoz/rasm xabarlarini o'chirish */
    const deleteMessages = async (chatId: string, ids: string[]) => {
        const uniqueIds = [...new Set(ids.map(String).filter(Boolean))]
        if (!uniqueIds.length) return { success: false }

        const res = await useApi(`/chats/${chatId}/messages`, {
            method: 'DELETE',
            body: { ids: uniqueIds },
        })

        if (res.success) {
            const idSet = new Set(uniqueIds)
            messages.value = messages.value.filter((m) => !idSet.has(String(m._id)))

            if (import.meta.client) {
                invalidateChatMediaCaches(uniqueIds)
            }

            const chat = chats.value.find((c) => c._id === chatId)
            if (chat && currentChat.value?._id === chatId) {
                const last = messages.value.at(-1)
                if (last) {
                    const preview =
                        last.type === 'voice'
                            ? `🎤 Ovozli xabar${last.duration ? ` (${last.duration}s)` : ''}`
                            : last.type === 'photo'
                              ? (last.text?.trim() || '📷 Rasm')
                              : (last.text || '')
                    patchChat(chatId, { lastMessage: preview, lastMessageAt: last.date })
                } else {
                    patchChat(chatId, { lastMessage: '', lastMessageAt: new Date().toISOString() })
                }
            }
        }
        return res
    }

    /** Chat tarixini tozalash — server + Telegram */
    const clearChatHistory = async (chatId: string) => {
        const localMediaIds = messages.value
            .filter(
                (m) =>
                    String(m.chatId) === String(chatId) &&
                    (m.type === 'voice' || m.type === 'photo'),
            )
            .map((m) => String(m._id))

        const res = await useApi(`/chats/${chatId}/history`, { method: 'DELETE' })

        if (res.success) {
            const serverIds = (res.data?.messageIds as string[] | undefined) || []
            const purgeIds = [...new Set([...localMediaIds, ...serverIds.map(String)])]

            messages.value = messages.value.filter(
                (m) => String(m.chatId) !== String(chatId),
            )

            if (purgeIds.length && import.meta.client) {
                invalidateChatMediaCaches(purgeIds)
            }

            const chat = chats.value.find((c) => c._id === chatId)
            if (chat) {
                patchChat(chatId, { lastMessage: '', lastMessageAt: new Date().toISOString() })
            }
        }
        return res
    }

    return {
        hasMore,
        hasMoreMessages,
        resetMessagesPagination,
        fetchChats,
        loadMoreChats,
        fetchMessages,
        invalidateMessagesFetch,
        hydrateMessagesFromCache,
        persistCurrentMessagesCache,
        loadOlderMessages,
        startChatFromOrder,
        startChatWithOrderOwner,
        startChatWithUser,
        startChatWithBookedDriver,
        markRead,
        markAllRead,
        deleteChats,
        deleteMessages,
        clearChatHistory,
    }
}
