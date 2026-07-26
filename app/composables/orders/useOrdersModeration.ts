import type { IOrder } from '~/types'
import type { useOrderStore } from '~/stores/order.store'

/**
 * Moderatsiya amallari: guruh/user bloklash va o'chirish.
 * Umumiy amal xatolari dialogini ham shu yerda saqlaydi.
 */
export function useOrdersModeration(orderStore: ReturnType<typeof useOrderStore>) {
  const showBlockGroupDialog = ref(false)
  const showBlockUserDialog = ref(false)
  const blockGroupTarget = ref<IOrder | null>(null)
  const blockUserTarget = ref<IOrder | null>(null)
  const blocking = ref(false)
  const actionError = ref('')
  const showActionError = ref(false)

  const showError = (msg: string) => {
    actionError.value = msg
    showActionError.value = true
  }

  /** Dialog matni uchun sender nomi */
  const senderLabel = (order: IOrder) => {
    const s = order.sender
    const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
    return full || s?.username || s?.userId || 'Foydalanuvchi'
  }

  const onStopGroup = (order: IOrder) => {
    if (!order._id) return
    blockGroupTarget.value = order
    showBlockGroupDialog.value = true
  }

  const onStopUser = (order: IOrder) => {
    if (!order._id) return
    blockUserTarget.value = order
    showBlockUserDialog.value = true
  }

  const confirmBlockGroup = async () => {
    const order = blockGroupTarget.value
    if (!order?._id || blocking.value) return
    blocking.value = true
    try {
      await orderStore.blockGroup(order._id)
      showBlockGroupDialog.value = false
      blockGroupTarget.value = null
    } catch (err: any) {
      showBlockGroupDialog.value = false
      showError(err?.response?.data?.message || 'Guruhni bloklash amalga oshmadi')
    } finally {
      blocking.value = false
    }
  }

  const confirmBlockUser = async () => {
    const order = blockUserTarget.value
    if (!order?._id || blocking.value) return
    blocking.value = true
    try {
      await orderStore.blockSender(order._id)
      showBlockUserDialog.value = false
      blockUserTarget.value = null
    } catch (err: any) {
      showBlockUserDialog.value = false
      showError(err?.response?.data?.message || 'Foydalanuvchini bloklash amalga oshmadi')
    } finally {
      blocking.value = false
    }
  }

  const onDelete = async (order: IOrder) => {
    if (!order._id) return
    try {
      await orderStore.deleteOrder(order._id)
    } catch (err: any) {
      showError(err?.response?.data?.message || "Buyurtmani o'chirib bo'lmadi")
    }
  }

  return {
    showBlockGroupDialog,
    showBlockUserDialog,
    blockGroupTarget,
    blockUserTarget,
    blocking,
    actionError,
    showActionError,
    showError,
    senderLabel,
    onStopGroup,
    onStopUser,
    confirmBlockGroup,
    confirmBlockUser,
    onDelete,
  }
}
