import type { IChatMessage } from '~/types'

/** Optimistic UI uchun vaqtinchalik xabar ID */
export function createTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Matn xabari uchun "yuborilmoqda" bubble */
export function createTempTextMessage(
    chatId: string,
    text: string,
    tempId: string,
): IChatMessage {
    return {
        _id: tempId,
        chatId,
        direction: 'out',
        text,
        type: 'text',
        status: 'sending',
        date: new Date().toISOString(),
    } as unknown as IChatMessage
}

/** Ovozli xabar uchun "yuborilmoqda" bubble */
export function createTempVoiceMessage(
    chatId: string,
    duration: number,
    tempId: string,
): IChatMessage {
    return {
        _id: tempId,
        chatId,
        direction: 'out',
        text: '',
        type: 'voice',
        status: 'sending',
        duration,
        date: new Date().toISOString(),
    } as unknown as IChatMessage
}

/** Rasm xabari uchun "yuborilmoqda" bubble */
export function createTempPhotoMessage(
    chatId: string,
    caption: string,
    tempId: string,
): IChatMessage {
    return {
        _id: tempId,
        chatId,
        direction: 'out',
        text: caption,
        type: 'photo',
        status: 'sending',
        date: new Date().toISOString(),
    } as unknown as IChatMessage
}

/** Temp bubble'ni failed holatiga o'tkazish (yuborish xatosi) */
export function markTempFailed(temp: IChatMessage): IChatMessage {
    return { ...temp, status: 'failed' } as IChatMessage
}
