import type { IChat } from '~/types'
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { isAdminUser } from '~/utils/userRole'
import { chatPeerQuickLinkQuery } from '~/utils/orderChatQuery'
import { compactQuery } from '~/utils/navigationQuery'
import { LIST_PAGE_SIZE } from '~/utils/memoryBudget'
import { shouldSaveDriverListScroll } from '~/utils/driverScrollNav'
import {
  chatPeerName,
  formatChatListDate,
  isDriverPeerChat,
  isSupportChat,
} from './chatPeerDisplay'

/** Sahifa limiti — xotira byudjeti bilan bir xil */
const PAGE_LIMIT = LIST_PAGE_SIZE

/**
 * Haydovchi chatlar ro'yxati — tanlash, o'chirish, scroll va infinite load.
 */
export function useDriverChatsPage() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()

  const peerName = chatPeerName
  const formatDate = formatChatListDate
  const isSupport = isSupportChat

  const showDriverPageFor = (chat: IChat) =>
    isAdminUser(authStore.user) && isDriverPeerChat(chat) && !!chat.peer?.userId

  // --- Tanlash rejimi ---
  const selectionMode = ref(false)
  const selectedIds = ref<string[]>([])
  const refreshing = ref(false)
  const markingRead = ref(false)
  const deleting = ref(false)
  const showDeleteDialog = ref(false)
  const swipeDeleteId = ref<string | null>(null)
  const sentinelEl = ref<HTMLElement | null>(null)
  let loadMoreObserver: IntersectionObserver | null = null

  const allSelected = computed(
    () => chatStore.chats.length > 0 && selectedIds.value.length === chatStore.chats.length,
  )

  const enterSelect = () => {
    selectionMode.value = true
    swipeDeleteId.value = null
  }

  const cancelSelect = () => {
    selectionMode.value = false
    selectedIds.value = []
  }

  const toggleOne = (id: string) => {
    selectedIds.value = selectedIds.value.includes(id)
      ? selectedIds.value.filter((x) => x !== id)
      : [...selectedIds.value, id]
  }

  const toggleAll = () => {
    selectedIds.value = allSelected.value ? [] : chatStore.chats.map((c) => c._id)
  }

  const requestClear = () => {
    swipeDeleteId.value = null
    if (selectedIds.value.length) showDeleteDialog.value = true
  }

  const requestSwipeDelete = (chat: IChat) => {
    swipeDeleteId.value = chat._id
    showDeleteDialog.value = true
  }

  const confirmClear = async () => {
    try {
      deleting.value = true
      const ids = swipeDeleteId.value ? [swipeDeleteId.value] : selectedIds.value
      if (!ids.length) return
      await chatStore.deleteChats(ids)
      showDeleteDialog.value = false
      swipeDeleteId.value = null
      cancelSelect()
    } finally {
      deleting.value = false
    }
  }

  // --- Scroll pozitsiyasi (ro'yxatdan chatga qaytish) ---
  const persistScroll = () => {
    if (!import.meta.client) return
    chatStore.chatsListScrollY = window.scrollY || document.documentElement.scrollTop || 0
  }

  const saveScroll = () => {
    if (!shouldSaveDriverListScroll()) return
    persistScroll()
  }

  const restoreScroll = () => {
    if (!import.meta.client) return
    const y = chatStore.chatsListScrollY
    if (!y) return
    window.scrollTo(0, y)
  }

  const refresh = async () => {
    refreshing.value = true
    try {
      await chatStore.fetchChats({ page: 1, limit: PAGE_LIMIT })
      chatStore.chatsListScrollY = 0
      if (import.meta.client) window.scrollTo({ top: 0 })
    } finally {
      refreshing.value = false
    }
  }

  const markAllRead = async () => {
    if (markingRead.value || chatStore.unreadTotal <= 0) return
    markingRead.value = true
    try {
      await chatStore.markAllRead()
    } finally {
      markingRead.value = false
    }
  }

  usePullToRefresh(refresh)

  const openChat = (chat: IChat) => {
    const id = String(chat._id || '').trim()
    if (!id) return
    persistScroll()
    chatStore.primeFromChat(chat)
    if (chat.kind !== 'support' && chat.kind !== 'direct' && !chat.inAppOnly) {
      void chatStore.connect(id, { silent: true })
    }
    navigateTo({
      path: `/driver/chat/${id}`,
      query: compactQuery({
        name: peerName(chat),
        ...chatPeerQuickLinkQuery(chat),
        support: isSupport(chat) ? '1' : undefined,
      }),
    })
  }

  const openDriverPage = (chat: IChat) => {
    const id = chat.peer?.userId
    if (!id) return
    persistScroll()
    navigateTo(`/driver/user/${encodeURIComponent(id)}`)
  }

  /** Pastki sentinel — keyingi chatlar sahifasini yuklash */
  const bindLoadMore = () => {
    if (!import.meta.client) return
    loadMoreObserver?.disconnect()
    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void chatStore.loadMoreChats({ limit: PAGE_LIMIT })
        }
      },
      { rootMargin: '520px' },
    )
    if (sentinelEl.value) loadMoreObserver.observe(sentinelEl.value)
  }

  watch(sentinelEl, (el) => {
    if (loadMoreObserver && el) loadMoreObserver.observe(el)
  })

  onMounted(() => {
    const boot = async () => {
      const hasCached = chatStore.chats.length > 0
      if (hasCached) {
        void chatStore.fetchChats({ page: 1, limit: PAGE_LIMIT }, { silent: true })
        await nextTick()
        restoreScroll()
        setTimeout(restoreScroll, 80)
      } else {
        await chatStore.fetchChats({ page: 1, limit: PAGE_LIMIT })
        await nextTick()
        restoreScroll()
      }
      bindLoadMore()
    }
    void boot()
  })

  onBeforeUnmount(() => {
    saveScroll()
    loadMoreObserver?.disconnect()
    loadMoreObserver = null
  })

  return {
    chatStore,
    peerName,
    formatDate,
    isSupport,
    showDriverPageFor,
    selectionMode,
    selectedIds,
    refreshing,
    markingRead,
    deleting,
    showDeleteDialog,
    swipeDeleteId,
    sentinelEl,
    allSelected,
    enterSelect,
    cancelSelect,
    toggleOne,
    toggleAll,
    requestClear,
    requestSwipeDelete,
    confirmClear,
    openChat,
    openDriverPage,
    refresh,
    markAllRead,
  }
}
