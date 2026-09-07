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
