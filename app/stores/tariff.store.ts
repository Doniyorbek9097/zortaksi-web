import { defineStore } from 'pinia'

export interface TariffRow {
  id: string
  name: string
  info?: string
  icon?: string
  badge?: string
  price: number
  expireDays: number
}

export type TariffPayload = {
  name: string
  info?: string
  price: number
  expireDays: number
  icon?: string
  badge?: string
}

const toRow = (t: any): TariffRow => ({
  id: String(t.id || t._id),
  name: t.name,
  info: t.info,
  icon: t.icon,
  badge: t.badge,
  price: Number(t.price),
  expireDays: Number(t.expireDays),
})

export const useTariffStore = defineStore('tariff', () => {
  const tariffs = ref<TariffRow[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)

  const fetchTariffs = async () => {
    try {
      isLoading.value = true
      const response = await useApi('/tariffs')
      if (response.success) {
        tariffs.value = (response.data.tariffs ?? []).map(toRow)
      }
      return response
    } catch (error) {
      console.error('FetchTariffs error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createTariff = async (payload: TariffPayload) => {
    try {
      isSaving.value = true
      const response = await useApi('/tariffs', { method: 'POST', body: payload })
      if (response.success) {
        tariffs.value.unshift(toRow(response.data))
      }
      return response
    } catch (error) {
      console.error('CreateTariff error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const updateTariff = async (id: string, payload: TariffPayload) => {
    try {
      isSaving.value = true
      const response = await useApi(`/tariffs/${id}`, { method: 'PUT', body: payload })
      if (response.success) {
        const row = toRow(response.data)
        const idx = tariffs.value.findIndex(t => t.id === id)
        if (idx !== -1) tariffs.value[idx] = row
      }
      return response
    } catch (error) {
      console.error('UpdateTariff error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const deleteTariff = async (id: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/tariffs/${id}`, { method: 'DELETE' })
      if (response.success) {
        tariffs.value = tariffs.value.filter(t => t.id !== id)
      }
      return response
    } catch (error) {
      console.error('DeleteTariff error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return {
    tariffs,
    isLoading,
    isSaving,
    fetchTariffs,
    createTariff,
    updateTariff,
    deleteTariff,
  }
})
