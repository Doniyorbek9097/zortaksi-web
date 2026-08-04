/** Buyurtmalar / E'lon — umumiy kalit so'z filtri (localStorage) */

export const ORDER_FILTER_STORAGE_KEY = 'zt_order_filter_keywords'
export const ORDER_FILTER_BOT_GROUP_KEY = 'zt_order_filter_bot_group_id'
/** Buyurtmalar ro'yxati — bir sahifada */
export const ORDERS_PAGE_LIMIT = 5

const CYRILLIC_TO_LATIN: [RegExp, string][] = [
  [/ё/g, 'yo'], [/ж/g, 'j'], [/ц/g, 'ts'], [/ч/g, 'ch'],
  [/ш/g, 'sh'], [/щ/g, 'sh'], [/ю/g, 'yu'], [/я/g, 'ya'],
  [/ў/g, "o'"], [/ғ/g, "g'"], [/қ/g, 'q'], [/ҳ/g, 'h'],
  [/а/g, 'a'], [/б/g, 'b'], [/в/g, 'v'], [/г/g, 'g'],
  [/д/g, 'd'], [/е/g, 'e'], [/э/g, 'e'], [/з/g, 'z'],
  [/и/g, 'i'], [/й/g, 'y'], [/к/g, 'k'], [/л/g, 'l'],
  [/м/g, 'm'], [/н/g, 'n'], [/о/g, 'o'], [/п/g, 'p'],
  [/р/g, 'r'], [/с/g, 's'], [/т/g, 't'], [/у/g, 'u'],
  [/ф/g, 'f'], [/х/g, 'x'], [/ъ/g, ''], [/ь/g, ''],
  [/ы/g, 'i'],
]

/** Vergul, nuqta-vergul yoki yangi qator bilan ajratilgan kalit so'zlar */
export function parseKeywords(raw: string): string[] {
  return String(raw || '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function toLatin(input: string): string {
  let s = String(input || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/['''‛ʻʼ`´ʹ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  for (const [re, rep] of CYRILLIC_TO_LATIN) s = s.replace(re, rep)
  return s
}

/** Qidiruv: lotin/kirill + o'/g' → o/g (katta-kichik farqsiz) */
export function normalizeMatchText(input: string): string {
  return toLatin(input).replace(/o'/g, 'o').replace(/g'/g, 'g')
}

/** Bo'shliq, _, -, ' ni olib tashlaydi — baliqkol ≈ Baliq_kol */
export function compactMatchText(input: string): string {
  return normalizeMatchText(input).replace(/[\s_'\-]+/g, '')
}

/** Kalit so'z matnda — lotin/kirill, o'/g' va ajratgichlar normalizatsiyasi */
export function keywordMatchesText(haystack: string, keyword: string): boolean {
  const kw = compactMatchText(keyword)
  if (!kw || kw.length < 2) return false
  const hay = String(haystack || '')
  if (!hay.trim()) return false
  return compactMatchText(hay).includes(kw)
}

/** Maydonlar ichidan kamida bitta kalit so'z topilsa true */
export function matchesKeywords(
  fields: Array<string | undefined | null>,
  raw: string,
): boolean {
  const kws = parseKeywords(raw)
  if (!kws.length) return true
  const blob = fields.filter(Boolean).join(' ')
  return kws.some((kw) => keywordMatchesText(blob, kw))
}

/** Faol hudud filtri — xabar matni yoki manba guruh nomi kalit so'zlarga mos kelmasa false */
export function orderMatchesRegionFilter(
  order: {
    message?: { text?: string } | null
    group?: { title?: string; username?: string } | null
  },
  raw: string,
): boolean {
  const kws = parseKeywords(raw)
  if (!kws.length) return true
  return matchesKeywords(
    [order?.message?.text, order?.group?.title, order?.group?.username],
    raw,
  )
}

/** Ro'yxatni faol kalit so'zlar bo'yicha kesish (server/socket sizdiruvlarini ushlab qolish) */
export function filterOrdersByKeywords<T extends { message?: { text?: string } | null }>(
  orders: T[],
  raw: string,
): T[] {
  const kws = parseKeywords(raw)
  if (!kws.length) return orders
  return orders.filter((o) => orderMatchesRegionFilter(o, raw))
}

export function loadOrderFilterKeywords(): string {
  if (!import.meta.client) return ''
  try {
    return localStorage.getItem(ORDER_FILTER_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function saveOrderFilterKeywords(raw: string): void {
  if (!import.meta.client) return
  try {
    const clean = String(raw || '').trim()
    if (clean) localStorage.setItem(ORDER_FILTER_STORAGE_KEY, clean)
    else localStorage.removeItem(ORDER_FILTER_STORAGE_KEY)
  } catch { /* private mode */ }
}

export function clearOrderFilterKeywords(): void {
  saveOrderFilterKeywords('')
}

export function loadOrderFilterBotGroupId(): string {
  if (!import.meta.client) return ''
  try {
    return localStorage.getItem(ORDER_FILTER_BOT_GROUP_KEY) || ''
  } catch {
    return ''
  }
}

export function saveOrderFilterBotGroupId(id: string): void {
  if (!import.meta.client) return
  try {
    const clean = String(id || '').trim()
    if (clean) localStorage.setItem(ORDER_FILTER_BOT_GROUP_KEY, clean)
    else localStorage.removeItem(ORDER_FILTER_BOT_GROUP_KEY)
  } catch { /* private mode */ }
}

export function clearOrderFilterBotGroupId(): void {
  saveOrderFilterBotGroupId('')
}

/** Hudud filtri — to'liq tozalash */
export function clearAllOrderFilterStorage(): void {
  clearOrderFilterKeywords()
  clearOrderFilterBotGroupId()
}

/** Guruh katalogi — client qo'shimcha filter */
export function filterGroupsByKeywords<T extends { title?: string; username?: string }>(
  groups: T[],
  raw: string,
): T[] {
  const kws = parseKeywords(raw)
  if (!kws.length) return groups
  return groups.filter((g) =>
    matchesKeywords([g.title, g.username], raw),
  )
}

/** Mavjud filtrga yangi kalit so'zlarni qo'shish (takrorlanmas) */
export function mergeFilterKeywords(current: string, add: string[]): string {
  const existing = parseKeywords(current)
  const seen = new Set(existing.map((k) => k.toLowerCase()))
  for (const raw of add) {
    const kw = String(raw || '').trim()
    if (!kw) continue
    const key = kw.toLowerCase()
    if (seen.has(key)) continue
    existing.push(kw)
    seen.add(key)
  }
  return existing.join(', ')
}
