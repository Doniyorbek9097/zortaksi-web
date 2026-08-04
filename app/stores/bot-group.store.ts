import { defineStore } from 'pinia'

export interface BotGroupRow {
  id: string
  username: string
  keywords: string[]
  active: boolean
  hasBotToken?: boolean
  tokenMasked?: string
  botUsername?: string
  botRunning?: boolean
  botLastError?: string
  launching?: boolean
  telegramChatId?: string
  title?: string
  telegramTitle?: string
  botIsAdmin?: boolean
  lastPostAt?: string
  lastError?: string
}

export type BotGroupPayload = {
  username: string
  keywords: string
  botToken?: string
  active?: boolean
  title?: string
}

const toRow = (g: any): BotGroupRow => ({
  id: String(g.id || g._id),
  username: g.username,
  keywords: Array.isArray(g.keywords) ? g.keywords : [],
  active: !!g.active,
  hasBotToken: !!g.hasBotToken,
  tokenMasked: g.tokenMasked || '',
  botUsername: g.botUsername,
  botRunning: !!g.botRunning,
  botLastError: g.botLastError,
  launching: !!g.launching,
  telegramChatId: g.telegramChatId,
  title: g.title,
  telegramTitle: g.telegramTitle,
  botIsAdmin: g.botIsAdmin,
  lastPostAt: g.lastPostAt,
  lastError: g.lastError,
})

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

  const pollGroupRunning = async (id: string, attempts = 8) => {
    for (let i = 0; i < attempts; i++) {
      await wait(2000)
      try {
        await fetchGroups()
        const row = groups.value.find(g => g.id === id)
        if (row?.botRunning) return
        if (row?.botLastError && !row?.launching) return
      } catch { /* ignore */ }
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
          botToken: payload.botToken?.trim(),
          active: payload.active !== false,
          title: payload.title?.trim() || undefined,
        },
        timeout: 45_000,
      })
      if (response.success) {
        const row = toRow(response.data)
        groups.value.unshift(row)
        if (row.launching) void pollGroupRunning(row.id)
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
      const body: Record<string, unknown> = {
        username: payload.username.trim(),
        keywords: payload.keywords.trim(),
        active: payload.active !== false,
        title: payload.title?.trim() || '',
      }
      if (payload.botToken?.trim()) body.botToken = payload.botToken.trim()

      const response = await useApi(`/bot-groups/${id}`, {
        method: 'PUT',
        body,
        timeout: 45_000,
      })
      if (response.success) {
        const row = toRow(response.data)
        const idx = groups.value.findIndex(g => g.id === id)
        if (idx !== -1) groups.value[idx] = row
        if (row.launching) void pollGroupRunning(row.id)
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
      const response = await useApi(`/bot-groups/${id}/refresh`, {
        method: 'POST',
        timeout: 45_000,
      })
      if (response.success) {
        const row = toRow(response.data)
        const idx = groups.value.findIndex(g => g.id === id)
        if (idx !== -1) groups.value[idx] = row
        if (row.launching) void pollGroupRunning(row.id)
      }
      return response
    } catch (error) {
      console.error('RefreshBotGroup error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const appendKeyword = async (id: string, keyword: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/bot-groups/${id}/keywords`, {
        method: 'POST',
        body: { keyword: keyword.trim() },
      })
      if (response.success) {
        const row = toRow(response.data)
        const idx = groups.value.findIndex(g => g.id === id)
        if (idx !== -1) groups.value[idx] = row
      }
      return response
    } catch (error) {
      console.error('AppendBotKeyword error:', error)
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
    appendKeyword,
  }
})
