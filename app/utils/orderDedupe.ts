/** Buyurtma matnini solishtirish (frontend dublikat) */
export function normalizeOrderText(text?: string | null): string {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Bir xil e'lonni aniqlash kaliti:
 * 1) dedupeKey (backend)
 * 2) sender.userId + message.text
 * 3) _id
 */
export function orderContentKey(order: {
  _id?: string
  dedupeKey?: string | null
  sender?: { userId?: string | null } | null
  message?: { text?: string | null } | null
}): string {
  if (order?.dedupeKey) return `k:${order.dedupeKey}`
  const sid = String(order?.sender?.userId || '').trim()
  const text = normalizeOrderText(order?.message?.text)
  if (sid && text) return `c:${sid}|${text}`
  return order?._id ? `id:${order._id}` : ''
}

/** Ro'yxatdan bir xil contentni bir marta qoldirish (eng birinchi / yangi) */
export function uniqueOrdersByContent<T extends {
  _id?: string
  dedupeKey?: string | null
  sender?: { userId?: string | null } | null
  message?: { text?: string | null } | null
}>(orders: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const o of orders) {
    const key = orderContentKey(o)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(o)
  }
  return out
}
