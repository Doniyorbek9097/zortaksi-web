/** Matndan telefon raqamini topadi (nuqta, ikki nuqta, tire va h.k.) */
const PHONE_CANDIDATE = /\+?\d(?:[ \t().\-·•:]*\d){6,14}|\b\d{7,15}\b/g
const FRAGMENT_SEP = /\n+|\/|,|;|\||(?:\s+va\s+)/i
const MIN_DIGITS = 7

export const PHONE_MASK = '■■■'

/** 2024-12-31 / 12.31.2024 kabi sanalarni telefon emas deb qoldirish */
function looksLikeDate(raw: string, digits: string): boolean {
  if (digits.length !== 8) return false
  if (!/^[\d.\-/]+$/.test(raw.trim())) return false
  const y = digits.slice(0, 4)
  const y2 = digits.slice(4)
  if (y.startsWith('19') || y.startsWith('20')) return true
  if (y2.startsWith('19') || y2.startsWith('20')) return true
  return false
}

/** Matndagi telefon raqamlarini maska bilan almashtiradi (tomoshabin chatlari) */
export function hidePhoneNumbers(
  text: string | null | undefined,
  mask: string = PHONE_MASK,
): string {
  if (!text) return ''

  return text.replace(PHONE_CANDIDATE, (match) => {
    const digits = (match.match(/\d/g) || []).join('')
    if (digits.length < MIN_DIGITS || digits.length > 15) return match
    if (looksLikeDate(match, digits)) return match

    const leading = match.match(/^\s*/)?.[0] ?? ''
    const trailing = match.match(/\s*$/)?.[0] ?? ''
    return `${leading}${mask}${trailing}`
  })
}

/** Auth / account: E.164 raqamlar (+ siz), istalgan davlat */
const INTL_PHONE_RULES: [prefix: string, exactLen: number][] = [
  ['998', 12],
  ['996', 12],
  ['995', 12],
  ['994', 12],
  ['993', 11],
  ['992', 12],
  ['971', 12],
  ['380', 12],
  ['375', 12],
  ['374', 11],
  ['91', 12],
  ['90', 12],
  ['93', 11],
  ['86', 13],
  ['82', 12],
  ['49', 11], // DE: o‘zgaruvchan — pastki chegar
  ['44', 12],
  ['7', 11],
  ['1', 11],
].sort((a, b) => b[0].length - a[0].length)

/** Login / yangi hisob uchun xalqaro telefon yaroqliligi */
export function isValidIntlPhone(phone: string): boolean {
  const raw = phone.replace(/\D/g, '')
  const d = normalizeTo998(raw) || raw
  if (!/^\d{8,15}$/.test(d)) return false
  for (const [prefix, exactLen] of INTL_PHONE_RULES) {
    if (!d.startsWith(prefix)) continue
    if (prefix === '49') return d.length >= 11 && d.length <= 15
    return d.length === exactLen
  }
  return d.length >= 10 && d.length <= 15
}

/** 901234567 / 998901234567 / 0901234567 → 998901234567 (+998 formati) */
export function normalizeTo998(raw: string | null | undefined): string | null {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null

  if (digits.length === 12 && digits.startsWith('998')) return digits
  if (digits.length === 9 && /^(9\d|33|88|77)\d{7}$/.test(digits)) return `998${digits}`
  if (digits.length === 10 && digits.startsWith('0')) {
    const rest = digits.slice(1)
    if (/^(9\d|33|88|77)\d{7}$/.test(rest)) return `998${rest}`
  }
  // Xalqaro / boshqa — o'z holicha (8–15)
  if (digits.length >= MIN_DIGITS && digits.length <= 15) return digits
  return null
}

/** Backend bilan mos alias — telegramLinks va boshqa importlar uchun */
export function normalizePhoneDigits(raw: string | null | undefined): string | null {
  return normalizeTo998(raw)
}

function normalizeCandidate(raw: string): string | null {
  if (raw.includes('■')) return null
  const digits = (raw.match(/\d/g) || []).join('')
  if (digits.length < MIN_DIGITS || digits.length > 15) return null
  if (looksLikeDate(raw, digits)) return null
  return normalizeTo998(digits)
}

/** Matndan barcha telefonlarni matn tartibida to'playdi */
export function extractPhonesInOrder(text?: string | null): string[] {
  if (!text || text.includes('■')) return []
  const out: string[] = []

  const scan = (chunk: string) => {
    if (!chunk.trim()) return
    const re = new RegExp(PHONE_CANDIDATE.source, 'g')
    for (const m of chunk.matchAll(re)) {
      const normalized = normalizeCandidate(m[0])
      if (normalized) out.push(normalized)
    }
  }

  for (const line of text.split(/\n+/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    for (const part of trimmedLine.split(FRAGMENT_SEP)) {
      scan(part.trim())
    }
    for (const part of trimmedLine.split(/\s+(?=\+?\d)/)) {
      scan(part.trim())
    }
  }

  return out
}

/** Matndan oxirgi topilgan telefon raqamini qaytaradi */
export function extractLastPhoneFromText(text?: string | null): string | null {
  const all = extractPhonesInOrder(text)
  return all.length ? all[all.length - 1] : null
}

export function extractPhoneFromText(text?: string | null): string | null {
  return extractLastPhoneFromText(text)
}

/** tel: uchun tozalangan raqam (+ bilan) */
export function normalizeTelHref(phone: string): string {
  const digits = normalizeTo998(phone) || phone.replace(/\D/g, '')
  if (!digits) return ''
  return `tel:+${digits}`
}

/** Mobil / Telegram WebView — tel: ni native <a> orqali ochish (location.href ishonchsiz) */
export function openTelCall(phone: string): boolean {
  if (!import.meta.client) return false
  const href = normalizeTelHref(phone)
  if (!href) return false

  try {
    const a = document.createElement('a')
    a.href = href
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    return true
  } catch {
    try {
      window.location.assign(href)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Order uchun qo'ng'iroq raqami:
 * 1) callPhone (server) yoki message.text ichidagi oxirgi telefon
 * 2) sender.phone
 * ikkalasi yo'q → null (tugma ko'rinmaydi)
 */
export function resolveOrderPhone(order: {
  callPhone?: string | null
  message?: { text?: string } | null
  sender?: { phone?: string } | null
}): string | null {
  const fromServer = normalizeTo998(order.callPhone)
  if (fromServer) return fromServer

  const fromText = extractLastPhoneFromText(order.message?.text)
  if (fromText) return fromText

  const senderPhone = normalizeTo998(order.sender?.phone)
  if (senderPhone) return senderPhone

  return null
}

/**
 * Chat uchun qo'ng'iroq raqami:
 * 1) xabar matnlari (avval kiruvchi, keyin hammasi)
 * 2) peer.phone / fallbackPhone
 */
export function resolveChatPhone(opts: {
  messages?: { text?: string; direction?: string }[]
  peerPhone?: string | null
  fallbackPhone?: string | null
}): string | null {
  const list = opts.messages || []

  for (const msg of list) {
    if (msg.direction !== 'in') continue
    const phone = extractPhoneFromText(msg.text)
    if (phone) return phone
  }

  for (const msg of list) {
    const phone = extractPhoneFromText(msg.text)
    if (phone) return phone
  }

  for (const raw of [opts.peerPhone, opts.fallbackPhone]) {
    const digits = raw?.replace(/\D/g, '') || ''
    if (digits.length >= MIN_DIGITS) return digits
  }

  return null
}
