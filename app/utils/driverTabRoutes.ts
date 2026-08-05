/** Haydovchi pastki tabbar — asosiy sahifalar */
export const DRIVER_MAIN_TABS = [
  '/driver/dashboard',
  '/driver/orders',
  '/driver/chats',
  '/driver/post',
  '/driver/profile',
] as const

export type DriverMainTab = (typeof DRIVER_MAIN_TABS)[number]

export function normalizePath(path: string): string {
  const raw = String(path || '').split('?')[0]?.split('#')[0] || ''
  if (raw.length > 1 && raw.endsWith('/')) return raw.slice(0, -1)
  return raw
}

export function isDriverMainTab(path: string): path is DriverMainTab {
  return (DRIVER_MAIN_TABS as readonly string[]).includes(normalizePath(path))
}

/** Ichki sahifalar qaysi tab bo'limiga tegishli */
export function driverTabSection(path: string): DriverMainTab | null {
  const p = normalizePath(path)
  if (isDriverMainTab(p)) return p
  if (p.startsWith('/driver/chat') || p.startsWith('/driver/interest-chat')) {
    return '/driver/chats'
  }
  if (
    p.startsWith('/driver/payment') ||
    p.startsWith('/driver/bonus') ||
    p.startsWith('/driver/topup') ||
    p.startsWith('/driver/accounts')
  ) {
    return '/driver/profile'
  }
  return null
}
