/** Matndan birinchi telefon raqamini topadi (nuqta, ikki nuqta, tire va h.k.) */
const PHONE_CANDIDATE = /\+?\d(?:[\s\t().\-:/·•]*\d){6,14}|\b\d{7,15}\b/g
const MIN_DIGITS = 7

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
  const d = phone.replace(/\D/g, '')
  if (!/^\d{8,15}$/.test(d)) return false
  for (const [prefix, exactLen] of INTL_PHONE_RULES) {
    if (!d.startsWith(prefix)) continue
    if (prefix === '49') return d.length >= 11 && d.length <= 15
    return d.length === exactLen
  }
  return d.length >= 10 && d.length <= 15
}

export function extractPhoneFromText(text?: string | null): string | null {
  if (!text) return null
  const matches = text.match(PHONE_CANDIDATE) || []
  for (const m of matches) {
    // Maskalangan raqam emas
    if (m.includes('■')) continue
    const digits = (m.match(/\d/g) || []).join('')
    if (digits.length < MIN_DIGITS) continue
    return digits.startsWith('998') || digits.length > 9 ? digits : digits
  }
  return null
}

/** tel: uchun tozalangan raqam (+ bilan) */
export function normalizeTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  return `tel:+${digits}`
}

/**
 * Order uchun qo'ng'iroq raqami:
 * 1) message.text ichidan
 * 2) sender.phone
 */
export function resolveOrderPhone(order: {
  message?: { text?: string } | null
  sender?: { phone?: string } | null
}): string | null {
  const fromText = extractPhoneFromText(order.message?.text)
  if (fromText) return fromText

  const senderPhone = order.sender?.phone?.replace(/\D/g, '')
  if (senderPhone && senderPhone.length >= MIN_DIGITS) return senderPhone

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
