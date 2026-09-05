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

/** Pastki tabbar sahifalari (driver + admin asosiy) */
export const APP_TABBAR_PATHS = [
  ...DRIVER_MAIN_TABS,
  '/admin/dashboard',
  '/admin/drivers',
] as const

export function isAppTabbarPath(path: string): boolean {
  return (APP_TABBAR_PATHS as readonly string[]).includes(normalizePath(path))
}

/** Asosiy tablar orasida o'tish — to'liq ekran loading kerak emas */
export function isMainTabHop(fromPath: string, toPath: string): boolean {
  const from = normalizePath(fromPath)
  const to = normalizePath(toPath)
  if (!from || !to || from === to) return false
  return isAppTabbarPath(from) && isAppTabbarPath(to)
}

/** Ichki sahifalar qaysi tab bo'limiga tegishli */
export function driverTabSection(path: string): DriverMainTab | null {
  const p = normalizePath(path)
  if (isDriverMainTab(p)) return p
  if (p.startsWith('/driver/chat') || p.startsWith('/driver/interest-chat')) {
    return '/driver/chats'
  }
  if (p.startsWith('/driver/user/')) {
    return '/driver/chats'
  }
  if (
    p.startsWith('/driver/payment') ||
    p.startsWith('/driver/bonus') ||
    p.startsWith('/driver/download-app') ||
    p.startsWith('/driver/topup') ||
    p.startsWith('/driver/accounts')
  ) {
    return '/driver/profile'
  }
  return null
}
