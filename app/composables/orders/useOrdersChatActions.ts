import type { IInterestedUser, IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'
import type { useOrderStore } from '~/stores/order.store'

/**
 * Chat / qiziqish / agent amallari.
 * Xabar, band haydovchi chat, qiziqqanlar ro'yxati.
 */
export function useOrdersChatActions(options: {
  orderStore: ReturnType<typeof useOrderStore>
  chatStore: ReturnType<typeof useChatStore>
  showError: (msg: string) => void
}) {
  const { orderStore, chatStore, showError } = options

  /** Tashqi havola ochish (Telegram fallback) */
  const openLink = (url: string) => {
    if (import.meta.client) window.open(url, '_blank')
  }

  const markOrderInterest = (order: IOrder) => {
    if (!order._id) return
    void orderStore.markInterest(order._id)
  }

  const onMessage = async (order: IOrder) => {
    if (!order._id) return
    markOrderInterest(order)
    try {
      const res = await chatStore.startChatFromOrder(order._id)
      if (res?.success && res.data?._id) {
        return navigateTo(`/driver/chat/${res.data._id}`)
      }
    } catch (err) {
      console.error('startChatFromOrder error:', err)
    }
    // Fallback — Telegram profiliga o'tish
    const username = order.sender?.username
    if (username) openLink(`https://t.me/${username}`)
  }

  const onCall = (order: IOrder) => {
    markOrderInterest(order)
  }

  const showInterestDialog = ref(false)
  const interestLoading = ref(false)
  const interestUsers = ref<IInterestedUser[]>([])
  const interestCount = ref(0)
  const interestOrderId = ref<string | null>(null)
  const interestDialog = ref<{ resetOpening: (err?: string) => void; close: () => void } | null>(null)

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
    try {
      const res = await chatStore.startChatWithUser(
        user.userId,
        interestOrderId.value || undefined,
      )
      if (res?.success && res.data?._id) {
        const name =
          user.name ||
          [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
          user.username ||
          'Haydovchi'
        interestDialog.value?.close()
        await navigateTo({
          path: `/driver/chat/${res.data._id}`,
          query: { name },
        })
        return
      }
      interestDialog.value?.resetOpening(res?.message || 'Chat ochilmadi')
    } catch (err: any) {
      interestDialog.value?.resetOpening(
        err?.response?.data?.message || err?.message || 'Chat ochilmadi',
      )
    }
  }

  const onBookedChat = async (order: IOrder) => {
    if (!order._id) return
    try {
      const res = await chatStore.startChatWithBookedDriver(order._id)
      if (res?.success && res.data?._id) {
        const phone = res.data?.peer?.phone
        return navigateTo({
          path: `/driver/chat/${res.data._id}`,
          query: phone ? { phone: String(phone) } : undefined,
        })
      }
      showError(res?.message || 'Haydovchi bilan chat ochilmadi')
    } catch (err: any) {
      console.error('startChatWithBookedDriver error:', err)
      showError(err?.response?.data?.message || 'Haydovchi bilan chat ochilmadi')
    }
  }

  const onAgent = async (order: IOrder) => {
    // Agent — order egasi (owner) bilan chat
    if (!order._id) return
    try {
      const res = await chatStore.startChatWithOrderOwner(order._id)
      if (res?.success && res.data?._id) {
        return navigateTo(`/driver/chat/${res.data._id}`)
      }
      showError(res?.message || 'Agent chat ochilmadi')
    } catch (err: any) {
      console.error('startChatWithOrderOwner error:', err)
      showError(err?.response?.data?.message || 'Agent chat ochilmadi')
    }
    // Fallback — owner Telegram profili
    const username = order.owner?.username
    if (username) openLink(`https://t.me/${username}`)
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
