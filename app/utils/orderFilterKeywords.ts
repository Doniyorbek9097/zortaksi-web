/** Buyurtmalar / E'lon — umumiy kalit so'z filtri (localStorage) */

import { distance } from 'fastest-levenshtein'

export const ORDER_FILTER_STORAGE_KEY = 'zt_order_filter_keywords'

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

function maxLevenshteinDistance(len: number): number {
  if (len <= 3) return 1
  if (len <= 6) return 2
  return Math.min(4, Math.ceil(len / 3))
}

function tokenizeForFuzzy(text: string): string[] {
  return String(text || '')
    .split(/[\s,;|/\\.+!?()[\]{}#@\-]+/)
    .map((t) => compactMatchText(t))
    .filter((t) => t.length >= 2)
}

function matchesShortKeyword(hay: string, kw: string): boolean {
  const maxDist = maxLevenshteinDistance(kw.length)
  for (const token of tokenizeForFuzzy(hay)) {
    if (token === kw || token.startsWith(kw)) return true
    if (Math.abs(token.length - kw.length) > maxDist) continue
    if (distance(kw, token) <= maxDist) return true
  }
  return false
}

/** Kalit so'z matnda — lotin/kirill, ajratgich va typo (Levenshtein) */
export function keywordMatchesText(haystack: string, keyword: string): boolean {
  const kw = compactMatchText(keyword)
  if (!kw || kw.length < 2) return false
  const hay = String(haystack || '')
  if (!hay.trim()) return false

  const compactHay = compactMatchText(hay)
  if (compactHay.includes(kw)) return true

  if (kw.length <= 3) return matchesShortKeyword(hay, kw)

  const maxDist = maxLevenshteinDistance(kw.length)
  for (const token of tokenizeForFuzzy(hay)) {
    if (Math.abs(token.length - kw.length) > maxDist) continue
    if (distance(kw, token) <= maxDist) return true
  }
  return false
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
    localStorage.setItem(ORDER_FILTER_STORAGE_KEY, raw)
  } catch { /* private mode */ }
}
