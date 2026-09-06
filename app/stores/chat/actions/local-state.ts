import type { IChat, IChatMessage } from '~/types'
import {
    messageAlreadyExists,
    sortMessagesByDate,
} from '../helpers/merge-messages'
import type { ChatStoreRefs } from '../types'

/** Lokal chat/xabar holatini yangilash yordamchilari */
export function createLocalStateActions(refs: ChatStoreRefs) {
    const { chats, currentChat, messages, messagesChatId } = refs

    /** Ro'yxat va ochiq chatni qisman yangilash */
    const patchChat = (chatId: string, patch: Partial<IChat>) => {
        const idx = chats.value.findIndex((c) => c._id === chatId)
        if (idx !== -1) chats.value[idx] = { ...chats.value[idx], ...patch } as IChat
        if (currentChat.value?._id === chatId) {
            currentChat.value = { ...currentChat.value, ...patch } as IChat
        }
    }

    /** Ochiq chatga xabar qo'shish (dublikatsiz) */
    const appendMessage = (msg: IChatMessage) => {
        const activeId = String(messagesChatId.value || currentChat.value?._id || '')
        if (!activeId || String(msg.chatId || '') !== activeId) return
        if (messageAlreadyExists(messages.value, msg)) return
        const list = messages.value
        const last = list[list.length - 1]
        const t = new Date(msg.date || 0).getTime()
        const lastT = last ? new Date(last.date || 0).getTime() : 0
        list.push(msg)
        // Tartib buzilgan bo'lsa to'liq sort
        if (t < lastT) sortMessagesByDate(list)
    }

    return { patchChat, appendMessage }
}
