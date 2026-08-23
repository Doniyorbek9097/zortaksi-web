import type { IChatMessage } from '~/types'
import { stripTelegramHtml } from '~/utils/telegramHtml'

export function messageReplyPreview(msg: Pick<
  IChatMessage,
  'text' | 'type' | 'locationTitle' | 'duration' | 'textFormat'
>): string {
  const type = String(msg.type || 'text')
  if (type === 'voice') {
    const d = Number(msg.duration || 0)
    return d > 0 ? `🎤 Ovozli xabar (${d}s)` : '🎤 Ovozli xabar'
  }
  if (type === 'photo') {
    const t = String(msg.text || '').trim()
    return t || '📷 Rasm'
  }
  if (type === 'location') {
    return String(msg.locationTitle || '').trim() || '📍 Joylashuv'
  }
  const t = msg.textFormat === 'html'
    ? stripTelegramHtml(msg.text || '')
    : String(msg.text || '').replace(/\s+/g, ' ').trim()
  if (!t) return 'Xabar'
  return t.length > 160 ? `${t.slice(0, 157)}...` : t
}

export function replyTargetFromMessage(msg: IChatMessage) {
  return {
    id: String(msg._id),
    text: messageReplyPreview(msg),
    out: msg.direction === 'out',
  }
}
