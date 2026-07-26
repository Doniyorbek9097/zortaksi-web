import type { IChatMessage } from '~/types'

/**
 * Chat ro'yxatida ko'rsatiladigan oxirgi xabar matni.
 * Media va maxsus to'lov markerlari qisqa preview ga aylanadi.
 */
export function lastMessagePreview(msg: IChatMessage): string {
    if (msg.type === 'voice') {
        return `🎤 Ovozli xabar${msg.duration ? ` (${msg.duration}s)` : ''}`
    }
    if (msg.type === 'photo') {
        return msg.text || '📷 Rasm'
    }
    if (msg.type === 'location') {
        return msg.locationTitle || '📍 Joylashuv'
    }
    if (String(msg.text || '').includes('[[ZT_PAYMENT_CARDS]]')) {
        return "💳 To'lov ma'lumoti"
    }
    if (String(msg.text || '').includes('[[ZT_PAYMENT_REQUEST]]')) {
        return "💰 Hisobni to'ldirish"
    }
    return msg.text
}
