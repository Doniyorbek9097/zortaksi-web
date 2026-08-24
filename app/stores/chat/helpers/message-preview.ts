import type { IChatMessage } from '~/types'
import { isLegacyPaymentChatMessage } from '~/utils/legacyPaymentChatMessage'
import { getChatFileTypeLabel, isChatFileBadgeType } from '~/utils/chatFileTypeLabel'

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
    if (isChatFileBadgeType(msg.type)) {
        return getChatFileTypeLabel(msg.type, msg.mimeType, msg.text)
    }
    return msg.text
}
