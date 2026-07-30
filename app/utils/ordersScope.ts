export type OrdersScope = 'all' | 'mine' | 'others'

export const ORDERS_SCOPE_STORAGE_KEY = 'zortaksi:orders-scope'

/** Joriy buyurtmalar scope (tab) — sessionStorage + store fallback */
export function readOrdersScope(fallback: OrdersScope = 'all'): OrdersScope {
  if (import.meta.client) {
    try {
      const s = sessionStorage.getItem(ORDERS_SCOPE_STORAGE_KEY)
      if (s === 'all' || s === 'mine' || s === 'others') return s
    } catch { /* ignore */ }
  }
  return fallback
}
