/**
 * Admin dashboard — oylik va kunlik trend grafik ma'lumotlari.
 */
import type { useAdminDashboardStore } from '~/stores/adminDashboard.store'

const MONTH_FULL_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

const WEEKDAY_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pash', 'Jum', 'Sham']

type Store = ReturnType<typeof useAdminDashboardStore>

export function useAdminChartData(store: Store) {
  const chartTab = ref<'amount' | 'payments' | 'drivers'>('amount')

  const chartTabs = [
    { label: 'Daromad', value: 'amount' },
    { label: "To'lov", value: 'payments' },
    { label: 'Driver', value: 'drivers' },
  ]

  const chartSelectedTitle = computed(() => {
    if (chartTab.value === 'payments') return "To'lovlar"
    if (chartTab.value === 'amount') return 'Daromad'
    return 'Haydovchilar'
  })

  /** Oylik trend — tanlangan tab bo'yicha qiymat */
  const chartItems = computed(() => {
    const series = store.data?.chart ?? []
    const now = new Date()

    if (!series.length) {
      const labels = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK']
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
        return {
          label: labels[d.getMonth()],
          detail: `${MONTH_FULL_UZ[d.getMonth()]} ${d.getFullYear()}`,
          value: 0,
        }
      })
    }

    return series.map((m, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (series.length - 1 - i), 1)
      const value =
        chartTab.value === 'payments'
          ? m.payments
          : chartTab.value === 'amount'
            ? m.amount
            : m.newDrivers

      return {
        label: m.label,
        detail: `${MONTH_FULL_UZ[d.getMonth()]} ${d.getFullYear()}`,
        value,
      }
    })
  })

  /** 7 kunlik daromad grafigi */
  const incomeDailyItems = computed(() => {
    const series = store.data?.incomeDailyChart ?? []
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return series.map((d, i) => {
      const date = new Date(todayStart.getTime() - (series.length - 1 - i) * 86400000)
      return {
        label: WEEKDAY_SHORT[date.getDay()],
        detail: d.label,
        value: d.amount,
      }
    })
  })

  return {
    chartTab,
    chartTabs,
    chartSelectedTitle,
    chartItems,
    incomeDailyItems,
  }
}
