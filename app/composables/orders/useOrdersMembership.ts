import type { IOrder } from '~/types'
import type { useOrderStore } from '~/stores/order.store'

/**
 * Buyurtma kartasidan guruhga qo'shilish / tark etish.
 */
export function useOrdersMembership(options: {
  orderStore: ReturnType<typeof useOrderStore>
  showError: (msg: string) => void
  /** Scope count / ro'yxatni yangilash */
  onMembershipChanged?: () => void
}) {
  const { orderStore, showError, onMembershipChanged } = options

  const showJoinDialog = ref(false)
  const showLeaveDialog = ref(false)
  const membershipLoading = ref(false)
  const membershipTarget = ref<IOrder | null>(null)

  const groupTitle = computed(
    () => membershipTarget.value?.group?.title || 'Guruh',
  )

  const joinMessage = computed(
    () =>
      `«${groupTitle.value}» guruhiga a'zo bo'lasiz.\n\n` +
      `• Shu guruhdan keladigan buyurtmalarni 100% olasiz (Meniki bo‘limida).\n` +
      `• Mijozga xabar yozganda xabar o‘zingizning Telegram nomingizdan ketadi.\n\n` +
      `Davom etasizmi?`,
  )

  const leaveMessage = computed(
    () =>
      `«${groupTitle.value}» guruhidan chiqasiz.\n\n` +
      `• Shu guruhdan buyurtma olish foizi kamayishi mumkin (Boshqalar bo‘limiga tushadi).\n` +
      `• Xabarlaringiz boshqa haydovchilar / userbot nomidan ketishi mumkin.\n` +
      `• To‘liq qulaylik uchun guruhda a'zo bo‘lib qolish tavsiya etiladi.\n\n` +
      `Baribir tark etasizmi?`,
  )

  const isMemberOfOrder = (order: IOrder) =>
    orderStore.isMemberGroup(order.group?.groupId)

  const onJoinGroup = (order: IOrder) => {
    membershipTarget.value = order
    showJoinDialog.value = true
  }

  const onLeaveGroup = (order: IOrder) => {
    membershipTarget.value = order
    showLeaveDialog.value = true
  }

  const runMembership = async (action: 'join' | 'leave') => {
    const order = membershipTarget.value
    const groupId = String(order?.group?.groupId || '').trim()
    if (!groupId || membershipLoading.value) return
    try {
      membershipLoading.value = true
      const res = await useApi('/groups/membership', {
        method: 'POST',
        body: {
          action,
          groupId,
          title: order?.group?.title,
          username: order?.group?.username,
          accessHash: order?.group?.accessHash,
        },
        timeout: 60_000,
      })
      if (!res.success) {
        showError(res.message || 'Amal bajarilmadi')
        return
      }
      await orderStore.refreshMemberGroupIds()
      showJoinDialog.value = false
      showLeaveDialog.value = false
      membershipTarget.value = null
      onMembershipChanged?.()
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Amal bajarilmadi')
    } finally {
      membershipLoading.value = false
    }
  }

  const confirmJoin = () => runMembership('join')
  const confirmLeave = () => runMembership('leave')

  return {
    showJoinDialog,
    showLeaveDialog,
    membershipLoading,
    membershipTarget,
    joinMessage,
    leaveMessage,
    groupTitle,
    isMemberOfOrder,
    onJoinGroup,
    onLeaveGroup,
    confirmJoin,
    confirmLeave,
  }
}
