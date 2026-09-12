import { defineStore } from 'pinia'

export type AdminDriverPostOwner = {
  userId: string
  name: string
  phone?: string
  username?: string
  balance?: number
  avatar?: string
}

export type AdminDriverPostCampaign = {
  id: string
  userId: string
  owner: AdminDriverPostOwner
  name: string
  mode: 'mine' | 'ads'
  groupIds: string[]
  groupCount: number
  text: string
  textPreview: string
  intervalSec: number
  intervalMin: number
  active: boolean
  sendsPerDay: number
  activeSince?: string
  nextRunAt?: string
  lastRunAt?: string
  lastSent: number
  lastFailed: number
  lastCharged: number
  lastError?: string
  stoppedAt?: string
  createdAt?: string
  updatedAt?: string
}

export type AdminDriverPostDriverStat = {
  userId: string
  campaigns: number
  activeCampaigns: number
  totalGroups: number
  sendsPerDay: number
  totalLastSent: number
  totalLastCharged: number
  totalLastFailed: number
  owner: AdminDriverPostOwner
}

export type AdminDriverPostStats = {
  totalCampaigns: number
  activeCampaigns: number
  pausedCampaigns: number
  activeGroupSlots: number
  estimatedSendsPerDay: number
  uniqueDrivers: number
  topDrivers: AdminDriverPostDriverStat[]
}

export const useAdminDriverPostsStore = defineStore('adminDriverPosts', () => {
  const stats = ref<AdminDriverPostStats | null>(null)
  const items = ref<AdminDriverPostCampaign[]>([])
  const total = ref(0)
  const page = ref(1)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSaving = ref(false)
  const error = ref('')

  const fetchStats = async () => {
    const res = await useApi<{ success: boolean; data: AdminDriverPostStats }>(
      '/admin/driver-post-campaigns/stats',
    )
    if (res?.success && res.data) {
      stats.value = res.data
    }
    return stats.value
  }

  const fetchCampaigns = async (opts?: {
    page?: number
    active?: boolean | null
    q?: string
    userId?: string
    append?: boolean
  }) => {
    const nextPage = opts?.page ?? 1
    const append = opts?.append === true
    if (append) isLoadingMore.value = true
    else isLoading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams()
      params.set('page', String(nextPage))
      params.set('limit', '20')
      if (opts?.active === true) params.set('active', 'true')
      if (opts?.active === false) params.set('active', 'false')
      if (opts?.q) params.set('q', opts.q)
      if (opts?.userId) params.set('userId', opts.userId)

      const res = await useApi<{
        success: boolean
        data: {
          items: AdminDriverPostCampaign[]
          total: number
          page: number
          hasMore: boolean
        }
      }>(`/admin/driver-post-campaigns?${params.toString()}`)

      if (res?.success && res.data) {
        page.value = res.data.page
        total.value = res.data.total
        hasMore.value = res.data.hasMore
        items.value = append ? [...items.value, ...res.data.items] : res.data.items
      }
    } catch (e: any) {
      error.value = e?.message || 'Yuklanmadi'
      throw e
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  const patchItem = (data: AdminDriverPostCampaign) => {
    const idx = items.value.findIndex((c) => c.id === data.id)
    if (idx >= 0) items.value[idx] = data
  }

  const removeItem = (id: string) => {
    items.value = items.value.filter((c) => c.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  const stopCampaign = async (id: string) => {
    isSaving.value = true
    error.value = ''
    try {
      const res = await useApi<{ success: boolean; data: AdminDriverPostCampaign }>(
        `/admin/driver-post-campaigns/${id}/stop`,
        { method: 'POST' },
      )
      if (res?.success && res.data) patchItem(res.data)
      await fetchStats()
      return res?.data
    } catch (e: any) {
      error.value = e?.message || 'To\'xtatib bo\'lmadi'
      throw e
    } finally {
      isSaving.value = false
    }
  }

  const startCampaign = async (id: string) => {
    isSaving.value = true
    error.value = ''
    try {
      const res = await useApi<{ success: boolean; data: AdminDriverPostCampaign }>(
        `/admin/driver-post-campaigns/${id}/start`,
        { method: 'POST' },
      )
      if (res?.success && res.data) patchItem(res.data)
      await fetchStats()
      return res?.data
    } catch (e: any) {
      error.value = e?.message || 'Boshlab bo\'lmadi'
      throw e
    } finally {
      isSaving.value = false
    }
  }

  const updateCampaign = async (
    id: string,
    payload: { name?: string; text?: string; intervalMin?: number },
  ) => {
    isSaving.value = true
    error.value = ''
    try {
      const res = await useApi<{ success: boolean; data: AdminDriverPostCampaign }>(
        `/admin/driver-post-campaigns/${id}`,
        { method: 'PATCH', body: payload },
      )
      if (res?.success && res.data) patchItem(res.data)
      await fetchStats()
      return res?.data
    } catch (e: any) {
      error.value = e?.message || 'Yangilab bo\'lmadi'
      throw e
    } finally {
      isSaving.value = false
    }
  }

  const deleteCampaign = async (id: string) => {
    isSaving.value = true
    error.value = ''
    try {
      await useApi(`/admin/driver-post-campaigns/${id}`, { method: 'DELETE' })
      removeItem(id)
      await fetchStats()
    } catch (e: any) {
      error.value = e?.message || 'O\'chirib bo\'lmadi'
      throw e
    } finally {
      isSaving.value = false
    }
  }

  const resetList = () => {
    items.value = []
    page.value = 1
    hasMore.value = false
    total.value = 0
  }

  return {
    stats,
    items,
    total,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    isSaving,
    error,
    fetchStats,
    fetchCampaigns,
    stopCampaign,
    startCampaign,
    updateCampaign,
    deleteCampaign,
    resetList,
  }
})
