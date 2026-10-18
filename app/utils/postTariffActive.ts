import type { IUser } from '~/types'

export function isPostTariffActive(user: IUser | null | undefined): boolean {
  if (!user?.postTariff) return false
  const raw = user.postTariffExpireAt
  if (!raw) return true
  const end = new Date(raw).getTime()
  if (Number.isNaN(end)) return true
  return end > Date.now()
}
