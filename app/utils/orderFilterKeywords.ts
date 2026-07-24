/** Buyurtmalar / E'lon — umumiy kalit so'z filtri (localStorage) */

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

/** Vergul bilan ajratilgan kalit so'zlar */
export function parseKeywords(raw: string): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function toLatin(input: string): string {
  let s = String(input || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[’‘ʻ`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  for (const [re, rep] of CYRILLIC_TO_LATIN) s = s.replace(re, rep)
  return s
}

/** Maydonlar ichidan kamida bitta kalit so'z topilsa true */
export function matchesKeywords(
  fields: Array<string | undefined | null>,
  raw: string,
): boolean {
  const kws = parseKeywords(raw)
  if (!kws.length) return true
  const blob = toLatin(fields.filter(Boolean).join(' '))
  return kws.some((kw) => {
    const n = toLatin(kw)
    return n.length > 0 && blob.includes(n)
  })
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
