import { defineStore } from 'pinia'

export interface BotGroupRow {
  id: string
  regionSlug?: string
  kind?: 'public' | 'private'
  username: string
  inviteLink?: string
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

export interface BotRegionCard {
  slug: string
  title: string
  keywords: string[]
  active: boolean
  public?: BotGroupRow
  private?: BotGroupRow
}

export type BotRegionSidePayload = {
  username?: string
  inviteLink?: string
}

export type BotRegionPayload = {
  regionSlug: string
  title?: string
  keywords: string
  active?: boolean
  /** Bitta bot — public va private guruhlar uchun */
  botToken?: string
  public: BotRegionSidePayload
  private: BotRegionSidePayload
}

const toRow = (g: any): BotGroupRow => ({
  id: String(g.id || g._id),
  regionSlug: g.regionSlug || '',
  kind: g.kind || 'public',
  username: g.username,
  inviteLink: g.inviteLink || '',
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

function buildRegionCards(rows: BotGroupRow[]): BotRegionCard[] {
  const map = new Map<string, BotRegionCard>()
  for (const row of rows) {
    const slug = String(row.regionSlug || '').trim() || row.username
    if (!map.has(slug)) {
      map.set(slug, {
        slug,
        title: row.title || row.telegramTitle || slug,
        keywords: row.keywords,
        active: row.active,
      })
    }
    const card = map.get(slug)!
    if (row.kind === 'private') card.private = row
    else card.public = row
    if (row.title) card.title = row.title
    if (row.keywords?.length) card.keywords = row.keywords
    card.active = card.active || row.active
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'uz'))
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const useBotGroupStore = defineStore('botGroup', () => {
  const groups = ref<BotGroupRow[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)

  const regionCards = computed(() => buildRegionCards(groups.value))

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

  const createRegion = async (payload: BotRegionPayload) => {
    try {
      isSaving.value = true
      const response = await useApi('/bot-groups/region', {
        method: 'POST',
        body: {
          regionSlug: payload.regionSlug.trim(),
          title: payload.title?.trim() || undefined,
          keywords: payload.keywords.trim(),
          active: payload.active !== false,
          botToken: payload.botToken?.trim(),
          public: {
            username: payload.public.username?.trim(),
          },
          private: {
            inviteLink: payload.private.inviteLink?.trim(),
          },
        },
        timeout: 45_000,
      })
      if (response.success) await fetchGroups()
      return response
    } catch (error) {
      console.error('CreateBotRegion error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const updateRegion = async (slug: string, payload: Partial<BotRegionPayload>) => {
    try {
      isSaving.value = true
      const body: Record<string, unknown> = {}
      if (payload.title !== undefined) body.title = payload.title?.trim() || ''
      if (payload.keywords !== undefined) body.keywords = payload.keywords.trim()
      if (payload.active !== undefined) body.active = !!payload.active
      if (payload.botToken?.trim()) body.botToken = payload.botToken.trim()
      if (payload.public) {
        body.public = {
          username: payload.public.username?.trim(),
        }
      }
      if (payload.private) {
        body.private = {
          inviteLink: payload.private.inviteLink?.trim(),
        }
      }
      const response = await useApi(`/bot-groups/region/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        body,
        timeout: 45_000,
      })
      if (response.success) await fetchGroups()
      return response
    } catch (error) {
      console.error('UpdateBotRegion error:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  const deleteRegion = async (slug: string) => {
    try {
      isSaving.value = true
      const response = await useApi(`/bot-groups/region/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      if (response.success) {
        groups.value = groups.value.filter(g => g.regionSlug !== slug)
      }
      return response
    } catch (error) {
      console.error('DeleteBotRegion error:', error)
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

  return {
    groups,
    regionCards,
    isLoading,
    isSaving,
    fetchGroups,
    createRegion,
    updateRegion,
    deleteRegion,
    refreshGroup,
  }
})
