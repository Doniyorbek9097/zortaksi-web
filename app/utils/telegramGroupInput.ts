/** Public guruh: @username yoki https://t.me/username */
export function normalizePublicGroupUsernameInput(raw: string): string {
  let s = String(raw || '').trim()
  if (!s) return ''

  const fromTme = s.match(
    /(?:https?:\/\/)?(?:www\.)?t\.me\/(?!c\/|\+|joinchat\/)([a-zA-Z0-9_]+)/i,
  )
  if (fromTme?.[1]) {
    s = fromTme[1]
  } else if (/t\.me\/(?:c\/|\+|joinchat\/)/i.test(s)) {
    return ''
  }

  return s.replace(/^@/, '').toLowerCase()
}
