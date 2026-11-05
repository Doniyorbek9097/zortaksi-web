import type { TariffKind } from '~/stores/tariff.store'

export type TariffServices = { buyurtma: boolean; post: boolean; lichka: boolean }

export function resolveTariffServices(tariff: {
  kind?: unknown
  serviceBuyurtma?: unknown
  servicePost?: unknown
  serviceLichka?: unknown
} | null | undefined): TariffServices {
  if (!tariff) return { buyurtma: true, post: false, lichka: false }

  if (
    tariff.serviceBuyurtma !== undefined ||
    tariff.servicePost !== undefined ||
    tariff.serviceLichka !== undefined
  ) {
    return {
      buyurtma: tariff.serviceBuyurtma !== false,
      post: !!tariff.servicePost,
      lichka: !!tariff.serviceLichka,
    }
  }

  const k = String(tariff.kind ?? '').trim().toLowerCase()
  if (k === 'driver_post' || k === 'post' || k === 'elon') {
    return { buyurtma: false, post: true, lichka: false }
  }
  return { buyurtma: true, post: false, lichka: false }
}

export function tariffMatchesListKind(
  tariff: {
    kind?: unknown
    serviceBuyurtma?: unknown
    servicePost?: unknown
    serviceLichka?: unknown
  },
  listKind: TariffKind
): boolean {
  const s = resolveTariffServices(tariff)
  if (listKind === 'driver_post') return s.post
  return s.buyurtma
}

export function tariffServicesLabel(services: TariffServices): string {
  const parts: string[] = []
  if (services.buyurtma) parts.push('Buyurtma')
  if (services.post) parts.push("E'lon")
  if (services.lichka) parts.push('Lichka')
  return parts.join(' + ') || '—'
}
