import type { IChatMessage } from '~/types'
import { invalidateChatMediaCaches } from '~/composables/useVoiceMedia'
import { messageAlreadyExists, sortMessagesByDate } from '../helpers/merge-messages'
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
    } = refs

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
        }))

    /** Chatlar ro'yxatini yuklash */
    const fetchChats = async (
        params: FetchChatsParams = {},
        opts: { append?: boolean } = {},
    ) => {
        try {
            if (opts.append) isLoadingMore.value = true
            else isLoading.value = true

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
     * Yuqoriga scroll — loadOlderMessages.
     */
    const fetchMessages = async (chatId: string) => {
        try {
            isLoadingMessages.value = true
            resetMessagesPagination()

            const res = await useApi(`/chats/${chatId}/messages`, {
                method: 'GET',
                params: { page: 1, limit: MESSAGES_PAGE_LIMIT },
            })
            if (res.success) {
                currentChat.value = res.data.chat
                messages.value = mapMessages(res.data.messages || [])
                messagesPage.value = res.data.pagination?.page ?? 1
                messagesTotalPages.value = res.data.pagination?.totalPages ?? 1
                patchChat(chatId, { unreadCount: 0 })
            }
            return res
        } catch (error) {
            console.error('fetchMessages error:', error)
            throw error
        } finally {
            isLoadingMessages.value = false
        }
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
            messages.value = merged

            messagesPage.value = res.data.pagination?.page ?? nextPage
            messagesTotalPages.value =
                res.data.pagination?.totalPages ?? messagesTotalPages.value

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
        const res = await useApi(`/chats/from-order/${orderId}`, { method: 'POST' })
        return res
    }

    /** Agent: order egasi (owner) bilan chat */
    const startChatWithOrderOwner = async (orderId: string) => {
        const res = await useApi(`/chats/from-order/${orderId}/agent`, { method: 'POST' })
        return res
    }

    /** Foydalanuvchi bilan to'g'ridan-to'g'ri chat */
    const startChatWithUser = async (userId: string, orderId?: string) => {
        const res = await useApi('/chats/with-user', {
            method: 'POST',
            body: { userId, orderId: orderId || undefined },
        })
        return res
    }

    /** Band qilgan haydovchi bilan chat */
    const startChatWithBookedDriver = async (orderId: string) => {
        const res = await useApi(`/chats/from-order/${orderId}/booked-driver`, {
            method: 'POST',
        })
        return res
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

    return {
        hasMore,
        hasMoreMessages,
        resetMessagesPagination,
        fetchChats,
        loadMoreChats,
        fetchMessages,
        loadOlderMessages,
        startChatFromOrder,
        startChatWithOrderOwner,
        startChatWithUser,
        startChatWithBookedDriver,
        markRead,
        markAllRead,
        deleteChats,
    }
}
