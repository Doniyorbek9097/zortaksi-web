import { defineStore } from 'pinia'

export type DriverFilter = 'all' | 'expiring' | 'debt'

export interface DriverRow {
  id: string
  name: string
  phone: string
  username?: string
  avatar?: string
  active: boolean
  listenGroups?: boolean
  balance: number
  tariffName?: string
  expireAt?: string
  daysLeft?: number
  debt?: boolean
  tariffExpireAt?: string | Date | null
  startedAt?: string | Date | null
  createdAt?: string | Date | null
  registeredAt?: string
  groupInviteCount?: number
  appInviteCount?: number
  inviteGroups?: Array<{ id: string; title: string; count: number }>
  tariff?: {
    name?: string
    info?: string
    price?: number
    expireDays?: number
  } | null
  role?: string
  allowedListenerUserIds?: string[]
}

export const useDriverStore = defineStore('driver', () => {
  const drivers = ref<DriverRow[]>([])
  const counts = ref({ all: 0, expiring: 0, debt: 0 })
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSaving = ref(false)
  const page = ref(1)
  const totalPages = ref(1)
  const total = ref(0)

  const hasMore = computed(() => page.value < totalPages.value)

  const fetchDrivers = async (
    params: {
      page?: number
      limit?: number
      search?: string
      filter?: DriverFilter
    } = {},
    opts: { append?: boolean } = {}
  ) => {
    try {
      if (opts.append) isLoadingMore.value = true
      else isLoading.value = true

      const response = await useApi('/drivers', {
        method: 'GET',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search || undefined,
          filter: params.filter || 'all',
        },
      })
      if (response.success) {
        const list: DriverRow[] = response.data.drivers ?? []
        if (opts.append) {
          const seen = new Set(drivers.value.map(d => d.id))
          drivers.value = [...drivers.value, ...list.filter(d => !seen.has(d.id))]
        } else {
          drivers.value = list
        }
        counts.value = response.data.counts ?? { all: 0, expiring: 0, debt: 0 }
        page.value = response.data.pagination?.page ?? params.page ?? 1
        totalPages.value = response.data.pagination?.totalPages ?? 1
        total.value = response.data.pagination?.total ?? drivers.value.length
      }
      return response
    } catch (error) {
      console.error('FetchDrivers error:', error)
      throw error
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  /** Keyingi sahifani yuklab, mavjud ro'yxatga qo'shadi (infinite scroll) */
  const loadMore = async (params: {
    limit?: number
    search?: string
    filter?: DriverFilter
  } = {}) => {
    if (isLoading.value || isLoadingMore.value || !hasMore.value) return
    return fetchDrivers({ ...params, page: page.value + 1 }, { append: true })
  }

  const patchLocal = (row: DriverRow) => {
    const idx = drivers.value.findIndex(d => d.id === row.id)
    if (idx !== -1) drivers.value[idx] = row
  }

  const setActive = async (userId: string, active: boolean) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/active`, {
        method: 'PATCH',
        body: { active },
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('SetDriverActive error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const setListenGroups = async (userId: string, listenGroups: boolean) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/listen-groups`, {
        method: 'PATCH',
        body: { listenGroups },
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('SetListenGroups error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const setBalance = async (userId: string, balance: number) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/balance`, {
        method: 'PATCH',
        body: { balance },
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('SetDriverBalance error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const adjustBalance = async (userId: string, amount: number) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/balance`, {
        method: 'PATCH',
        body: { amount },
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('AdjustDriverBalance error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const assignTariff = async (
    userId: string,
    tariffId: string,
    opts: { deductFromBalance?: boolean } = {}
  ) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/tariff`, {
        method: 'POST',
        body: {
          tariffId,
          deductFromBalance: Boolean(opts.deductFromBalance),
        },
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('AssignDriverTariff error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const applyCustomLimit = async (
    userId: string,
    opts: { days: number; hours: number }
  ) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${userId}/custom-limit`, {
        method: 'POST',
        body: opts,
      })
      if (response.success) patchLocal(response.data)
      return response
    } catch (error) {
      console.error('ApplyCustomLimit error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const sendMessage = async (userIds: string[], text: string) => {
    try {
      isSaving.value = true
      const response = await useApi('/drivers/message', {
        method: 'POST',
        body: { userIds, text },
      })
      return response
    } catch (error) {
      console.error('SendDriverMessage error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const bulkAction = async (ids: string[], action: 'block' | 'unblock') => {
    try {
      isSaving.value = true
      const response = await useApi('/drivers/bulk', {
        method: 'POST',
        body: { ids, action },
      })
      return response
    } catch (error) {
      console.error('BulkDrivers error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const deleteDriver = async (userId: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/drivers/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })
      if (response.success) {
        drivers.value = drivers.value.filter((d) => d.id !== userId)
        total.value = Math.max(0, total.value - 1)
      }
      return response
    } catch (error) {
      console.error('DeleteDriver error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return {
    drivers,
    counts,
    isLoading,
    isLoadingMore,
    isSaving,
    page,
    totalPages,
    total,
    hasMore,
    fetchDrivers,
    loadMore,
    setActive,
    setListenGroups,
    setBalance,
    adjustBalance,
    assignTariff,
    applyCustomLimit,
    sendMessage,
    bulkAction,
    deleteDriver,
  }
})
