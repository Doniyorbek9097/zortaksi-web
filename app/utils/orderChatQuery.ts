import type { IChat } from '~/types/chat'
import type { IOrder } from '~/types'
import { resolveOrderPhone, revealOrderTextPhones } from '~/utils/phone'
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
  'fromGroup',
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

/** Route query dan darhol chat konteksti (Mijozni olish / order Xabar) */
export function hasOrderQueryContext(query: Record<string, unknown>): boolean {
  return !!String(query.orderId || '').trim()
}

/** Order API javobidan chat stub (sender/guruh URL query emas) */
export function buildChatStubFromOrder(order: IOrder): Partial<IChat> | null {
  const orderId = String(order._id || '').trim()
  if (!orderId) return null

  const phone = resolveOrderPhone(order) || ''
  const orderText = resolveOrderDisplayText(order)
  if (orderText) stashOrderText(orderId, orderText)

  const s = order.sender
  const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()

  return {
    orderId,
    orderText: orderText || undefined,
    kind: 'normal',
    peer: {
      userId: String(s?.userId || '0'),
      firstName: full || s?.username || 'Buyurtmachi',
      lastName: s?.lastName,
      username: cleanUsername(s?.username) || undefined,
      phone: phone || undefined,
      isBot: !!s?.isBot,
      fromGroupTitle: String(order.group?.title || '').trim() || undefined,
      fromGroupUsername: cleanUsername(order.group?.username) || undefined,
      fromPeerId: String(order.group?.groupId || '').trim() || undefined,
      fromMsgId: Number(order.message?.messageId || 0) || undefined,
    },
  }
}

/** Query dan minimal stub — faqat orderId (qolgani API dan to'ldiriladi) */
export function buildMinimalOrderChatStub(orderId: string): Partial<IChat> {
  return {
    orderId,
    kind: 'normal',
    peer: {
      userId: '0',
      firstName: 'Buyurtmachi',
      isBot: false,
    },
  }
}

/** /chat/open query dan mavjud chatni topish — preconnect uchun */
export function resolveChatFromOpenQuery(
  query: Record<string, unknown>,
  chats: IChat[],
): IChat | undefined {
  const chatId = String(query.chatId || '').trim()
  if (chatId) return chats.find((c) => String(c._id) === chatId)

  const mode = String(query.open || '').trim()
  const orderId = String(query.orderId || '').trim()
  const userId = String(query.userId || '').trim()

  if (mode === 'order' && orderId) {
    return chats.find((c) => String(c.orderId || '') === orderId)
  }
  if (mode === 'user' && userId) {
    return chats.find((c) => {
      if (String(c.peer?.userId || '') !== userId) return false
      if (orderId && String(c.orderId || '') !== orderId) return false
      return true
    })
  }
  if ((mode === 'booked' || mode === 'agent') && orderId) {
    return chats.find((c) => String(c.orderId || '') === orderId)
  }
  return undefined
}

/** Guruh «Mijozni olish» tugmasidan kelgan ochilish */
export function isFromGroupTakeClient(query: Record<string, unknown>): boolean {
  return String(query.fromGroup || '').trim() === '1'
}

/** Query dan minimal chat — faqat orderId (sender API dan keladi) */
export function buildChatStubFromOrderQuery(
  query: Record<string, unknown>,
): Partial<IChat> | null {
  const orderId = String(query.orderId || '').trim()
  if (!orderId) return null

  const listedId = String(query.chatId || '').trim()
  const phoneHint = String(query.phone || '').trim()
  const orderTextFromQuery = String(query.orderText || '').trim()
  const orderText = orderTextFromQuery
    ? revealOrderTextPhones(orderTextFromQuery, phoneHint)
    : readStashedOrderText(orderId) || undefined

  const username = cleanUsername(String(query.username || ''))
  const userId = String(query.userId || '').trim()
  const name = String(query.name || '').trim()

  return {
    ...buildMinimalOrderChatStub(orderId),
    orderText: orderText || undefined,
    peer: {
      userId: userId || '0',
      firstName: name || username || 'Buyurtmachi',
      username: username || undefined,
      phone: phoneHint || undefined,
      isBot: false,
      fromGroupTitle: String(query.groupTitle || '').trim() || undefined,
      fromGroupUsername: cleanUsername(String(query.groupUsername || '')) || undefined,
      fromPeerId: String(query.groupId || '').trim() || undefined,
      fromMsgId: Number(query.msgId || 0) || undefined,
    },
  }
}

/** Order matni — haydovchi chatida telefon ochiq */
export function resolveOrderDisplayText(order: IOrder): string {
  const text = String(order.message?.text || '').trim()
  const phone = resolveOrderPhone(order)
  return revealOrderTextPhones(text, phone)
}

/** Order → chat oldidan kontekstni saqlash */
export function primeOrderContext(order: IOrder) {
  const id = String(order._id || '')
  const text = resolveOrderDisplayText(order)
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

/** Order chat — manba guruh (a'zo bo'lish taklifi uchun) */
export function resolveOrderGroupContext(
  query: Record<string, unknown>,
  chat?: IChat | null,
) {
  const links = resolveQuickLinks(query, chat)
  const p = chat?.peer
  const groupId =
    String(query.groupId || '').trim() ||
    String(p?.fromPeerId || '').trim()
  const groupUsername =
    cleanUsername(String(query.groupUsername || '')) ||
    cleanUsername(p?.fromGroupUsername) ||
    ''
  const groupTitle =
    links.groupTitle ||
    String(p?.fromGroupTitle || '').trim()
  const accessHash =
    String(p?.fromPeerAccessHash || query.groupAccessHash || '').trim() ||
    undefined

  if (!groupId && !groupUsername) return null

  return {
    groupId,
    groupUsername,
    groupTitle: groupTitle || groupUsername || 'Guruh',
    groupHref: links.groupHref,
    accessHash,
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
  if (!extra.userId && s?.userId) {
    q.userId = String(s.userId)
  }

  const groupUsername = cleanUsername(order.group?.username)
  const groupId = String(order.group?.groupId || '').trim()
  const msgId = Number(order.message?.messageId || 0)
  const groupTitle = String(order.group?.title || '').trim()
  if (groupUsername) q.groupUsername = groupUsername
  if (groupTitle) q.groupTitle = groupTitle
  if (groupId) q.groupId = groupId
  if (msgId > 0) q.msgId = String(msgId)

  const orderText = resolveOrderDisplayText(order)
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
