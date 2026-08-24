import { isDriverMainTab, normalizePath } from '~/utils/driverTabRoutes'

/** Pastki tabbar orasida o'tish — ro'yxat scroll saqlanmaydi */
export type DriverScrollLeaveKind = 'tab-switch' | 'in-app'

let leaveKind: DriverScrollLeaveKind | null = null

export function isDriverMainTabSwitch(fromPath: string, toPath: string): boolean {
  const from = normalizePath(fromPath)
  const to = normalizePath(toPath)
  if (!isDriverMainTab(from) || !isDriverMainTab(to)) return false
  return from !== to
}

export function markDriverScrollLeave(kind: DriverScrollLeaveKind) {
  leaveKind = kind
}

export function shouldSaveDriverListScroll(): boolean {
  return leaveKind !== 'tab-switch'
}

export function consumeDriverScrollLeave(): DriverScrollLeaveKind | null {
  const kind = leaveKind
  leaveKind = null
  return kind
}
