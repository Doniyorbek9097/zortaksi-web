import type { IChat } from '~/types'
import type { ChatStoreRefs, FetchChatsParams } from '../types'

/** Chatlar ro'yxati, xabarlar va chat ochish API lari */
export function createListActions(
    refs: ChatStoreRefs,
    patchChat: (chatId: string, patch: Partial<IChat>) => void,
) {
    const {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        total,
        page,
        totalPages,
    } = refs

    const hasMore = computed(() => page.value < totalPages.value)

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
                const list: IChat[] = res.data.chats ?? []
                if (opts.append) {
                    const seen = new Set(chats.value.map((c) => c._id))
                    chats.value = [...chats.value, ...list.filter((c) => !seen.has(c._id))]
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

    /** Bitta chat xabarlarini yuklash */
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

    /** Chatlarni o'chirish */
    const deleteChats = async (ids: string[]) => {
        const res = await useApi('/chats', { method: 'DELETE', body: { ids } })
        if (res.success) {
            chats.value = chats.value.filter((c) => !ids.includes(c._id))
            total.value = Math.max(0, total.value - ids.length)
        }
        return res
    }

    return {
        hasMore,
        fetchChats,
        loadMoreChats,
        fetchMessages,
        startChatFromOrder,
        startChatWithOrderOwner,
        startChatWithUser,
        startChatWithBookedDriver,
        markRead,
        markAllRead,
        deleteChats,
    }
}
