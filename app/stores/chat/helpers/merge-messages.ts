import type { IChatMessage } from '~/types'

/** Xabarlarni sana bo'yicha o'sish tartibida saralaydi */
export function sortMessagesByDate(messages: IChatMessage[]): void {
    messages.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
}

/** Shu chat ochiqmi — yangi xabar qo'shish mumkinmi */
export function isCurrentChatMessage(
    currentChatId: string | undefined,
    msg: IChatMessage,
): boolean {
    return String(currentChatId || '') === String(msg.chatId || '')
}

/** ID yoki tgMessageId bo'yicha dublikat bormi */
export function messageAlreadyExists(
    messages: IChatMessage[],
    msg: IChatMessage,
): boolean {
    if (messages.some((m) => m._id === msg._id)) return true
    if (
        msg.tgMessageId != null &&
        messages.some((m) => m.tgMessageId === msg.tgMessageId)
    ) {
        return true
    }
    return false
}

/**
 * Yuborilayotgan chiquvchi media temp indeksini topadi
 * (socket va HTTP javobini birlashtirish uchun).
 */
export function findSendingTempMediaIndex(
    messages: IChatMessage[],
    msg: IChatMessage,
): number {
    return messages.findIndex(
        (m) =>
            m._id.startsWith('temp-') &&
            m.status === 'sending' &&
            m.type === msg.type &&
            m.chatId === msg.chatId,
    )
}

/**
 * Temp → real almashtirish: socket allaqachon kelgan bo'lsa temp o'chiriladi,
 * aks holda temp o'rniga real xabar qo'yiladi.
 */
export function replaceTempWithReal(
    messages: IChatMessage[],
    tempId: string,
    real: IChatMessage,
): 'replaced' | 'removed-dup' | 'missing' {
    const idx = messages.findIndex((m) => m._id === tempId)
    const exists = messages.some((m) => m._id === real._id)
    if (idx !== -1) {
        if (exists) {
            messages.splice(idx, 1)
            return 'removed-dup'
        }
        messages.splice(idx, 1, real)
        return 'replaced'
    }
    return 'missing'
}

/**
 * Peer o'qigan chiquvchi xabarlarni `read` holatiga o'tkazadi (ikki ✓).
 */
export function applyMessagesRead(
    messages: IChatMessage[],
    chatId: string,
    maxTgMessageId: number,
): IChatMessage[] {
    const id = String(chatId)
    return messages.map((m) => {
        if (
            String(m.chatId) === id &&
            m.direction === 'out' &&
            m.status !== 'failed' &&
            m.status !== 'read' &&
            m.tgMessageId != null &&
            m.tgMessageId <= maxTgMessageId
        ) {
            return { ...m, status: 'read' } as IChatMessage
        }
        return m
    })
}
