import type { IChatMessage } from '~/types'

/** Eski to'lov karta / so'rov auto-xabarlari — chatda ko'rsatilmaydi */
export function isLegacyPaymentChatMessage(msg: Pick<IChatMessage, 'text'>): boolean {
  const t = String(msg.text || '')
  if (t.includes('[[ZT_PAYMENT_CARDS]]')) return true
  if (t.includes('[[ZT_PAYMENT_REQUEST]]')) return true

  const lower = t.toLowerCase()
  if (
    (lower.includes("to'lov so'rovingiz qabul") || lower.includes('tolov sorovingiz qabul')) &&
    (lower.includes('karta egasi') || lower.includes('kartadan biriga'))
  ) {
    return true
  }
  if (lower.includes('tarif sotib olmoqchiman')) return true
  if (lower.includes("hisobni to'ldirmoqchiman") || lower.includes('hisobni toldirmoqchiman')) {
    return true
  }
  if (lower.includes('karta raqamini yuboring') && lower.includes('summa')) return true

  return false
}
