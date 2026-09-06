import type { IInterestedUser, IOrder, IChat } from '~/types'
import type { useChatStore } from '~/stores/chat.store'
import type { useOrderStore } from '~/stores/order.store'
import { useAuthStore } from '~/stores/auth.store'
import { orderQuickLinkQuery, buildChatStubFromOrder, buildChatStubFromOrderQuery, mergeOrderChatContext, primeOrderContext } from '~/utils/orderChatQuery'
import { compactQuery } from '~/utils/navigationQuery'

/**
 * Chat / qiziqish / agent amallari.
 * Xabar tugmasi — darhol chat sahifasiga o'tadi; API ochilish sahifasida.
 */
export function useOrdersChatActions(options: {
  orderStore: ReturnType<typeof useOrderStore>
  chatStore: ReturnType<typeof useChatStore>
  showError: (msg: string) => void
  /** Order → chat oldidan scroll saqlash */
  beforeNavigate?: () => void
}) {
  const { orderStore, chatStore, beforeNavigate } = options
  const route = useRoute()

  const markOrderInterest = (order: IOrder) => {
    if (!order._id) return
    void orderStore.markInterest(order._id)
  }

  const findChatByOrderPeer = (orderId: string, peerUserId?: string) => {
    if (!peerUserId) return undefined
    return chatStore.chats.find(
      (c) =>
        String(c.orderId || '') === String(orderId) &&
        String(c.peer?.userId || '') === String(peerUserId),
    )
  }

  /** orderId bo'yicha — peer id ro'yxatda yo'q bo'lsa ham */
  const findChatForOrder = (order: IOrder) => {
    const orderId = String(order._id || '')
    if (!orderId) return undefined
    const byPeer = findChatByOrderPeer(orderId, order.sender?.userId)
    if (byPeer) return byPeer
    return chatStore.chats.find((c) => String(c.orderId || '') === orderId)
  }

  const findDirectChatWithUser = (peerUserId: string, orderId?: string) => {
    return chatStore.chats.find((c) => {
      if (c.kind !== 'direct') return false
      if (String(c.peer?.userId || '') !== String(peerUserId)) return false
      if (orderId && String(c.orderId || '') !== String(orderId)) return false
      return true
    })
  }

  const interestedUserName = (u: IInterestedUser) => {
    if (u.name) return u.name
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return full || u.username || 'Haydovchi'
  }

  const rememberOrderAnchor = (order: IOrder) => {
    if (order._id) orderStore.setOrdersListAnchor(String(order._id))
  }

  /** Order chat — darhol UI (navigatsiyadan oldin) */
  const primeOrderOpenUi = (order: IOrder) => {
    primeOrderContext(order)
    const stub = buildChatStubFromOrder(order)
    if (!stub) return
    const existing = findChatForOrder(order)
    chatStore.currentChat = mergeOrderChatContext(existing, stub) as IChat
    chatStore.primeFromChat(chatStore.currentChat)
    chatStore.isLoadingMessages = false
    if (chatStore.connectionStatus === 'idle') {
      chatStore.connectionStatus = 'connecting'
    }
  }

  /** Yangi chat — /chat/open (darhol UI, API sahifada) */
  const goOpenChat = (query: Record<string, string>, order?: IOrder) => {
    if (order) rememberOrderAnchor(order)
    beforeNavigate?.()
    return navigateTo({
      path: '/driver/chat/open',
      query: compactQuery(query),
    })
  }

  /** Mavjud chat — bir marta navigatsiya, cache + ulanish oldindan */
  const openExistingChat = (chat: IChat, query: Record<string, string>, order?: IOrder) => {
    const chatId = String(chat._id || '').trim()
    if (!chatId) return goOpenChat(query, order)

    if (order) rememberOrderAnchor(order)
    beforeNavigate?.()
    chatStore.primeFromChat(chat)
    chatStore.hydrateMessagesFromCache(chatId)
    chatStore.isLoadingMessages = false
    void chatStore.connect(chatId, { silent: true })
    void chatStore.fetchMessages(chatId)

    return navigateTo({
      path: `/driver/chat/${chatId}`,
      query: compactQuery(query),
    })
  }

  const prefetchInflight = new Set<string>()

  /** Tugma bosilishidan oldin — warm + chat/connect (mobil uchun) */
  const prefetchOrderChat = (order: IOrder) => {
    if (!order._id || !import.meta.client) return
    const orderId = String(order._id)
    if (prefetchInflight.has(orderId)) return

    orderStore.warmOrderPeer(orderId)

    const peerId = order.sender?.userId
    const existing = findChatByOrderPeer(orderId, peerId)
    if (existing?._id) {
      const chatId = String(existing._id)
      chatStore.primeFromChat(existing)
      void chatStore.connect(chatId, { silent: true })
      return
    }

    prefetchInflight.add(orderId)
    void chatStore.startChatFromOrder(orderId).then((res: { success?: boolean; data?: IChat }) => {
      prefetchInflight.delete(orderId)
      if (res?.success && res.data?._id) {
        adoptStartedChat(res.data)
      }
    })
  }

  /** Serverdan kelgan chatni store ga yozish + connect */
  const adoptStartedChat = (chat: IChat) => {
    if (!chat?._id) return
    const id = String(chat._id)
    chatStore.primeFromChat(chat)
    const idx = chatStore.chats.findIndex((c) => c._id === id)
    if (idx >= 0) {
      chatStore.chats[idx] = { ...chatStore.chats[idx], ...chat }
    } else {
      chatStore.chats.unshift(chat)
    }

    const orderId = String(chat.orderId || '')
    const onOpenRoute =
      import.meta.client &&
      route.path === '/driver/chat/open' &&
      orderId &&
      String(route.query.orderId || '') === orderId

    const stub = onOpenRoute
      ? buildChatStubFromOrderQuery(route.query as Record<string, unknown>)
      : null

    if (onOpenRoute || String(chatStore.currentChat?.orderId || '') === orderId) {
      chatStore.currentChat = mergeOrderChatContext(
        stub,
        chatStore.currentChat,
        chat,
      ) as IChat
      chatStore.primeFromChat(chatStore.currentChat)
      chatStore.isLoadingMessages = false
    }

    chatStore.hydrateMessagesFromCache(id)
    void chatStore.connect(id, { silent: true })
    void chatStore.fetchMessages(id)
  }

  const onMessage = (order: IOrder) => {
    if (!order._id) return
    markOrderInterest(order)

    const orderId = String(order._id)
    const linkQ = orderQuickLinkQuery(order)
    const query = { open: 'order', ...linkQ }

    prefetchOrderChat(order)

    const existing = findChatForOrder(order)
    if (existing?._id) {
      return openExistingChat(existing, query, order)
    }

    primeOrderOpenUi(order)

    void chatStore.startChatFromOrder(orderId).then((res: { success?: boolean; data?: IChat }) => {
      if (res?.success && res.data?._id) {
        adoptStartedChat(res.data)
      }
    })

    return goOpenChat(query, order)
  }

  const onCall = (order: IOrder) => {
    markOrderInterest(order)
  }

  const showInterestDialog = ref(false)
  const interestLoading = ref(false)
  const interestUsers = ref<IInterestedUser[]>([])
  const interestCount = ref(0)
  const interestOrderId = ref<string | null>(null)
  const interestOrder = ref<IOrder | null>(null)
  const interestDialog = ref<{
    resetOpening: (err?: string) => void
    close: () => void
    closeForNavigate?: () => void
  } | null>(null)

  const onInterest = async (order: IOrder) => {
    if (!order._id) return
    interestOrder.value = order
    interestOrderId.value = order._id
    showInterestDialog.value = true
    interestUsers.value = order.interestedUsers || []
    interestCount.value = Number(order.interestCount || interestUsers.value.length || 0)
    interestLoading.value = !interestUsers.value.length

    try {
      const res = await orderStore.fetchInterest(order._id)
      if (res?.success && res.data) {
        interestUsers.value = res.data.interestedUsers || []
        interestCount.value = Number(res.data.interestCount || interestUsers.value.length || 0)
      }
    } finally {
      interestLoading.value = false
    }
  }

  const closeInterestDialogForNavigate = () => {
    if (interestDialog.value?.closeForNavigate) {
      interestDialog.value.closeForNavigate()
    } else {
      interestDialog.value?.close()
    }
  }

  /** Ko'z ikonkasi — mijoz↔haydovchi suhbatini faqat ko'rish */
  const onInterestView = async (user: IInterestedUser) => {
    const orderId = interestOrderId.value || ''
    if (!orderId || !user.userId) {
      interestDialog.value?.resetOpening('Order topilmadi')
      return
    }

    closeInterestDialogForNavigate()
    beforeNavigate?.()
    return navigateTo({
      path: '/driver/interest-chat',
      query: {
        orderId,
        driverUserId: String(user.userId),
      },
    })
  }

  /** Karta — haydovchiga yozish (o'zingiz bo'lsangiz mijozga) */
  const onInterestChat = async (user: IInterestedUser) => {
    const order = interestOrder.value
    const orderId = order?._id || interestOrderId.value || ''
    if (!orderId || !user.userId) {
      interestDialog.value?.resetOpening('Order topilmadi')
      return
    }

    const currentUserId = String(useAuthStore().user?.userId || '')
    const isSelf = !!currentUserId && String(user.userId) === currentUserId

    closeInterestDialogForNavigate()
    beforeNavigate?.()

    if (isSelf && order) {
      return onMessage(order)
    }

    const name = interestedUserName(user)
    const existing = findDirectChatWithUser(String(user.userId), orderId)
    const linkQ = order
      ? orderQuickLinkQuery(order, {
          name,
          username: String(user.username || '').replace(/^@/, ''),
        })
      : { name, orderId }

    if (existing?._id) {
      return openExistingChat(existing, {
        open: 'user',
        userId: String(user.userId),
        ...linkQ,
      }, order || undefined)
    }

    return goOpenChat({
      open: 'user',
      userId: String(user.userId),
      ...linkQ,
    }, order || undefined)
  }

  const onBookedChat = async (order: IOrder) => {
    if (!order._id) return
    const peerId = String(order.bookedBy || '')
    const existing = findChatByOrderPeer(order._id, peerId)
    const name =
      [order.bookedByUser?.firstName, order.bookedByUser?.lastName].filter(Boolean).join(' ').trim() ||
      order.bookedByUser?.username ||
      'Haydovchi'
    const linkQ = orderQuickLinkQuery(order, {
      name,
      username: String(order.bookedByUser?.username || '').replace(/^@/, ''),
    })

    if (existing?._id) {
      return openExistingChat(existing, {
        open: 'booked',
        ...linkQ,
      }, order)
    }

    return goOpenChat({
      open: 'booked',
      ...linkQ,
    }, order)
  }

  const onAgent = async (order: IOrder) => {
    if (!order._id) return
    const peerId = String(order.owner?.userId || '')
    const existing = findChatByOrderPeer(order._id, peerId)
    const name =
      [order.owner?.firstName, order.owner?.lastName].filter(Boolean).join(' ').trim() ||
      order.owner?.username ||
      'Agent'
    const linkQ = orderQuickLinkQuery(order, {
      name,
      username: String(order.owner?.username || '').replace(/^@/, ''),
      ...(order.owner?.phone ? { phone: order.owner.phone } : {}),
    })

    if (existing?._id) {
      return openExistingChat(existing, {
        open: 'agent',
        ...linkQ,
      }, order)
    }

    return goOpenChat({
      open: 'agent',
      ...linkQ,
    }, order)
  }

  return {
    showInterestDialog,
    interestLoading,
    interestUsers,
    interestCount,
    interestDialog,
    onMessage,
    onCall,
    onInterest,
    onInterestView,
    onInterestChat,
    onBookedChat,
    onAgent,
    prefetchOrderChat,
  }
}
