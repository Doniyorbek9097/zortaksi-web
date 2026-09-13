import type { IChat } from '~/types'
import { useChatStore } from '~/stores/chat.store'
import { compactQuery } from '~/utils/navigationQuery'

/** Admin ↔ haydovchi support chat — chats ro'yxatidan */
export function findSupportChatByDriverId(
  chats: IChat[],
  driverUserId: string,
): IChat | undefined {
  const id = String(driverUserId || '').trim()
  if (!id) return undefined
  return chats.find(
    (c) => c.kind === 'support' && String(c.peer?.userId || '') === id,
  )
}

function adoptSupportChat(chat: IChat, driverUserId: string) {
  const chatStore = useChatStore()
  const id = String(chat._id || '')
  if (!id) return

  chatStore.primeFromChat(chat)
  const idx = chatStore.chats.findIndex((c) => c._id === id)
  if (idx >= 0) {
    chatStore.chats[idx] = { ...chatStore.chats[idx], ...chat }
  } else {
    chatStore.chats.unshift(chat)
  }

  const route = useRoute()
  const onOpenRoute =
    import.meta.client &&
    route.path === '/driver/chat/open' &&
    String(route.query.open || '') === 'support' &&
    String(route.query.userId || '') === driverUserId

  const isCurrentSupport =
    chatStore.currentChat?.kind === 'support' &&
    String(chatStore.currentChat?.peer?.userId || '') === driverUserId

  if (onOpenRoute || isCurrentSupport) {
    chatStore.currentChat = { ...chatStore.currentChat, ...chat } as IChat
    chatStore.primeFromChat(chatStore.currentChat)
    chatStore.isLoadingMessages = false
    chatStore.connectionStatus = 'ready'
  }

  chatStore.hydrateMessagesFromCache(id)
  void chatStore.connect(id, { silent: true })
  void chatStore.fetchMessages(id)
}

/**
 * Admin support chat — darhol sahifaga o'tish (API fon / chat/open da).
 */
export function openSupportChatInstant(opts: {
  driverUserId: string
  name?: string
  avatar?: string
}) {
  const driverUserId = String(opts.driverUserId || '').trim()
  if (!driverUserId) return

  const chatStore = useChatStore()
  const name = String(opts.name || '').trim() || 'Haydovchi'
  const navQuery = compactQuery({
    open: 'support',
    userId: driverUserId,
    name,
    support: '1',
  })

  const existing = findSupportChatByDriverId(chatStore.chats, driverUserId)
  if (existing?._id) {
    const chatId = String(existing._id)
    chatStore.primeFromChat(existing)
    chatStore.hydrateMessagesFromCache(chatId)
    chatStore.isLoadingMessages = false
    void chatStore.connect(chatId, { silent: true })
    void chatStore.fetchMessages(chatId)
    return navigateTo({
      path: `/driver/chat/${chatId}`,
      query: compactQuery({ name, support: '1' }),
    })
  }

  chatStore.currentChat = {
    kind: 'support',
    inAppOnly: true,
    peer: {
      userId: driverUserId,
      firstName: name,
      ...(opts.avatar ? { avatar: opts.avatar } : {}),
    },
  } as IChat
  chatStore.primeFromChat(chatStore.currentChat)
  chatStore.isLoadingMessages = false
  chatStore.connectionStatus = 'ready'

  void useApi('/chats/support', {
    method: 'POST',
    body: { driverUserId },
  }).then((res: { success?: boolean; data?: IChat }) => {
    if (res?.success && res.data?._id) {
      adoptSupportChat(res.data, driverUserId)
    }
  })

  return navigateTo({
    path: '/driver/chat/open',
    query: navQuery,
  })
}

/** Haydovchining o'z support chatini topish */
export function findDriverSupportChat(chats: IChat[]): IChat | undefined {
  return chats.find((c) => c.kind === 'support')
}

function adoptDriverSupportChat(chat: IChat) {
  const chatStore = useChatStore()
  const id = String(chat._id || '')
  if (!id) return

  chatStore.primeFromChat(chat)
  const idx = chatStore.chats.findIndex((c) => c._id === id)
  if (idx >= 0) {
    chatStore.chats[idx] = { ...chatStore.chats[idx], ...chat }
  } else {
    chatStore.chats.unshift(chat)
  }

  const route = useRoute()
  const onOpenRoute =
    import.meta.client &&
    route.path === '/driver/chat/open' &&
    String(route.query.open || '') === 'support'

  if (onOpenRoute || chatStore.currentChat?.kind === 'support') {
    chatStore.currentChat = { ...chatStore.currentChat, ...chat } as IChat
    chatStore.primeFromChat(chatStore.currentChat)
    chatStore.isLoadingMessages = false
    chatStore.connectionStatus = 'ready'
  }

  chatStore.hydrateMessagesFromCache(id)
  void chatStore.connect(id, { silent: true })
  void chatStore.fetchMessages(id)
}

/**
 * Haydovchi — admin yordam chatiga darhol o'tish.
 */
export function openDriverSupportChatInstant() {
  const chatStore = useChatStore()
  const name = 'Admin yordam'
  const navQuery = compactQuery({
    open: 'support',
    name,
    support: '1',
  })

  const existing = findDriverSupportChat(chatStore.chats)
  if (existing?._id) {
    const chatId = String(existing._id)
    chatStore.primeFromChat(existing)
    chatStore.hydrateMessagesFromCache(chatId)
    chatStore.isLoadingMessages = false
    void chatStore.connect(chatId, { silent: true })
    void chatStore.fetchMessages(chatId)
    return navigateTo({
      path: `/driver/chat/${chatId}`,
      query: compactQuery({ name, support: '1' }),
    })
  }

  chatStore.currentChat = {
    kind: 'support',
    inAppOnly: true,
    peer: { firstName: 'Admin', lastName: 'yordam' },
  } as IChat
  chatStore.primeFromChat(chatStore.currentChat)
  chatStore.isLoadingMessages = false
  chatStore.connectionStatus = 'ready'

  void useApi('/chats/support', { method: 'POST', body: {} }).then(
    (res: { success?: boolean; data?: IChat }) => {
      if (res?.success && res.data?._id) {
        adoptDriverSupportChat(res.data)
      }
    },
  )

  return navigateTo({
    path: '/driver/chat/open',
    query: navQuery,
  })
}
