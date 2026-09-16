const MONTHS_UZ = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function chatDateKey(value: string | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type ChatMessageDateGroup<T extends { date: string | Date }> = {
  key: string
  label: string
  messages: T[]
}

/** Xabarlarni kun bo'yicha guruhlash — sticky sana sarlavhalari uchun */
export function groupMessagesByDate<T extends { date: string | Date }>(
  messages: T[],
): ChatMessageDateGroup<T>[] {
  const groups: ChatMessageDateGroup<T>[] = []
  let currentKey = ''

  for (const msg of messages) {
    const key = chatDateKey(msg.date)
    const label = formatChatDateLabel(msg.date)
    if (key !== currentKey) {
      groups.push({ key, label, messages: [msg] })
      currentKey = key
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return groups
}

/** Chat sticky sana — Bugun / Kecha / 3-iyun */
export function formatChatDateLabel(value?: string | Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const diffDays = Math.round(
    (dayStart(now).getTime() - dayStart(d).getTime()) / 86_400_000,
  )

  if (diffDays === 0) return 'Bugun'
  if (diffDays === 1) return 'Kecha'

  const day = d.getDate()
  const month = MONTHS_UZ[d.getMonth()] || ''
  if (d.getFullYear() === now.getFullYear()) {
    return `${day}-${month}`
  }
  return `${day}-${month}, ${d.getFullYear()}`
}
