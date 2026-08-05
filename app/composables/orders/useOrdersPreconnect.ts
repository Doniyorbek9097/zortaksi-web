import type { Ref } from 'vue'
import type { IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'

/**
 * Buyurtmalar ro'yxatida mavjud chatlar uchun silent preconnect + xabar prefetch.
 */
export function useOrdersPreconnect(options: {
  chatStore: ReturnType<typeof useChatStore>
  displayOrders: Ref<IOrder[]>
}) {
  const { chatStore, displayOrders } = options
  const preconnected = new Set<string>()

  const tryPreconnect = (order: IOrder) => {
    if (!order._id || !order.sender?.userId) return
    const peerId = String(order.sender.userId)
    const existing = chatStore.chats.find(
      (c) =>
        String(c.orderId || '') === String(order._id) &&
        String(c.peer?.userId || '') === peerId,
    )
    const chatId = existing?._id ? String(existing._id) : ''
    if (!chatId || preconnected.has(chatId)) return

    preconnected.add(chatId)
    chatStore.primeFromChat(existing!)
    void chatStore.connect(chatId, { silent: true })
    void chatStore.fetchMessages(chatId)
  }

  watch(
    () => displayOrders.value.map((o) => o._id).join(','),
    () => {
      for (const order of displayOrders.value.slice(0, 10)) {
        tryPreconnect(order)
      }
    },
    { immediate: true },
  )
}
