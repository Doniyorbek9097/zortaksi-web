import type { ComputedRef, Ref } from 'vue'
import type { useChatStore } from '~/stores/chat.store'
import { replyTargetFromMessage } from '~/utils/messageReplyPreview'
import type { ChatReplyTarget } from '~/components/chat/ReplyBar.vue'

type ChatStore = ReturnType<typeof useChatStore>

/**
 * Chat xabarlarini tanlash, o'chirish va tarixni tozalash.
 */
export function useChatMessageSelection(opts: {
  chatStore: ChatStore
  effectiveChatId: Ref<string>
  messagesMatchChat: ComputedRef<boolean>
  replyTarget: Ref<ChatReplyTarget | null>
}) {
  const { chatStore, effectiveChatId, messagesMatchChat, replyTarget } = opts

  const selectionMode = ref(false)
  /** Tanlangan xabarlar — Set tez qidiruv uchun */
  const selectedIdSet = shallowRef(new Set<string>())
  const selectedCount = computed(() => selectedIdSet.value.size)
  const isMessageSelected = (id: string) => selectedIdSet.value.has(id)

  const isDeletingMessages = ref(false)
  const isClearingHistory = ref(false)
  const showDeleteDialog = ref(false)
  const showClearHistoryDialog = ref(false)
  const pendingDeleteIds = ref<string[]>([])

  const showClearHistoryBtn = computed(
    () => messagesMatchChat.value && chatStore.messages.length > 0,
  )

  const deleteDialogMessage = computed(() => {
    const n = pendingDeleteIds.value.length
    if (n <= 1) return "Ushbu xabar ilovadan va Telegramdan o'chiriladi."
    return `${n} ta xabar ilovadan va Telegramdan o'chiriladi.`
  })

  const enterSelectionMode = (messageId: string) => {
    selectionMode.value = true
    const next = new Set(selectedIdSet.value)
    next.add(messageId)
    selectedIdSet.value = next
  }

  const exitSelectionMode = () => {
    selectionMode.value = false
    selectedIdSet.value = new Set()
  }

  const onMessageLongPress = (messageId: string) => {
    enterSelectionMode(messageId)
  }

  const toggleMessageSelect = (messageId: string) => {
    if (!selectionMode.value) return
    const next = new Set(selectedIdSet.value)
    if (next.has(messageId)) next.delete(messageId)
    else next.add(messageId)
    selectedIdSet.value = next
    if (!next.size) selectionMode.value = false
  }

  const onMessageReply = (msg: {
    _id: string
    text?: string
    type?: string
    locationTitle?: string
    duration?: number
    direction?: string
  }) => {
    if (selectionMode.value) return
    replyTarget.value = replyTargetFromMessage(msg as Parameters<typeof replyTargetFromMessage>[0])
  }

  const openDeleteDialog = (ids: string[]) => {
    const valid = [...new Set(ids.map(String).filter((id) => id && !id.startsWith('temp-')))]
    if (!valid.length) return
    pendingDeleteIds.value = valid
    showDeleteDialog.value = true
  }

  const onMessageDeleteRequest = (messageId: string) => {
    if (selectionMode.value) return
    openDeleteDialog([messageId])
  }

  const openClearHistoryDialog = () => {
    if (!chatStore.messages.length) return
    showClearHistoryDialog.value = true
  }

  const confirmDeleteSelected = () => {
    openDeleteDialog([...selectedIdSet.value])
  }

  const executeDeleteMessages = async () => {
    const ids = pendingDeleteIds.value.filter((id) => !id.startsWith('temp-'))
    if (!ids.length || isDeletingMessages.value) return

    isDeletingMessages.value = true
    try {
      await chatStore.deleteMessages(effectiveChatId.value, ids)
      exitSelectionMode()
      showDeleteDialog.value = false
      pendingDeleteIds.value = []
    } catch (err) {
      console.error('deleteMessages error:', err)
    } finally {
      isDeletingMessages.value = false
    }
  }

  const executeClearHistory = async () => {
    if (isClearingHistory.value || !chatStore.messages.length) return

    isClearingHistory.value = true
    try {
      await chatStore.clearChatHistory(effectiveChatId.value)
      exitSelectionMode()
      showClearHistoryDialog.value = false
    } catch (err) {
      console.error('clearChatHistory error:', err)
    } finally {
      isClearingHistory.value = false
    }
  }

  return {
    selectionMode,
    selectedIdSet,
    selectedCount,
    isMessageSelected,
    isDeletingMessages,
    isClearingHistory,
    showDeleteDialog,
    showClearHistoryDialog,
    pendingDeleteIds,
    showClearHistoryBtn,
    deleteDialogMessage,
    enterSelectionMode,
    exitSelectionMode,
    onMessageLongPress,
    toggleMessageSelect,
    onMessageReply,
    onMessageDeleteRequest,
    openClearHistoryDialog,
    confirmDeleteSelected,
    executeDeleteMessages,
    executeClearHistory,
  }
}
