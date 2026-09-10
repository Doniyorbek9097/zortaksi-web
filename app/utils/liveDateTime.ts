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

const WEEKDAYS_UZ = [
  'yakshanba',
  'dushanba',
  'seshanba',
  'chorshanba',
  'payshanba',
  'juma',
  'shanba',
]

/** 🗓️10 - sentyabr payshanba ⌚07:00 */
export function formatLiveDateTimeLabel(date: Date): string {
  const day = date.getDate()
  const month = MONTHS_UZ[date.getMonth()] || ''
  const weekday = WEEKDAYS_UZ[date.getDay()] || ''
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `🗓️${day} - ${month} ${weekday} ⌚${hh}:${mm}`
}
