/** Telegram HTML — xavfsiz ko'rsatish uchun */
export function stripTelegramHtml(html: string): string {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Telegram HTML ni ilovada ko'rsatish uchun tozalash */
export function sanitizeTelegramHtml(html: string): string {
  let s = String(html || '')
  s = s.replace(/<script[\s>][\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style[\s>][\s\S]*?<\/style>/gi, '')
  s = s.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
  s = s.replace(/javascript:/gi, '')
  s = s.replace(/<span class="tg-spoiler">([\s\S]*?)<\/span>/gi, '<tg-spoiler>$1</tg-spoiler>')

  s = s.replace(
    /<(\/?)(b|strong|i|em|u|ins|s|strike|del|code|pre|a|br|blockquote|tg-spoiler)(\s[^>]*)?>/gi,
    '<$1$2$3>',
  )
  s = s.replace(
    /<(?!\/?(b|strong|i|em|u|ins|s|strike|del|code|pre|a|br|blockquote|tg-spoiler)\b)[^>]+>/gi,
    '',
  )
  return s
}

const TELEGRAM_HTML_TAG_RE =
  /<\/?(?:b|strong|i|em|u|ins|s|strike|del|code|pre|a|br|blockquote|tg-spoiler)(?:\s[^>]*)?>/i

/** Matndan HTML formatini aniqlash */
export function inferTextFormat(
  text: string,
  explicit?: 'plain' | 'html' | null,
): 'plain' | 'html' {
  if (explicit === 'html') return 'html'
  const t = String(text || '').trim()
  if (TELEGRAM_HTML_TAG_RE.test(t)) return 'html'
  if (/&lt;\/?(?:b|strong|i|em|u|ins|s|strike|del|code|pre|a|br|blockquote|tg-spoiler)\b/i.test(t)) {
    return 'html'
  }
  return 'plain'
}

/** Chat bubble uchun: matnda teg bo'lsa doim html */
export function resolveChatTextFormat(
  text: string,
  stored?: 'plain' | 'html' | null,
): 'plain' | 'html' {
  if (inferTextFormat(text) === 'html') return 'html'
  return stored === 'html' ? 'html' : 'plain'
}
