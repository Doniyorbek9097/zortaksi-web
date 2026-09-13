/**
 * Haydovchi dashboard — tarif kartasi ma'lumotlari.
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

export function useDriverTariffCard() {
  const authStore = useAuthStore()

  const tariffActive = computed(() => authStore.tariffActive)
  const balance = computed(() => authStore.user?.balance ?? 0)
  const firstName = computed(() => authStore.user?.firstName || 'Haydovchi')

  /** Eski hisoblar uchun startedAt ni hisoblash */
  const resolveStartedAt = (): Date | null => {
    const raw = authStore.user?.startedAt
    if (raw) {
      const d = new Date(raw)
      if (!Number.isNaN(d.getTime())) return d
    }

    const end = authStore.user?.tariffExpireAt
    const days = Number(authStore.user?.tariff?.expireDays || 0)
    if (end && days > 0) {
      const e = new Date(end)
      if (!Number.isNaN(e.getTime())) {
        return new Date(e.getTime() - days * 24 * 60 * 60 * 1000)
      }
    }
    return null
  }

  const tariff = computed(() => {
    const startedAt = resolveStartedAt()
    return {
      name: authStore.user?.tariff?.name || 'Kunlik sinov',
      info: authStore.user?.tariff?.info || '1 - martalik sinov tarifi',
      price: authStore.user?.tariff?.price ?? 5000,
      expireDays: authStore.user?.tariff?.expireDays ?? 1,
      startDate: formatDateUz(startedAt),
      endDate: formatDateUz(authStore.user?.tariffExpireAt),
      startedAt,
      expireAt: authStore.user?.tariffExpireAt ?? null,
    }
  })

  return { tariff, tariffActive, balance, firstName }
}
