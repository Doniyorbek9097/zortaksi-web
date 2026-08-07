import type { Ref } from 'vue'
import type { IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'

const PRECONNECT_ORDER_LIMIT = 5

/**
 * Buyurtmalar ro'yxatida top orderlar uchun silent preconnect.
 * Chat yo'q bo'lsa — fon startChatFromOrder + connect.
 */
export function useOrdersPreconnect(options: {
  chatStore: ReturnType<typeof useChatStore>
  displayOrders: Ref<IOrder[]>
}) {
  const { chatStore, displayOrders } = options
  const preconnectedChats = new Set<string>()
  const preconnectedOrders = new Set<string>()
  const inflightOrders = new Set<string>()

  const primeAndConnect = (chat: import('~/types').IChat, chatId: string) => {
    if (preconnectedChats.has(chatId)) return
    preconnectedChats.add(chatId)
    chatStore.primeFromChat(chat)
    void chatStore.connect(chatId, { silent: true })
  }

  const tryPreconnect = async (order: IOrder) => {
    if (!order._id || !order.sender?.userId) return

    const orderId = String(order._id)
    const peerId = String(order.sender.userId)
    const existing = chatStore.chats.find(
      (c) =>
        String(c.orderId || '') === orderId &&
        String(c.peer?.userId || '') === peerId,
    )

    if (existing?._id) {
      primeAndConnect(existing, String(existing._id))
      return
    }

    if (preconnectedOrders.has(orderId) || inflightOrders.has(orderId)) return
    inflightOrders.add(orderId)

    try {
      const res = await chatStore.startChatFromOrder(orderId)
      if (!res?.success || !res.data?._id) return

      preconnectedOrders.add(orderId)
      const chat = res.data as import('~/types').IChat
      const chatId = String(chat._id)
      const idx = chatStore.chats.findIndex((c) => c._id === chatId)
      if (idx >= 0) {
        chatStore.chats[idx] = { ...chatStore.chats[idx], ...chat }
      } else {
        chatStore.chats.unshift(chat)
      }
      primeAndConnect(chat, chatId)
    } finally {
      inflightOrders.delete(orderId)
    }
  }

  watch(
    () => displayOrders.value.map((o) => o._id).join(','),
    () => {
      for (const order of displayOrders.value.slice(0, PRECONNECT_ORDER_LIMIT)) {
        void tryPreconnect(order)
      }
    },
    { immediate: true },
  )
}
