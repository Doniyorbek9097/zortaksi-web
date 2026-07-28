/**
 * O'zbek Lotin ↔ Kirill konvertatsiya (UI matnlari).
 */

const PRESERVE = [
  'ZorTaksi',
  "Zo'r Taksi",
  'Telegram',
  'WhatsApp',
  'SMS',
  'PWA',
  'API',
  'GPS',
  'VIP',
]

/** Uzun birikmalar avval (case-insensitive replace) */
const LAT_SEQ: [string, string][] = [
  ["o'", 'ў'],
  ["O'", 'Ў'],
  ["g'", 'ғ'],
  ["G'", 'Ғ'],
  ['sh', 'ш'],
  ['Sh', 'Ш'],
  ['SH', 'Ш'],
  ['ch', 'ч'],
  ['Ch', 'Ч'],
  ['CH', 'Ч'],
  ['yo', 'ё'],
  ['Yo', 'Ё'],
  ['YO', 'Ё'],
  ['yu', 'ю'],
  ['Yu', 'Ю'],
  ['YU', 'Ю'],
  ['ya', 'я'],
  ['Ya', 'Я'],
  ['YA', 'Я'],
  ['ts', 'ц'],
  ['Ts', 'Ц'],
  ['TS', 'Ц'],
]

const LAT_CHAR: Record<string, string> = {
  a: 'а', A: 'А',
  b: 'б', B: 'Б',
  d: 'д', D: 'Д',
  e: 'е', E: 'Е',
  f: 'ф', F: 'Ф',
  g: 'г', G: 'Г',
  h: 'ҳ', H: 'Ҳ',
  i: 'и', I: 'И',
  j: 'ж', J: 'Ж',
  k: 'к', K: 'К',
  l: 'л', L: 'Л',
  m: 'м', M: 'М',
  n: 'н', N: 'Н',
  o: 'о', O: 'О',
  p: 'п', P: 'П',
  q: 'қ', Q: 'Қ',
  r: 'р', R: 'Р',
  s: 'с', S: 'С',
  t: 'т', T: 'Т',
  u: 'у', U: 'У',
  v: 'в', V: 'В',
  x: 'х', X: 'Х',
  y: 'й', Y: 'Й',
  z: 'з', Z: 'З',
}

const CYR_SEQ: [string, string][] = [
  ['ў', "o'"],
  ['Ў', "O'"],
  ['ғ', "g'"],
  ['Ғ', "G'"],
  ['ш', 'sh'],
  ['Ш', 'Sh'],
  ['ч', 'ch'],
  ['Ч', 'Ch'],
  ['ё', 'yo'],
  ['Ё', 'Yo'],
  ['ю', 'yu'],
  ['Ю', 'Yu'],
  ['я', 'ya'],
  ['Я', 'Ya'],
  ['ц', 'ts'],
  ['Ц', 'Ts'],
  ['қ', 'q'],
  ['Қ', 'Q'],
  ['ҳ', 'h'],
  ['Ҳ', 'H'],
  ['ж', 'j'],
  ['Ж', 'J'],
]

const CYR_CHAR: Record<string, string> = {
  а: 'a', А: 'A',
  б: 'b', Б: 'B',
  в: 'v', В: 'V',
  г: 'g', Г: 'G',
  д: 'd', Д: 'D',
  е: 'e', Е: 'E',
  э: 'e', Э: 'E',
  з: 'z', З: 'Z',
  и: 'i', И: 'I',
  й: 'y', Й: 'Y',
  к: 'k', К: 'K',
  л: 'l', Л: 'L',
  м: 'm', М: 'M',
  н: 'n', Н: 'N',
  о: 'o', О: 'O',
  п: 'p', П: 'P',
  р: 'r', Р: 'R',
  с: 's', С: 'S',
  т: 't', Т: 'T',
  у: 'u', У: 'U',
  ф: 'f', Ф: 'F',
  х: 'x', Х: 'X',
  ъ: "'", ь: '',
  ы: 'i', Ы: 'I',
}

function withPreserved(input: string, convert: (s: string) => string): string {
  let s = String(input || '')
  const slots: string[] = []
  for (const brand of PRESERVE) {
    const re = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    s = s.replace(re, (m) => {
      slots.push(m)
      return `\uE000${slots.length - 1}\uE001`
    })
  }
  // Tipografik apostrof → oddiy
  s = s.replace(/[’‘ʻ`´]/g, "'")
  s = convert(s)
  return s.replace(/\uE000(\d+)\uE001/g, (_, n) => slots[Number(n)] || '')
}

export function latinToCyrillic(input: string): string {
  return withPreserved(input, (raw) => {
    let s = raw
    for (const [from, to] of LAT_SEQ) {
      s = s.split(from).join(to)
    }
    let out = ''
    for (const ch of s) {
      out += LAT_CHAR[ch] ?? ch
    }
    return out
  })
}

export function cyrillicToLatin(input: string): string {
  return withPreserved(input, (raw) => {
    let s = raw
    for (const [from, to] of CYR_SEQ) {
      s = s.split(from).join(to)
    }
    let out = ''
    for (const ch of s) {
      out += CYR_CHAR[ch] ?? ch
    }
    return out
  })
}

export function looksCyrillic(text: string): boolean {
  const cyr = (text.match(/[\u0400-\u04FF]/g) || []).length
  const lat = (text.match(/[A-Za-z]/g) || []).length
  return cyr > lat
}

export function looksLatinUz(text: string): boolean {
  const lat = (text.match(/[A-Za-z]/g) || []).length
  const cyr = (text.match(/[\u0400-\u04FF]/g) || []).length
  return lat > 0 && lat >= cyr
}
