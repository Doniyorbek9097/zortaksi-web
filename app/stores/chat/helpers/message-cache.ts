import type { IChatMessage } from '~/types'

export interface CachedChatMessages {
  messages: IChatMessage[]
  page: number
  totalPages: number
}

const MAX_CACHED_CHATS = 4
const MAX_MESSAGES_PER_CHAT = 80

const cache = new Map<string, CachedChatMessages>()

function trimMessages(messages: IChatMessage[]): IChatMessage[] {
  if (messages.length <= MAX_MESSAGES_PER_CHAT) return messages
  return messages.slice(messages.length - MAX_MESSAGES_PER_CHAT)
}

function evictOldestIfNeeded() {
  while (cache.size > MAX_CACHED_CHATS) {
    const first = cache.keys().next().value
    if (first == null) break
    cache.delete(first)
  }
}

/** Chat almashtirishdan oldin xabarlarni xotirada saqlash (LRU) */
export function saveMessagesCache(chatId: string, data: CachedChatMessages) {
  if (!chatId || !data.messages.length) return
  if (cache.has(chatId)) cache.delete(chatId)
  cache.set(chatId, {
    messages: trimMessages(data.messages).map((m) => ({ ...m })),
    page: data.page,
    totalPages: data.totalPages,
  })
  evictOldestIfNeeded()
}

/** Oldin ochilgan chat xabarlarini darhol tiklash */
export function restoreMessagesCache(chatId: string): CachedChatMessages | null {
  const hit = cache.get(chatId)
  if (!hit) return null
  // LRU — oxiriga ko'chirish
  cache.delete(chatId)
  cache.set(chatId, hit)
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
