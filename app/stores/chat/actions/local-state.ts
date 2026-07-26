import type { IChat, IChatMessage } from '~/types'
import {
    isCurrentChatMessage,
    messageAlreadyExists,
    sortMessagesByDate,
} from '../helpers/merge-messages'
import type { ChatStoreRefs } from '../types'

/** Lokal chat/xabar holatini yangilash yordamchilari */
export function createLocalStateActions(refs: ChatStoreRefs) {
    const { chats, currentChat, messages } = refs

    /** Ro'yxat va ochiq chatni qisman yangilash */
    const patchChat = (chatId: string, patch: Partial<IChat>) => {
        const idx = chats.value.findIndex((c) => c._id === chatId)
        if (idx !== -1) chats.value[idx] = { ...chats.value[idx], ...patch } as IChat
        if (currentChat.value?._id === chatId) {
            currentChat.value = { ...currentChat.value, ...patch } as IChat
        }
    }

    /** Ochiq chatga xabar qo'shish (dublikatsiz, sana bo'yicha tartib) */
    const appendMessage = (msg: IChatMessage) => {
        if (!isCurrentChatMessage(currentChat.value?._id, msg)) return
        if (messageAlreadyExists(messages.value, msg)) return
        messages.value.push(msg)
        sortMessagesByDate(messages.value)
    }

    return { patchChat, appendMessage }
}
