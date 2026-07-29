import type { IInterestedUser, IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'
import type { useOrderStore } from '~/stores/order.store'

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

  const markOrderInterest = (order: IOrder) => {
    if (!order._id) return
    void orderStore.markInterest(order._id)
  }

  const senderDisplayName = (order: IOrder) => {
    const s = order.sender
    const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
    return full || s?.username || 'Buyurtmachi'
  }

  const findChatByOrderPeer = (orderId: string, peerUserId?: string) => {
    if (!peerUserId) return undefined
    return chatStore.chats.find(
      (c) =>
        String(c.orderId || '') === String(orderId) &&
        String(c.peer?.userId || '') === String(peerUserId),
    )
  }

  /** Mavjud chat bo'lsa to'g'ridan; aks holda /chat/open orqali darhol UI */
  const goOpenChat = (query: Record<string, string>) => {
    beforeNavigate?.()
    return navigateTo({
      path: '/driver/chat/open',
      query,
    })
  }

  const onMessage = async (order: IOrder) => {
    if (!order._id) return
    markOrderInterest(order)

    const peerId = order.sender?.userId
    const existing = findChatByOrderPeer(order._id, peerId)
    const name = senderDisplayName(order)
    const phone = String(order.sender?.phone || '')
    const username = String(order.sender?.username || '').replace(/^@/, '')

    beforeNavigate?.()
    if (existing?._id) {
      return navigateTo({
        path: `/driver/chat/${existing._id}`,
        query: {
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
        },
      })
    }

    return goOpenChat({
      open: 'order',
      orderId: order._id,
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(username ? { username } : {}),
    })
  }

  const onCall = (order: IOrder) => {
    markOrderInterest(order)
  }

  const showInterestDialog = ref(false)
  const interestLoading = ref(false)
  const interestUsers = ref<IInterestedUser[]>([])
  const interestCount = ref(0)
  const interestOrderId = ref<string | null>(null)
  const interestDialog = ref<{
    resetOpening: (err?: string) => void
    close: () => void
    closeForNavigate?: () => void
  } | null>(null)

  const onInterest = async (order: IOrder) => {
    if (!order._id) return
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

  const onInterestSelect = async (user: IInterestedUser) => {
    const orderId = interestOrderId.value || ''
    if (!orderId || !user.userId) {
      interestDialog.value?.resetOpening('Order topilmadi')
      return
    }

    // history.back() race — avval disarm, keyin sahifa
    if (interestDialog.value?.closeForNavigate) {
      interestDialog.value.closeForNavigate()
    } else {
      interestDialog.value?.close()
    }

    beforeNavigate?.()
    return navigateTo({
      path: '/driver/interest-chat',
      query: {
        orderId,
        driverUserId: String(user.userId),
      },
    })
  }

  const onBookedChat = async (order: IOrder) => {
    if (!order._id) return
    const peerId = String(order.bookedBy || '')
    const existing = findChatByOrderPeer(order._id, peerId)
    const name =
      [order.bookedByUser?.firstName, order.bookedByUser?.lastName].filter(Boolean).join(' ').trim() ||
      order.bookedByUser?.username ||
      'Haydovchi'

    beforeNavigate?.()
    if (existing?._id) {
      return navigateTo({
        path: `/driver/chat/${existing._id}`,
        query: { name },
      })
    }

    return goOpenChat({
      open: 'booked',
      orderId: order._id,
      name,
    })
  }

  const onAgent = async (order: IOrder) => {
    if (!order._id) return
    const peerId = String(order.owner?.userId || '')
    const existing = findChatByOrderPeer(order._id, peerId)
    const name =
      [order.owner?.firstName, order.owner?.lastName].filter(Boolean).join(' ').trim() ||
      order.owner?.username ||
      'Agent'
    const username = String(order.owner?.username || '').replace(/^@/, '')

    beforeNavigate?.()
    if (existing?._id) {
      return navigateTo({
        path: `/driver/chat/${existing._id}`,
        query: { name },
      })
    }

    return goOpenChat({
      open: 'agent',
      orderId: order._id,
      name,
      ...(username ? { username } : {}),
    })
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
    onInterestSelect,
    onBookedChat,
    onAgent,
  }
}
