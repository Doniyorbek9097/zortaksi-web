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
  // Telegram formatidagi teglar
  s = s.replace(/<(\/?)(b|strong|i|em|u|ins|s|strike|del|code|pre|a|br)(\s[^>]*)?>/gi, '<$1$2$3>')
  s = s.replace(/<(?!\/?(b|strong|i|em|u|ins|s|strike|del|code|pre|a|br)\b)[^>]+>/gi, '')
  return s
}

/** Matndan HTML formatini aniqlash */
export function inferTextFormat(
  text: string,
  explicit?: 'plain' | 'html' | null,
): 'plain' | 'html' {
  if (explicit === 'html') return 'html'
  const t = String(text || '').trim()
  if (/<[a-z][\s>\/]/i.test(t)) return 'html'
  return 'plain'
}
