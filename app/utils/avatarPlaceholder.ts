const AVATAR_PALETTE = [
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-violet-500 to-indigo-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-sky-500 to-blue-500',
  'bg-gradient-to-br from-fuchsia-500 to-purple-500',
] as const

/** Ismning birinchi harfi — avatar placeholder */
export function avatarInitial(name?: string | null): string {
  return (String(name || '').trim()[0] || '?').toUpperCase()
}

/** Ismga qarab barqaror rang — Tailwind gradient class */
export function avatarColorClass(name?: string | null): string {
  const ch = String(name || '?').trim()[0] || '?'
  const code = ch.charCodeAt(0) || 0
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length]
}
