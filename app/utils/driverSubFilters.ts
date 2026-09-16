import type { DriverSubFilter } from '~/stores/driver.store'

export interface DriverSubFilterOption {
  value: DriverSubFilter
  label: string
  icon: string
}

export const DRIVER_SUB_FILTER_OPTIONS: DriverSubFilterOption[] = [
  { value: 'active', label: 'Faol', icon: 'fa-solid fa-circle-check' },
  { value: 'paid', label: "To'lov qilganlar", icon: 'fa-solid fa-receipt' },
  { value: 'inactive', label: 'Faol emas', icon: 'fa-solid fa-ban' },
  { value: 'unpaid', label: "To'lov qilmaganlar", icon: 'fa-solid fa-wallet' },
  { value: 'in-app', label: "Telegram session bor", icon: 'fa-solid fa-mobile-screen' },
  { value: 'listen-groups', label: 'Tinglovchi guruh tinglaydiganlar', icon: 'fa-solid fa-headset' },
  { value: 'expiring', label: 'Muddati kelganlar (1 kun)', icon: 'fa-solid fa-hourglass-half' },
  { value: 'debt', label: 'Qarzdorlar', icon: 'fa-solid fa-money-bill' },
  { value: 'offline-app', label: "Ilovada emas (session yo'q)", icon: 'fa-solid fa-ban' },
]

export const driverSubFilterLabel = (value: DriverSubFilter) =>
  DRIVER_SUB_FILTER_OPTIONS.find((o) => o.value === value)?.label || ''
