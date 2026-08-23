import type { IChatMessage } from '~/types'
import { isLegacyPaymentChatMessage } from '~/utils/legacyPaymentChatMessage'

/**
 * Chat ro'yxatida ko'rsatiladigan oxirgi xabar matni.
 */
export function lastMessagePreview(msg: IChatMessage): string {
    if (isLegacyPaymentChatMessage(msg)) {
        return ''
    }
    if (msg.type === 'voice') {
        return `🎤 Ovozli xabar${msg.duration ? ` (${msg.duration}s)` : ''}`
    }
    if (msg.type === 'photo') {
        return msg.text || '📷 Rasm'
    }
    if (msg.type === 'location') {
        return msg.locationTitle || '📍 Joylashuv'
    }
    return msg.text
}
