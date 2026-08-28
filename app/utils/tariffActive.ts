/** Tarif mavjud va muddati tugamagan */
export function isTariffValid(
  user?: {
    tariff?: unknown
    tariffExpireAt?: string | Date | null
  } | null,
): boolean {
  if (!user?.tariff) return false
  const raw = user.tariffExpireAt
  if (raw != null && raw !== '') {
    const end = new Date(raw).getTime()
    if (!Number.isNaN(end) && end <= Date.now()) return false
  }
  return true
}

/** Haydovchi tarifining real-time faolligi (muddat + active flag) */
export function isTariffActive(
  user?: {
    active?: boolean
    tariff?: unknown
    tariffExpireAt?: string | Date | null
  } | null,
): boolean {
  if (!user?.tariff) return false

  const raw = user.tariffExpireAt
  if (raw != null && raw !== '') {
    const end = new Date(raw).getTime()
    if (!Number.isNaN(end) && end <= Date.now()) return false
  }

  return !!user.active
}
