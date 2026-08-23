import type { IChat, IChatMessage } from '~/types'
import { invalidateChatMediaCaches, useChatMedia } from '~/composables/useVoiceMedia'
import { inferTextFormat } from '~/utils/telegramHtml'
import { lastMessagePreview } from '../helpers/message-preview'
import {
    applyMessagesRead,
    findSendingTempMediaIndex,
} from '../helpers/merge-messages'
import type { ChatStoreRefs } from '../types'

/** Socket event handlerlari (yangi xabar, o'qildi, chat yangilanishi) */
export function createSocketActions(
    refs: ChatStoreRefs,
    deps: {
        appendMessage: (msg: IChatMessage) => void
        handoffMediaTemp: (
            tempId: string,
            realId: string,
            kind: 'voice' | 'photo',
        ) => void
        markRead: (chatId: string) => Promise<void>
        clearTypingForChat: (chatId: string) => void
    },
) {
    const { chats, currentChat, messages } = refs
    const { appendMessage, handoffMediaTemp, markRead, clearTypingForChat } = deps

    /** Socket/HTTP dan kelgan chiquvchi media — temp bilan birlashtirish */
    const mergeOutgoingMediaFromSocket = (msg: IChatMessage): boolean => {
        if (msg.direction !== 'out' || (msg.type !== 'voice' && msg.type !== 'photo')) {
            return false
        }
        const tempIdx = findSendingTempMediaIndex(messages.value, msg)
        if (tempIdx === -1) return false
        const tempId = messages.value[tempIdx]._id
        handoffMediaTemp(tempId, msg._id, msg.type === 'voice' ? 'voice' : 'photo')
        messages.value.splice(tempIdx, 1, msg)
        return true
    }

    /** Socket: mavjud xabar matni/status/media yangilandi (voice fonda yuklanganda) */
    const onMessageUpdate = (msg: IChatMessage) => {
        if (!msg?._id) return
        const idx = messages.value.findIndex((m) => m._id === msg._id)
        const prev = idx !== -1 ? messages.value[idx] : null
        if (idx !== -1) {
            const merged = { ...messages.value[idx], ...msg } as IChatMessage
            merged.textFormat = inferTextFormat(
                merged.text || '',
                merged.textFormat || messages.value[idx].textFormat,
            )
            messages.value[idx] = merged
        }
        if (
            import.meta.client &&
            (msg.type === 'voice' || msg.type === 'photo') &&
            (msg.mediaPath || msg.tgMessageId)
        ) {
            const kind = msg.type === 'voice' ? 'voice' : 'photo'
            const prevPath = prev?.mediaPath
            const wasRemote = !prevPath || prevPath === 'remote'
            const nowReady = msg.mediaPath && msg.mediaPath !== 'remote'
            useChatMedia()
                .getUrl(msg._id, kind, {
                    forceNetwork: !!(wasRemote && nowReady),
                    mediaPath: msg.mediaPath || 'remote',
                })
                .catch(() => {})
        }
    }

    /** Socket: yangi xabar keldi (kiruvchi yoki chiquvchi) */
    const onNewMessage = (msg: IChatMessage) => {
        const normalized = {
            ...msg,
            textFormat: inferTextFormat(msg.text || '', msg.textFormat),
        } as IChatMessage
        if (mergeOutgoingMediaFromSocket(normalized)) {
            // temp bilan birlashtirildi
        } else {
            appendMessage(normalized)
        }

        if (
            import.meta.client &&
            (normalized.type === 'voice' || normalized.type === 'photo') &&
            (normalized.mediaPath || normalized.tgMessageId)
        ) {
            const kind = normalized.type === 'voice' ? 'voice' : 'photo'
            useChatMedia()
                .getUrl(normalized._id, kind, { mediaPath: normalized.mediaPath || 'remote' })
                .catch(() => {})
        }

        // Ro'yxatda oxirgi xabar + tartib (owner socket — faqat o'z chatlari)
        const idx = chats.value.findIndex((c) => c._id === normalized.chatId)
        if (idx !== -1) {
            const preview = lastMessagePreview(normalized)
            const chat = {
                ...chats.value[idx],
                lastMessage: preview,
                lastMessageAt: normalized.date,
            } as IChat
            if (normalized.direction === 'in' && currentChat.value?._id !== normalized.chatId) {
                chat.unreadCount = (chat.unreadCount || 0) + 1
            }
            chats.value.splice(idx, 1)
            chats.value.unshift(chat)
        }

        if (normalized.direction === 'in' && currentChat.value?._id === normalized.chatId) {
            markRead(normalized.chatId)
        }
    }

    /** Socket: chat holati yangilandi (unread, oxirgi xabar) */
    const onChatUpdate = (chat: IChat) => {
        const idx = chats.value.findIndex((c) => c._id === chat._id)
        if (idx !== -1) {
            chats.value[idx] = { ...chats.value[idx], ...chat } as IChat
        } else if (chat?._id) {
            // Yangi chat (masalan orderdan ochilgan) — ro'yxatga qo'shish
            chats.value.unshift(chat)
        }
        if (currentChat.value?._id === chat._id) {
            currentChat.value = { ...currentChat.value, ...chat } as IChat
        }
    }

    /** Socket: peer xabarlarimizni o'qidi — ikki ✓ */
    const onMessagesRead = (data: { chatId: string; maxTgMessageId: number }) => {
        if (!data?.chatId) return
        messages.value = applyMessagesRead(
            messages.value,
            data.chatId,
            data.maxTgMessageId,
        )
    }

    /** Socket: xabar(lar) o'chirildi */
    const onMessagesDeleted = (data: { chatId: string; messageIds: string[] }) => {
        if (!data?.chatId || !Array.isArray(data.messageIds) || !data.messageIds.length) return
        const idSet = new Set(data.messageIds.map(String))
        if (currentChat.value?._id === data.chatId) {
            messages.value = messages.value.filter((m) => !idSet.has(String(m._id)))
        }
        if (import.meta.client) {
            invalidateChatMediaCaches([...idSet])
        }
    }

    const onNewMessageWithTyping = (msg: IChatMessage) => {
        clearTypingForChat(msg.chatId)
        onNewMessage(msg)
    }

    return {
        onMessageUpdate,
        onNewMessage: onNewMessageWithTyping,
        onChatUpdate,
        onMessagesRead,
        onMessagesDeleted,
    }
}
