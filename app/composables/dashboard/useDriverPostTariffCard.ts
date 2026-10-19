/**
 * Haydovchi dashboard — e'lon (auto post) tarif kartasi.
 */
import { useAuthStore } from '~/stores/auth.store'

/** Sana: DD/MM/YYYY */
function formatDateUz(value?: string | Date | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function useDriverPostTariffCard() {
  const authStore = useAuthStore()

  const postTariffActive = computed(() => authStore.postTariffActive)

  const resolvePostStartedAt = (): Date | null => {
    const raw = authStore.user?.postStartedAt
    if (raw) {
      const d = new Date(raw)
      if (!Number.isNaN(d.getTime())) return d
    }

    const end = authStore.user?.postTariffExpireAt
    const days = Number(authStore.user?.postTariff?.expireDays || 0)
    if (end && days > 0) {
      const e = new Date(end)
      if (!Number.isNaN(e.getTime())) {
        return new Date(e.getTime() - days * 24 * 60 * 60 * 1000)
      }
    }
    return null
  }

  const postTariff = computed(() => {
    const startedAt = resolvePostStartedAt()
    const t = authStore.user?.postTariff
    return {
      name: t?.name || "Auto e'lon tarifi",
      info: t?.info || "Guruhlarda avtomatik e'lon tarqatish",
      price: t?.price ?? 0,
      expireDays: t?.expireDays ?? 30,
      startDate: formatDateUz(startedAt),
      endDate: formatDateUz(authStore.user?.postTariffExpireAt),
      startedAt,
      expireAt: authStore.user?.postTariffExpireAt ?? null,
    }
  })

  return { postTariff, postTariffActive }
}
