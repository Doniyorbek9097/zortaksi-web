import type { IChat } from '~/types/chat'
import type { IOrder } from '~/types'
import { resolveOrderPhone } from '~/utils/phone'

const cleanUsername = (raw?: string | null) =>
  String(raw || '').replace(/^@/, '').trim()

/** Chat tezkor tugmalari uchun query kalitlari */
export const QUICK_LINK_QUERY_KEYS = [
  'name',
  'phone',
  'username',
  'groupUsername',
  'groupId',
  'msgId',
  'orderId',
] as const

export function pickQuickLinkQuery(
  query: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of QUICK_LINK_QUERY_KEYS) {
    const v = query[k]
    if (v != null && String(v).trim()) out[k] = String(v)
  }
  return out
}

/** Order → chat: sender + guruh havolasi (yuklanishni kutmasdan) */
export function orderQuickLinkQuery(
  order: IOrder,
  extra: Record<string, string> = {},
): Record<string, string> {
  const q: Record<string, string> = { ...extra }
  if (order._id) q.orderId = String(order._id)

  const s = order.sender
  if (!extra.name) {
    const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
    const name = full || s?.username || ''
    if (name) q.name = name
  }
  if (!extra.phone) {
    const phone = resolveOrderPhone(order) || ''
    if (phone) q.phone = phone
  }
  if (!extra.username) {
    const username = cleanUsername(s?.username)
    if (username) q.username = username
  }

  const groupUsername = cleanUsername(order.group?.username)
  const groupId = String(order.group?.groupId || '').trim()
  const msgId = Number(order.message?.messageId || 0)
  if (groupUsername) q.groupUsername = groupUsername
  if (groupId) q.groupId = groupId
  if (msgId > 0) q.msgId = String(msgId)

  return q
}

/** Chat ro'yxati → peer + saqlangan guruh havolasi */
export function chatPeerQuickLinkQuery(
  chat: IChat,
  extra: Record<string, string> = {},
): Record<string, string> {
  const q: Record<string, string> = { ...extra }
  const p = chat.peer

  if (chat.orderId && !extra.orderId) q.orderId = String(chat.orderId)
  if (p?.phone && !extra.phone) q.phone = p.phone
  const username = cleanUsername(p?.username)
  if (username && !extra.username) q.username = username

  const groupUsername = cleanUsername(p?.fromGroupUsername)
  if (groupUsername) q.groupUsername = groupUsername
  if (p?.fromPeerId) q.groupId = String(p.fromPeerId)
  if (p?.fromMsgId) q.msgId = String(p.fromMsgId)

  return q
}
