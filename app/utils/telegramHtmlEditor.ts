import { inferTextFormat, sanitizeTelegramHtml } from '~/utils/telegramHtml'

export type TelegramHtmlTag = 'b' | 'i' | 'a' | 'code'

export type WrapSelectionResult = {
  text: string
  selectionStart: number
  selectionEnd: number
}

function escapeHtmlText(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeTelegramText(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Telegram HTML → contenteditable ko'rinishi (teglar o'qiladi, \n → br) */
export function telegramHtmlToEditorHtml(raw: string): string {
  const text = String(raw || '')
  if (!text) return ''

  if (inferTextFormat(text) === 'plain') {
    return escapeHtmlText(text).replace(/\n/g, '<br>')
  }

  return sanitizeTelegramHtml(text)
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br>')
}

function pushNewline(parts: string[]) {
  if (!parts.length) return
  if (!parts[parts.length - 1]?.endsWith('\n')) parts.push('\n')
}

function serializeEditorNode(node: Node, parts: string[], isBlockRoot = false): void {
  if (node.nodeType === Node.TEXT_NODE) {
    parts.push(escapeTelegramText(node.textContent || ''))
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  if (tag === 'br') {
    parts.push('\n')
    return
  }

  if (tag === 'div' || tag === 'p') {
    if (!isBlockRoot && parts.length) pushNewline(parts)
    for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
    if (!isBlockRoot && el.nextSibling) pushNewline(parts)
    return
  }

  if (tag === 'b' || tag === 'strong') {
    parts.push('<b>')
    for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
    parts.push('</b>')
    return
  }

  if (tag === 'i' || tag === 'em') {
    parts.push('<i>')
    for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
    parts.push('</i>')
    return
  }

  if (tag === 'code') {
    parts.push('<code>')
    for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
    parts.push('</code>')
    return
  }

  if (tag === 'a') {
    const href = sanitizeTelegramLinkUrl(el.getAttribute('href') || '')
    if (!href) {
      for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
      return
    }
    parts.push(`<a href="${href}">`)
    for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
    parts.push('</a>')
    return
  }

  for (const child of Array.from(el.childNodes)) serializeEditorNode(child, parts)
}

/** contenteditable HTML → Telegram HTML (\n saqlanadi) */
export function editorHtmlToTelegramHtml(html: string): string {
  const root = document.createElement('div')
  root.innerHTML = String(html || '')

  const parts: string[] = []
  for (const child of Array.from(root.childNodes)) {
    serializeEditorNode(child, parts, true)
  }

  return parts
    .join('')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
}

/** Tanlangan matnni Telegram HTML tegi bilan o'rab chiqish (textarea rejimi) */
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
