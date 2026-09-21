export type TelegramHtmlTag = 'b' | 'i' | 'a' | 'code'

export type WrapSelectionResult = {
  text: string
  selectionStart: number
  selectionEnd: number
}

/** Tanlangan matnni Telegram HTML tegi bilan o'rab chiqish */
export function wrapTelegramHtmlSelection(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  openTag: string,
  closeTag: string,
): WrapSelectionResult {
  const source = String(text || '')
  const start = Math.max(0, Math.min(selectionStart, source.length))
  const end = Math.max(start, Math.min(selectionEnd, source.length))
  const selected = source.slice(start, end)
  const inner = selected || 'matn'
  const wrapped = `${openTag}${inner}${closeTag}`
  const next = `${source.slice(0, start)}${wrapped}${source.slice(end)}`
  const cursorStart = start + openTag.length
  const cursorEnd = cursorStart + inner.length
  return { text: next, selectionStart: cursorStart, selectionEnd: cursorEnd }
}

export function wrapTelegramHtmlTag(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  tag: TelegramHtmlTag,
  attrs?: string,
): WrapSelectionResult {
  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`
  const close = `</${tag}>`
  return wrapTelegramHtmlSelection(text, selectionStart, selectionEnd, open, close)
}

export function sanitizeTelegramLinkUrl(raw: string): string {
  const url = String(raw || '').trim()
  if (!url) return ''
  if (/^(https?:\/\/|tg:\/\/|mailto:)/i.test(url)) return url.replace(/"/g, '')
  if (/^t\.me\//i.test(url)) return `https://${url.replace(/"/g, '')}`
  return `https://${url.replace(/"/g, '')}`
}
