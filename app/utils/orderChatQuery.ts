import type { IChat } from '~/types/chat'
import type { IOrder } from '~/types'
import { resolveOrderPhone } from '~/utils/phone'
import { buildGroupViewUrl, buildTelegramContactUrl } from '~/utils/telegramLinks'

const cleanUsername = (raw?: string | null) =>
  String(raw || '').replace(/^@/, '').trim()

/** Chat tezkor tugmalari uchun query kalitlari */
export const QUICK_LINK_QUERY_KEYS = [
  'name',
  'phone',
  'username',
  'groupUsername',
  'groupTitle',
  'groupId',
  'msgId',
  'orderId',
  'orderText',
] as const

const ORDER_TEXT_STORAGE_PREFIX = 'zt:order-text:'
/** URL uzunligi cheklovi — qisqa preview */
const ORDER_TEXT_QUERY_MAX = 280

function stashKey(orderId: string) {
  return `${ORDER_TEXT_STORAGE_PREFIX}${orderId}`
}

/** Order matnini sessionStorage ga (to'liq matn) */
export function stashOrderText(orderId: string, text: string) {
  if (!import.meta.client || !orderId || !text.trim()) return
  try {
    sessionStorage.setItem(stashKey(orderId), text.trim())
  } catch {
    /* quota */
  }
}

export function readStashedOrderText(orderId: string): string {
  if (!import.meta.client || !orderId) return ''
  try {
    return sessionStorage.getItem(stashKey(orderId)) || ''
  } catch {
    return ''
  }
}

/** Order → chat oldidan kontekstni saqlash */
export function primeOrderContext(order: IOrder) {
  const id = String(order._id || '')
  const text = String(order.message?.text || '').trim()
  if (id && text) stashOrderText(id, text)
}

/** Chat ochilganda buyurtma matni (query → stash → chat) */
export function resolveOrderTextHint(
  query: Record<string, unknown>,
  chat?: { orderId?: string; orderText?: string } | null,
): string {
  const fromQuery = String(query.orderText || '').trim()
  if (fromQuery) return fromQuery

  const orderId = String(query.orderId || chat?.orderId || '')
  if (orderId) {
    const stashed = readStashedOrderText(orderId)
    if (stashed) return stashed
  }

  return String(chat?.orderText || '').trim()
}

function truncateForQuery(text: string): string {
  const t = text.trim()
  if (t.length <= ORDER_TEXT_QUERY_MAX) return t
  return `${t.slice(0, ORDER_TEXT_QUERY_MAX)}…`
}

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

/** Chat tezkor tugmalar — avval route query (order dan), keyin chat peer */
export function resolveQuickLinks(
  query: Record<string, unknown>,
  chat?: IChat | null,
) {
  const p = chat?.peer

  const username =
    cleanUsername(String(query.username || '')) ||
    cleanUsername(p?.username) ||
    ''
  const phone =
    String(query.phone || '').trim() ||
    String(p?.phone || '').trim() ||
    ''

  const groupUsername =
    cleanUsername(String(query.groupUsername || '')) ||
    cleanUsername(p?.fromGroupUsername) ||
    ''
  const groupId =
    String(query.groupId || '').trim() ||
    String(p?.fromPeerId || '').trim() ||
    ''
  const msgId = Number(query.msgId || 0) || Number(p?.fromMsgId || 0) || 0
  const groupTitle =
    String(query.groupTitle || '').trim() ||
    String(p?.fromGroupTitle || '').trim() ||
    ''

  return {
    telegramHref: buildTelegramContactUrl({ username, phone }),
    groupHref: buildGroupViewUrl({
      groupUsername,
      groupId,
      messageId: msgId > 0 ? msgId : undefined,
    }),
    groupTitle,
  }
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
  const groupTitle = String(order.group?.title || '').trim()
  if (groupUsername) q.groupUsername = groupUsername
  if (groupTitle) q.groupTitle = groupTitle
  if (groupId) q.groupId = groupId
  if (msgId > 0) q.msgId = String(msgId)

  const orderText = String(order.message?.text || '').trim()
  if (orderText) {
    primeOrderContext(order)
    q.orderText = truncateForQuery(orderText)
  }

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
  const groupTitle =
    String(query.groupTitle || '').trim() ||
    String(p?.fromGroupTitle || '').trim() ||
    ''
  if (groupUsername) q.groupUsername = groupUsername
  if (p?.fromGroupTitle) q.groupTitle = String(p.fromGroupTitle)
  if (p?.fromPeerId) q.groupId = String(p.fromPeerId)
  if (p?.fromMsgId) q.msgId = String(p.fromMsgId)

  const orderText = String(chat.orderText || '').trim()
  if (orderText && chat.orderId) {
    stashOrderText(String(chat.orderId), orderText)
    q.orderText = truncateForQuery(orderText)
  }

  return q
}
