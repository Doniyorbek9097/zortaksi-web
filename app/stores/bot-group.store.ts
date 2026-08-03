import { defineStore } from 'pinia'

export interface BotGroupRow {
  id: string
  username: string
  keywords: string[]
  active: boolean
  telegramChatId?: string
  title?: string
  botIsAdmin?: boolean
  lastPostAt?: string
  lastError?: string
}

export type BotGroupPayload = {
  username: string
  keywords: string
  active?: boolean
}

const toRow = (g: any): BotGroupRow => ({
  id: String(g.id || g._id),
  username: g.username,
  keywords: Array.isArray(g.keywords) ? g.keywords : [],
  active: !!g.active,
  telegramChatId: g.telegramChatId,
  title: g.title,
  botIsAdmin: g.botIsAdmin,
  lastPostAt: g.lastPostAt,
  lastError: g.lastError,
})

export const useBotGroupStore = defineStore('botGroup', () => {
  const groups = ref<BotGroupRow[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)

  const fetchGroups = async () => {
    try {
      isLoading.value = true
      const response = await useApi('/bot-groups')
      if (response.success) {
        groups.value = (response.data.groups ?? []).map(toRow)
      }
      return response
    } catch (error) {
      console.error('FetchBotGroups error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const createGroup = async (payload: BotGroupPayload) => {
    try {
      isSaving.value = true
      const response = await useApi('/bot-groups', {
        method: 'POST',
        body: {
          username: payload.username.trim(),
          keywords: payload.keywords.trim(),
          active: payload.active !== false,
        },
      })
      if (response.success) {
        groups.value.unshift(toRow(response.data))
      }
      return response
    } catch (error) {
      console.error('CreateBotGroup error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const updateGroup = async (id: string, payload: BotGroupPayload) => {
    try {
      isSaving.value = true
      const response = await useApi(`/bot-groups/${id}`, {
        method: 'PUT',
        body: {
          username: payload.username.trim(),
          keywords: payload.keywords.trim(),
          active: payload.active !== false,
        },
      })
      if (response.success) {
        const row = toRow(response.data)
        const idx = groups.value.findIndex(g => g.id === id)
        if (idx !== -1) groups.value[idx] = row
      }
      return response
    } catch (error) {
      console.error('UpdateBotGroup error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/bot-groups/${id}`, { method: 'DELETE' })
      if (response.success) {
        groups.value = groups.value.filter(g => g.id !== id)
      }
      return response
    } catch (error) {
      console.error('DeleteBotGroup error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const refreshGroup = async (id: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/bot-groups/${id}/refresh`, { method: 'POST' })
      if (response.success) {
        const row = toRow(response.data)
        const idx = groups.value.findIndex(g => g.id === id)
        if (idx !== -1) groups.value[idx] = row
      }
      return response
    } catch (error) {
      console.error('RefreshBotGroup error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return {
    groups,
    isLoading,
    isSaving,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    refreshGroup,
  }
})
