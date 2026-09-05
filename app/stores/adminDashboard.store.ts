import { defineStore } from 'pinia'

export interface IncomeBlock {
  amount: number
  payments: number
  total: number
}

export interface DataRow {
  label: string
  amount: number
  count: number
}

export interface ChartMonth {
  label: string
  payments: number
  amount: number
  newDrivers: number
}

export interface RegionDriverStat {
  slug: string
  title: string
  count: number
  active: number
  income?: number
  incomePayments?: number
}

export interface TariffStatItem {
  tariffId?: string | null
  title: string
  count: number
  amount: number
  expireDays?: number | null
}

export interface TariffStatsBlock {
  month: TariffStatItem[]
  total: TariffStatItem[]
}

export interface DashboardGrowth {
  ordersTodayDelta: number
  newDriversTodayDelta: number
  monthIncomeDelta: number
  monthIncomePercent: number
  newDriversMonthDelta: number
}

export interface AdminDashboardData {
  monthIncome: IncomeBlock
  todayIncome?: IncomeBlock
  weekIncome?: IncomeBlock
  keyStats: {
    ordersToday: number
    newDriversToday: number
    activeDrivers: number
    debtorDrivers: number
    totalDrivers?: number
    newDrivers?: number
    visitsToday?: number
    yearIncome?: number
    ordersLastHour?: number
    ordersTotal?: number
    newOrders?: number
    tariffsCount?: number
    totalInvites?: number
    totalReferrers?: number
  }
  platform?: {
    ordersToday: number
    ordersLastHour: number
    ordersTotal: number
    newOrders: number
    totalDrivers: number
    activeDrivers: number
    tariffsCount: number
    totalInvites?: number
    totalReferrers?: number
  }
  incomeDetails: DataRow[]
  tariffSplit: DataRow[]
  tariffStats?: TariffStatsBlock
  chart: ChartMonth[]
  incomeDailyChart?: ChartMonth[]
  regionDrivers?: RegionDriverStat[]
  growth?: DashboardGrowth
}

const CACHE_KEY = 'zt:admin-dashboard-data'

const emptyIncome = (): IncomeBlock => ({ amount: 0, payments: 0, total: 0 })

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const data = ref<AdminDashboardData | null>(null)
  const isLoading = ref(false)
  const error = ref('')
  const hydrated = ref(false)

  const loadCached = () => {
    if (!import.meta.client) return
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AdminDashboardData
      if (parsed && typeof parsed === 'object') {
        data.value = parsed
        hydrated.value = true
      }
    } catch {
      /* */
    }
  }

  const saveCached = () => {
    if (!import.meta.client || !data.value) return
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.value))
    } catch {
      /* */
    }
  }

  const fetchStats = async (opts?: { background?: boolean }) => {
    const background = opts?.background ?? hydrated.value
    if (!background) isLoading.value = true
    error.value = ''
    try {
      const res = await useApi('/admin/dashboard')
      if (res.success) {
        data.value = res.data
        hydrated.value = true
        saveCached()
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Statistika yuklanmadi'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /** UI — kesh yoki API dan ma'lumot bor */
  const isReady = computed(() => hydrated.value && data.value !== null)

  const monthIncome = computed(() => data.value?.monthIncome ?? emptyIncome())

  return {
    data,
    isLoading,
    error,
    hydrated,
    isReady,
    monthIncome,
    loadCached,
    fetchStats,
  }
})
