export type PaymentMethod = 'click' | 'card'

export function paymentMethodLabel(method?: PaymentMethod | string | null): string {
  if (method === 'card') return 'Karta'
  return 'Click'
}

export function paymentMethodBadgeClass(method?: PaymentMethod | string | null): string {
  if (method === 'card') {
    return 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
  }
  return 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
}

export function paymentMethodIcon(method?: PaymentMethod | string | null): string {
  if (method === 'card') return 'fa-solid fa-credit-card'
  return 'fa-solid fa-bolt'
}
