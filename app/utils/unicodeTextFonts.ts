/** Telegram matnida Unicode «shrift» (teg emas, belgilar almashtiriladi) */

export type UnicodeFontId =
  | 'scriptBold'
  | 'boldItalic'
  | 'bold'
  | 'smallCaps'
  | 'sansItalic'
  | 'boldFraktur'
  | 'doubleStruck'
  | 'sansBold'
  | 'block'

export type UnicodeFontMenuItem = {
  id: UnicodeFontId
  /** Menyuda ko‘rinishi (namuna) */
  label: string
}

export const UNICODE_FONT_MENU: UnicodeFontMenuItem[] = [
  { id: 'scriptBold', label: '𝓕𝓸𝓷𝓽' },
  { id: 'boldItalic', label: '𝑭𝒐𝒏𝒕' },
  { id: 'bold', label: '𝐅𝐨𝐧𝐭' },
  { id: 'smallCaps', label: 'ғᴏɴᴛ' },
  { id: 'sansItalic', label: '𝘍𝘰𝘯𝘵' },
  { id: 'boldFraktur', label: '𝕱𝖔𝖓𝖙' },
  { id: 'doubleStruck', label: '𝔽𝕠𝕟𝕥' },
  { id: 'sansBold', label: '𝙁𝙤𝙣𝙩' },
  { id: 'block', label: '█▀▀ ▀█▀' },
]

const DOUBLE_STRUCK_CAP: Record<string, number> = {
  C: 0x1d53a,
  H: 0x210d,
  N: 0x1d53b,
  P: 0x1d53c,
  Q: 0x1d53d,
  R: 0x211d,
  Z: 0x1d53e,
}

const SMALL_CAPS: Record<string, string> = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ғ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ǫ',
  r: 'ʀ',
  s: 'ꜱ',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ',
}

/** 2 qatorli blok shrift (A–Z) */
const BLOCK_LETTERS: Record<string, [string, string]> = {
  A: ['▄▀█', '█▀█'],
  B: ['█▄▄', '█▄█'],
  C: ['█▀▀', '█▄▄'],
  D: ['█▀▄', '█▄▀'],
  E: ['█▀▀', '█▄▄'],
  F: ['█▀▀', '█▀░'],
  G: ['█▀▀', '█▄█'],
  H: ['█▀█', '█▀█'],
  I: ['▀█▀', '░█░'],
  J: ['░█▀', '░█░'],
  K: ['█▄▀', '█▀▄'],
  L: ['█░░', '█▄▄'],
  M: ['█▀▄', '█▄▀'],
  N: ['█▄░█', '█░▀█'],
  O: ['█▀█', '█▄█'],
  P: ['█▀█', '█▀▀'],
  Q: ['█▀█', '▀▀█'],
  R: ['█▀█', '█▀▄'],
  S: ['█▀▀', '▀▄▄'],
  T: ['▀█▀', '░█░'],
  U: ['█░█', '█▄█'],
  V: ['█░█', '░█░'],
  W: ['█░█', '█▄█'],
  X: ['█░█', '░█░'],
  Y: ['█░█', '░█░'],
  Z: ['▀▀█', '▄█▀'],
}

function mapAlphanumeric(
  text: string,
  upperStart: number,
  lowerStart: number,
  digitStart?: number,
  upperExceptions?: Record<string, number>,
): string {
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)
    if (code === undefined) {
      out += ch
      continue
    }
    if (code >= 0x41 && code <= 0x5a) {
      const letter = ch
      const exc = upperExceptions?.[letter]
      out += String.fromCodePoint(exc ?? upperStart + (code - 0x41))
      continue
    }
    if (code >= 0x61 && code <= 0x7a) {
      out += String.fromCodePoint(lowerStart + (code - 0x61))
      continue
    }
    if (digitStart && code >= 0x30 && code <= 0x39) {
      out += String.fromCodePoint(digitStart + (code - 0x30))
      continue
    }
    out += ch
  }
  return out
}

function toSmallCaps(text: string): string {
  let out = ''
  for (const ch of text) {
    const lower = ch.toLowerCase()
    out += SMALL_CAPS[lower] ?? SMALL_CAPS[ch] ?? ch
  }
  return out
}

function toBlockFont(text: string): string {
  const letters = text
    .toUpperCase()
    .split('')
    .filter((ch) => /[A-Z0-9 ]/.test(ch))
  if (!letters.length) return text

  const cols: Array<[string, string]> = []
  for (const ch of letters) {
    if (ch === ' ') {
      cols.push(['', ''])
      continue
    }
    const block = BLOCK_LETTERS[ch]
    if (block) cols.push(block)
    else cols.push([ch, ch])
  }

  const row1 = cols.map((c) => c[0]).join(' ')
  const row2 = cols.map((c) => c[1]).join(' ')
  return `${row1}\n${row2}`
}

export function applyUnicodeFontStyle(text: string, fontId: UnicodeFontId): string {
  const source = String(text || '')
  if (!source) return source

  switch (fontId) {
    case 'scriptBold':
      return mapAlphanumeric(source, 0x1d4d0, 0x1d4ea)
    case 'boldItalic':
      return mapAlphanumeric(source, 0x1d468, 0x1d482)
    case 'bold':
      return mapAlphanumeric(source, 0x1d400, 0x1d41a, 0x1d7ce)
    case 'smallCaps':
      return toSmallCaps(source)
    case 'sansItalic':
      return mapAlphanumeric(source, 0x1d608, 0x1d622)
    case 'boldFraktur':
      return mapAlphanumeric(source, 0x1d56c, 0x1d586)
    case 'doubleStruck':
      return mapAlphanumeric(source, 0x1d538, 0x1d552, 0x1d7d8, DOUBLE_STRUCK_CAP)
    case 'sansBold':
      return mapAlphanumeric(source, 0x1d5d4, 0x1d5ee, 0x1d7ec)
    case 'block':
      return toBlockFont(source)
    default:
      return source
  }
}

export function isUnicodeFontId(id: string): id is UnicodeFontId {
  return UNICODE_FONT_MENU.some((item) => item.id === id)
}
