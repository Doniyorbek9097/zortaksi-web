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
  profit: number
}

export interface AdminDashboardData {
  monthIncome: IncomeBlock
  keyStats: {
    totalDrivers: number
    newDrivers: number
    visitsToday: number
    yearIncome: number
    activeDrivers: number
  }
  incomeDetails: DataRow[]
  tariffSplit: DataRow[]
  chart: ChartMonth[]
}

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  const data = ref<AdminDashboardData | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  const fetchStats = async () => {
    try {
      isLoading.value = true
      error.value = ''
      const res = await useApi('/admin/dashboard')
      if (res.success) data.value = res.data
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Statistika yuklanmadi'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, fetchStats }
})
