import type { IChat } from '~/types'
import { SUPPORT_OPERATOR_LABEL } from '~/utils/supportChatTheme'

/** Support chat — admin bilan yozishma */
export const isSupportChat = (chat: IChat) => chat.kind === 'support'

/** Haydovchi/admin uchun peer sahifasi ko'rsatilsinmi */
export const isDriverPeerChat = (chat: IChat) =>
  chat.kind === 'support' || chat.kind === 'direct' || !!chat.inAppOnly

/**
 * Chat ro'yxatidagi ism — ism, username yoki userId.
 */
export const chatPeerName = (chat: IChat, opts?: { viewerIsAdmin?: boolean }) => {
  if (isSupportChat(chat) && !opts?.viewerIsAdmin) {
    return SUPPORT_OPERATOR_LABEL
  }
  const p = chat.peer
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  if (p.username) return p.username
  if (p.userId) return p.userId
  return isSupportChat(chat) ? SUPPORT_OPERATOR_LABEL : 'Buyurtmachi'
}

/**
 * Chat ro'yxati uchun qisqa sana — bugun soat:daqiqa, aks holda oy-kun.
 */
export const formatChatListDate = (value: string | Date) => {
  if (!value) return ''
  const d = new Date(value)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
