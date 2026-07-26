import type { ComputedRef } from 'vue'
import type { IOrder } from '~/types'
import type { useAuthStore } from '~/stores/auth.store'
import type { useOrderStore } from '~/stores/order.store'

const BOOK_PRICE = 1000

/**
 * Band qilish / bekor qilish dialoglari va balans xatolari.
 */
export function useOrdersBooking(options: {
  orderStore: ReturnType<typeof useOrderStore>
  authStore: ReturnType<typeof useAuthStore>
  isAdmin: ComputedRef<boolean>
}) {
  const { orderStore, authStore, isAdmin } = options

  const showBookDialog = ref(false)
  const showUnbookDialog = ref(false)
  const showNoMoneyDialog = ref(false)
  const booking = ref(false)
  const unbooking = ref(false)
  const bookTarget = ref<IOrder | null>(null)
  const unbookTarget = ref<IOrder | null>(null)
  const noMoneyMessage = ref('')
  const noMoneyIsBalance = ref(true)

  const bookConfirmMessage = computed(() => {
    if (isAdmin.value) {
      return "Bu buyurtmani band qilasizmi? Admin uchun bepul."
    }
    return `Bu buyurtmani band qilasizmi? Hisobingizdan ${BOOK_PRICE.toLocaleString('ru-RU')} so'm yechiladi.`
  })

  const onBook = (order: IOrder) => {
    if (!order._id || order.status === 'booked') return
    bookTarget.value = order
    showBookDialog.value = true
  }

  const onUnbook = (order: IOrder) => {
    if (!order._id || order.status !== 'booked') return
    unbookTarget.value = order
    showUnbookDialog.value = true
  }

  const confirmBook = async () => {
    const order = bookTarget.value
    if (!order?._id || booking.value) return
    booking.value = true
    try {
      await orderStore.bookOrder(order._id)
      showBookDialog.value = false
      bookTarget.value = null
      try { await authStore.getMe() } catch { /* ignore */ }
    } catch (e: any) {
      const status = e?.response?.status
      const data = e?.response?.data
      showBookDialog.value = false
      if (status === 402 || data?.data?.shortage != null) {
        const price = Number(data?.data?.price || BOOK_PRICE)
        const balance = Number(data?.data?.balance ?? authStore.user?.balance ?? 0)
        const shortage = Number(data?.data?.shortage || Math.max(0, price - balance))
        noMoneyIsBalance.value = true
        noMoneyMessage.value =
          data?.message ||
          `Pul yo'q. Balansingiz: ${balance.toLocaleString('ru-RU')} so'm. Yetishmaydi: ${shortage.toLocaleString('ru-RU')} so'm.`
        showNoMoneyDialog.value = true
        return
      }
      noMoneyIsBalance.value = false
      noMoneyMessage.value = data?.message || e?.message || 'Band qilish amalga oshmadi'
      showNoMoneyDialog.value = true
    } finally {
      booking.value = false
    }
  }

  const confirmUnbook = async () => {
    const order = unbookTarget.value
    if (!order?._id || unbooking.value) return
    unbooking.value = true
    try {
      await orderStore.unbookOrder(order._id)
      showUnbookDialog.value = false
      unbookTarget.value = null
    } catch (e: any) {
      showUnbookDialog.value = false
      noMoneyIsBalance.value = false
      noMoneyMessage.value =
        e?.response?.data?.message || e?.message || 'Bandni bekor qilib bo\'lmadi'
      showNoMoneyDialog.value = true
    } finally {
      unbooking.value = false
    }
  }

  const goPayment = () => {
    showNoMoneyDialog.value = false
    navigateTo('/driver/payment')
  }

  const onNoMoneyConfirm = () => {
    if (noMoneyIsBalance.value) goPayment()
    else showNoMoneyDialog.value = false
  }

  return {
    showBookDialog,
    showUnbookDialog,
    showNoMoneyDialog,
    booking,
    unbooking,
    bookTarget,
    unbookTarget,
    noMoneyMessage,
    noMoneyIsBalance,
    bookConfirmMessage,
    onBook,
    onUnbook,
    confirmBook,
    confirmUnbook,
    onNoMoneyConfirm,
  }
}
