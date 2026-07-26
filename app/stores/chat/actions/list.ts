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
        isLoadingMessages,
        total,
    } = refs

    /** Chatlar ro'yxatini yuklash */
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

    /** Chatlarni o'chirish */
    const deleteChats = async (ids: string[]) => {
        const res = await useApi('/chats', { method: 'DELETE', body: { ids } })
        if (res.success) {
            chats.value = chats.value.filter((c) => !ids.includes(c._id))
        }
        return res
    }

    return {
        fetchChats,
        fetchMessages,
        startChatFromOrder,
        startChatWithOrderOwner,
        startChatWithUser,
        startChatWithBookedDriver,
        markRead,
        deleteChats,
    }
}
