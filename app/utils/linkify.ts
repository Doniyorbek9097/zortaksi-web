import { normalizeTelHref } from '~/utils/phone'

export type LinkPart = {
  type: 'text' | 'link' | 'phone'
  value: string
  href?: string
}

/** URL va telefon raqamlarni ajratib, bosiladigan qismlarga bo'ladi */
export function linkifyParts(text: string): LinkPart[] {
  if (!text) return []

  // URL yoki telefon (parallel qidiruv)
  const re =
    /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|\+?\d(?:[\s\t().\-:/·•]*\d){6,14}|\b\d{7,15}\b)/gi

  const parts: LinkPart[] = []
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    const raw = m[0]
    const start = m.index
    if (start > last) {
      parts.push({ type: 'text', value: text.slice(last, start) })
    }

    if (/^(https?:\/\/|www\.)/i.test(raw)) {
      // URL oxiridagi tinish belgilarini ajratish
      let url = raw
      let trailing = ''
      while (/[),.!?;:]$/.test(url)) {
        trailing = url.slice(-1) + trailing
        url = url.slice(0, -1)
      }
      const href = url.startsWith('http') ? url : `https://${url}`
      parts.push({ type: 'link', value: url, href })
      if (trailing) parts.push({ type: 'text', value: trailing })
    } else if (!raw.includes('■')) {
      const digits = (raw.match(/\d/g) || []).join('')
      if (digits.length >= 7) {
        parts.push({
          type: 'phone',
          value: raw,
          href: normalizeTelHref(digits),
        })
      } else {
        parts.push({ type: 'text', value: raw })
      }
    } else {
      parts.push({ type: 'text', value: raw })
    }

    last = start + raw.length
  }

  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) })
  }

  return parts.length ? parts : [{ type: 'text', value: text }]
}
