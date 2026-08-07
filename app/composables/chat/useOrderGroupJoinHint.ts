import type { Ref, ComputedRef } from 'vue'
import type { IChat } from '~/types/chat'
import { resolveOrderGroupContext } from '~/utils/orderChatQuery'
import type { ConnStatus } from '~/stores/chat/types'

const JOIN_HINT_MESSAGE =
  `Guruhga a'zo bo'lasiz.\n\n` +
  `• Shu guruhdan keladigan yangi buyurtmalarni 100% olasiz (Meniki bo'limida).\n` +
  `• E'lon yuborganingizda xabar o'zingizning Telegram nomingizdan ketadi.\n\n` +
  `Davom etasizmi?`

const JOIN_SUCCESS_MESSAGE =
  `Shu guruhdan keladigan yangi buyurtmalarni 100% olasiz — ular Meniki bo'limida ko'rinadi.`

const MEMBER_HINT_MESSAGE =
  `Siz allaqachon bu guruhda a'zosiz. Shu guruhdan keladigan yangi buyurtmalar Meniki bo'limida 100% sizga ko'rinadi.`

export function useOrderGroupJoinHint(options: {
  routeQuery: Ref<Record<string, unknown>>
  currentChat: Ref<IChat | null>
  needsTelegramConnect: ComputedRef<boolean>
  connectionStatus: Ref<ConnStatus>
}) {
  const { routeQuery, currentChat, needsTelegramConnect, connectionStatus } = options

  const myGroupIds = ref<Set<string>>(new Set())
  const groupIdsLoaded = ref(false)
  const joinDialogOpen = ref(false)
  const joinBusy = ref(false)
  const joinError = ref('')
  const joinSuccess = ref(false)

  const isOrderChat = computed(
    () => !!(currentChat.value?.orderId || String(routeQuery.value.orderId || '').trim()),
  )

  const orderGroup = computed(() =>
    resolveOrderGroupContext(routeQuery.value, currentChat.value),
  )

  const connectFailed = computed(
    () =>
      connectionStatus.value === 'unreachable' ||
      connectionStatus.value === 'restricted',
  )

  const isGroupMember = computed(() => {
    const gid = orderGroup.value?.groupId
    if (!gid) return false
    return myGroupIds.value.has(gid)
  })

  const showGroupJoinHint = computed(
    () =>
      needsTelegramConnect.value &&
      isOrderChat.value &&
      !!orderGroup.value &&
      connectFailed.value &&
      !joinSuccess.value &&
      !isGroupMember.value,
  )

  const showGroupMemberHint = computed(
    () =>
      needsTelegramConnect.value &&
      isOrderChat.value &&
      !!orderGroup.value &&
      connectFailed.value &&
      !joinSuccess.value &&
      isGroupMember.value &&
      groupIdsLoaded.value,
  )

  const showGroupJoinSuccess = computed(
    () =>
      needsTelegramConnect.value &&
      isOrderChat.value &&
      !!orderGroup.value &&
      joinSuccess.value,
  )

  const joinDialogMessage = computed(() => JOIN_HINT_MESSAGE)

  const fetchMyGroupIds = async () => {
    try {
      const res = await useApi('/groups/mine/ids', { method: 'GET' })
      if (res.success) {
        myGroupIds.value = new Set(
          (res.data?.ids || []).map((id: unknown) => String(id)),
        )
      }
    } catch {
      /* ignore */
    } finally {
      groupIdsLoaded.value = true
    }
  }

  const openJoinDialog = () => {
    joinError.value = ''
    joinDialogOpen.value = true
  }

  const confirmJoin = async () => {
    const g = orderGroup.value
    if (!g?.groupId || joinBusy.value) return
    joinBusy.value = true
    joinError.value = ''
    try {
      const res = await useApi('/groups/membership', {
        method: 'POST',
        body: {
          action: 'join',
          groupId: g.groupId,
          title: g.groupTitle,
          username: g.groupUsername || undefined,
          accessHash: g.accessHash,
        },
        timeout: 60_000,
      })
      if (res.success) {
        myGroupIds.value.add(g.groupId)
        joinSuccess.value = true
        joinDialogOpen.value = false
      } else {
        joinError.value = res.message || "Guruhga a'zo bo'lish amalga oshmadi"
      }
    } catch (e: any) {
      joinError.value =
        e?.response?.data?.message || "Guruhga a'zo bo'lish amalga oshmadi"
    } finally {
      joinBusy.value = false
    }
  }

  const membershipPreviewGroup = computed(() => {
    const g = orderGroup.value
    if (!g) return null
    return {
      id: g.groupId,
      title: g.groupTitle,
      username: g.groupUsername,
      accessHash: g.accessHash,
      isAdmin: false,
      viaUserbotId: '',
      connections: 0,
      price: 0,
      free: true,
    }
  })

  return {
    orderGroup,
    showGroupJoinHint,
    showGroupMemberHint,
    showGroupJoinSuccess,
    joinDialogOpen,
    joinBusy,
    joinError,
    joinDialogMessage,
    joinSuccessMessage: JOIN_SUCCESS_MESSAGE,
    memberHintMessage: MEMBER_HINT_MESSAGE,
    membershipPreviewGroup,
    fetchMyGroupIds,
    openJoinDialog,
    confirmJoin,
  }
}
