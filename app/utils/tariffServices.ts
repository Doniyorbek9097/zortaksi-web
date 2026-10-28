import type { TariffKind } from '~/stores/tariff.store'

export type TariffServices = { buyurtma: boolean; post: boolean }

export function resolveTariffServices(tariff: {
  kind?: unknown
  serviceBuyurtma?: unknown
  servicePost?: unknown
} | null | undefined): TariffServices {
  if (!tariff) return { buyurtma: true, post: false }

  const hasExplicit =
    (tariff.serviceBuyurtma !== undefined && tariff.serviceBuyurtma !== null) ||
    (tariff.servicePost !== undefined && tariff.servicePost !== null)

  if (hasExplicit) {
    return {
      buyurtma: tariff.serviceBuyurtma !== false,
      post: !!tariff.servicePost,
    }
  }

  const k = String(tariff.kind ?? '').trim().toLowerCase()
  if (k === 'driver_post' || k === 'post' || k === 'elon') {
    return { buyurtma: false, post: true }
  }
  return { buyurtma: true, post: false }
}

export function tariffMatchesListKind(
  tariff: { kind?: unknown; serviceBuyurtma?: unknown; servicePost?: unknown },
  listKind: TariffKind
): boolean {
  const s = resolveTariffServices(tariff)
  if (listKind === 'driver_post') return s.post
  return s.buyurtma
}

export function tariffServicesLabel(services: TariffServices): string {
  if (services.buyurtma && services.post) return 'Buyurtma + E\'lon'
  if (services.post) return "E'lon"
  return 'Buyurtma'
}
