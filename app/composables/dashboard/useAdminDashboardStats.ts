/**
 * Admin dashboard — jonli statistika va navigatsiya.
 */
import { useAuthStore } from '~/stores/auth.store'
import { isAdminUser } from '~/utils/userRole'
import type { useAdminDashboardStore } from '~/stores/adminDashboard.store'

type Store = ReturnType<typeof useAdminDashboardStore>

/** Birinchi mavjud raqamni qaytaradi */
function pickNumber(...vals: Array<number | undefined | null>): number {
  for (const v of vals) {
    if (v != null && Number.isFinite(Number(v))) return Number(v)
  }
  return 0
}

export function useAdminDashboardStats(store: Store) {
  const authStore = useAuthStore()
  const isMainAdmin = computed(() => isAdminUser(authStore.user))

  const monthIncome = computed(() => store.monthIncome)
  const todayIncome = computed(() => store.data?.todayIncome ?? { amount: 0, payments: 0, total: 0 })
  const weekIncome = computed(() => store.data?.weekIncome ?? { amount: 0, payments: 0, total: 0 })
  const growth = computed(() => store.data?.growth)
  const driverPosts = computed(() => store.data?.driverPosts ?? null)
  const regionIncomeChart = computed(() => store.data?.regionIncomeChart ?? null)

  const navItems = computed(() => {
    const items = [
      { title: 'Haydovchilar', icon: 'fa-solid fa-users', tone: 'green' as const, to: '/admin/drivers' },
      { title: "To'lovlar", icon: 'fa-solid fa-receipt', tone: 'amber' as const, to: '/admin/payments' },
      { title: 'Tariflar', icon: 'fa-solid fa-tags', tone: 'violet' as const, to: '/admin/tariffs' },
      { title: 'Bot guruhlari', icon: 'fa-solid fa-bullhorn', tone: 'rose' as const, to: '/admin/bot-groups' },
      { title: 'Bloklanganlar', icon: 'fa-solid fa-ban', tone: 'rose' as const, to: '/admin/blocked' },
    ]
    if (isMainAdmin.value) {
      items.splice(3, 0, {
        title: 'Bannerlar',
        icon: 'fa-solid fa-image',
        tone: 'blue' as const,
        to: '/admin/banners',
      })
    }
    return items
  })

  const heroStats = computed(() => {
    const s = store.data?.keyStats
    const p = store.data?.platform
    return {
      orders: pickNumber(s?.ordersToday, p?.ordersToday),
      active: pickNumber(s?.activeDrivers, p?.activeDrivers),
    }
  })

  const chipStats = computed(() => {
    const s = store.data?.keyStats
    const p = store.data?.platform
    return {
      newToday: pickNumber(s?.newDriversToday),
      total: pickNumber(s?.totalDrivers, p?.totalDrivers),
      debtors: pickNumber(s?.debtorDrivers),
      visits: pickNumber(s?.visitsToday),
    }
  })

  const tariffTab = ref('month')
  const tariffTabs = [
    { label: 'Shu oy', value: 'month' },
    { label: 'Jami', value: 'total' },
  ]

  const tariffStatsItems = computed(() => {
    const stats = store.data?.tariffStats
    if (!stats) return []
    const list = tariffTab.value === 'month' ? stats.month : stats.total
    return list.slice(0, 5)
  })

  return {
    monthIncome,
    todayIncome,
    weekIncome,
    growth,
    driverPosts,
    regionIncomeChart,
    navItems,
    heroStats,
    chipStats,
    tariffTab,
    tariffTabs,
    tariffStatsItems,
  }
}
