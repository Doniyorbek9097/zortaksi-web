import type { IChatMessage } from '~/types'

export interface CachedChatMessages {
  messages: IChatMessage[]
  page: number
  totalPages: number
}

const cache = new Map<string, CachedChatMessages>()

/** Chat almashtirishdan oldin xabarlarni xotirada saqlash */
export function saveMessagesCache(chatId: string, data: CachedChatMessages) {
  if (!chatId || !data.messages.length) return
  cache.set(chatId, {
    messages: data.messages.map((m) => ({ ...m })),
    page: data.page,
    totalPages: data.totalPages,
  })
}

/** Oldin ochilgan chat xabarlarini darhol tiklash */
export function restoreMessagesCache(chatId: string): CachedChatMessages | null {
  const hit = cache.get(chatId)
  if (!hit) return null
  return {
    messages: hit.messages.map((m) => ({ ...m })),
    page: hit.page,
    totalPages: hit.totalPages,
  }
}

export function clearMessagesCache(chatId?: string) {
  if (chatId) cache.delete(chatId)
  else cache.clear()
}
