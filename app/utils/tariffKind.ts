import type { TariffKind } from '~/stores/tariff.store'

export function normalizeTariffKind(raw: unknown): TariffKind {
  const k = String(raw ?? '').trim().toLowerCase()
  if (k === 'driver_post' || k === 'post' || k === 'elon') return 'driver_post'
  return 'driver'
}
