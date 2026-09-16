import { normalizePath } from '~/utils/driverTabRoutes'
import { hasPanelShellAccess } from '~/utils/userRole'
import type { IUser } from '~/types'

/** Tabbar ko'rinmasligi kerak bo'lgan sahifalar */
const FULLSCREEN_EXACT = new Set([
  '/auth',
  '/connection-error',
  '/driver/take-order',
  '/driver/interest-chat',
])

const FULLSCREEN_PREFIXES = [
  '/driver/chat/',
  '/driver/user/',
  '/driver/accounts/',
]

/** Admin pastki tabbar — driver yo'llar ham admin layout */
const PANEL_SHELL_DRIVER_ROUTES = new Set([
  '/driver/orders',
  '/driver/chats',
  '/driver/profile',
  '/driver/campaigns',
  '/driver/post',
])

export function isFullscreenRoute(path: string): boolean {
  const p = normalizePath(path)
  if (FULLSCREEN_EXACT.has(p)) return true
  return FULLSCREEN_PREFIXES.some((prefix) => p.startsWith(prefix))
}

export function isPanelShellDriverRoute(path: string): boolean {
  const p = normalizePath(path)
  if (PANEL_SHELL_DRIVER_ROUTES.has(p)) return true
  return p.startsWith('/driver/campaigns/')
}

/**
 * Route uchun layout — setPageLayout() chaqiruvi.
 * Chat kabi fullscreen sahifalarda tabbar chiqmasligi uchun muhim.
 */
export function resolveRoutePageLayout(
  path: string,
  user: IUser | null | undefined,
  routeMetaLayout: unknown,
): string | false {
  const p = normalizePath(path)

  if (isFullscreenRoute(p)) return false

  if (p.startsWith('/admin')) return 'admin'

  const panel = hasPanelShellAccess(user)
  if (panel && isPanelShellDriverRoute(p)) return 'admin'

  if (routeMetaLayout === false) return false
  if (typeof routeMetaLayout === 'string' && routeMetaLayout) {
    return routeMetaLayout
  }

  return 'driver'
}
