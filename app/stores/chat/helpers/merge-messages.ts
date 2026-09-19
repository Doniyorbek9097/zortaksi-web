/**
 * Chat xabarlar ro'yxati yordamchilari — saralash, dublikat, temp → real.
 */
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

const MEDIA_DEDUP_MS = 90_000
const PHOTO_DEDUP_TIGHT_MS = 15_000

/** ID, tgMessageId yoki yaqin media (ovoz/rasm) bo'yicha dublikat bormi */
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
    if (
        msg.direction === 'in' &&
        msg.type === 'voice' &&
        msg.duration != null &&
        msg.chatId
    ) {
        const at = new Date(msg.date).getTime()
        if (
            messages.some((m) => {
                if (m.direction !== 'in' || m.type !== 'voice') return false
                if (String(m.chatId) !== String(msg.chatId)) return false
                if (m.duration !== msg.duration) return false
                return Math.abs(new Date(m.date).getTime() - at) < MEDIA_DEDUP_MS
            })
        ) {
            return true
        }
    }
    if (msg.direction === 'in' && msg.type === 'photo' && msg.chatId) {
        const at = new Date(msg.date).getTime()
        const win = msg.fileSize ? MEDIA_DEDUP_MS : PHOTO_DEDUP_TIGHT_MS
        if (
            messages.some((m) => {
                if (m.direction !== 'in' || m.type !== 'photo') return false
                if (String(m.chatId) !== String(msg.chatId)) return false
                if (Math.abs(new Date(m.date).getTime() - at) >= win) return false
                if (msg.fileSize && m.fileSize && msg.fileSize !== m.fileSize) return false
                return true
            })
        ) {
            return true
        }
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

/** Yuborilayotgan chiquvchi matn temp indeksini topadi */
export function findSendingTempTextIndex(
    messages: IChatMessage[],
    msg: IChatMessage,
): number {
    const chatId = String(msg.chatId || '')
    const text = String(msg.text || '').trim()
    return messages.findIndex(
        (m) =>
            m._id.startsWith('temp-') &&
            m.status === 'sending' &&
            m.type === 'text' &&
            String(m.chatId || '') === chatId &&
            (!text || String(m.text || '').trim() === text),
    )
}

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
