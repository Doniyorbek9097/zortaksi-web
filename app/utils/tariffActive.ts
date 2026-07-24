/** Haydovchi tarifining real-time faolligi (muddat + active flag) */
export function isTariffActive(
  user?: {
    active?: boolean
    tariff?: unknown
    tariffExpireAt?: string | Date | null
  } | null,
): boolean {
  if (!user?.active || !user.tariff) return false
  if (user.tariffExpireAt == null || user.tariffExpireAt === '') return true
  const end = new Date(user.tariffExpireAt).getTime()
  if (Number.isNaN(end)) return true
  return end > Date.now()
}
