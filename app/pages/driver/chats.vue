<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <!-- Header -->
    <ChatsHeader
      :count="chatStore.chats.length"
      :selection-mode="selectionMode"
      :selected-count="selectedIds.length"
      :refreshing="refreshing"
      :unread-total="chatStore.unreadTotal"
      :marking-read="markingRead"
      @enter-select="enterSelect"
      @cancel-select="cancelSelect"
      @refresh="refresh"
      @mark-all-read="markAllRead"
    />

    <!-- Selection bar -->
    <ChatsSelectionBar
      v-if="selectionMode"
      :all-selected="allSelected"
      :selected-count="selectedIds.length"
      @toggle-all="toggleAll"
      @clear="requestClear"
    />

    <!-- Loading (birinchi yuklash) -->
    <div v-if="chatStore.isLoading && !chatStore.chats.length" class="space-y-2.5 pt-1">
      <div v-for="n in 6" :key="n" class="h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <!-- Empty -->
    <BaseEmptyState
      v-else-if="!chatStore.chats.length"
      icon="fa-solid fa-comments"
      title="Hozircha yozishmalar yo'q"
    />

    <!-- Chat list + infinite scroll -->
    <div v-else class="space-y-2.5">
      <ChatsChatItem
        v-for="chat in chatStore.chats"
        :key="chat._id"
        :name="peerName(chat)"
        :preview="chat.lastMessage || 'Yozishma boshlang'"
        :date="formatDate(chat.lastMessageAt)"
        :phone="isSupport(chat) ? undefined : chat.peer.phone"
        :avatar="chat.peer.avatar"
        :user-id="chat.peer.userId"
        :unread="chat.unreadCount"
        :selection-mode="selectionMode"
        :selected="selectedIds.includes(chat._id)"
        :show-driver-page="showDriverPageFor(chat)"
        @open="openChat(chat)"
        @toggle="toggleOne(chat._id)"
        @delete="requestSwipeDelete(chat)"
        @driver-page="openDriverPage(chat)"
      />

      <div ref="sentinelEl" class="h-1" />

      <div
        v-if="chatStore.isLoadingMore"
        class="py-3 flex justify-center"
      >
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-slate-400" />
      </div>

      <p
        v-else-if="!chatStore.hasMore && chatStore.chats.length"
        class="py-3 text-center text-[12px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha suhbatlar ko'rsatildi
      </p>
    </div>

    <!-- Universal o'chirish dialogi -->
    <BaseConfirmDialog
      v-model="showDeleteDialog"
      :title="swipeDeleteId ? 'Chatni o\'chirish' : 'Chatlarni tozalash'"
      description="Bu amalni qaytarib bo'lmaydi"
      :message="swipeDeleteId
        ? 'Bu chatni o\'chirasizmi?'
        : `${selectedIds.length} ta chatni o\'chirasizmi?`"
      confirm-text="O'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="deleting"
      :close-on-confirm="false"
      @confirm="confirmClear"
      @cancel="swipeDeleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { IChat } from '~/types'
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { isAdminUser } from '~/utils/userRole'
import { chatPeerQuickLinkQuery } from '~/utils/orderChatQuery'
import { compactQuery } from '~/utils/navigationQuery'

definePageMeta({
  layout: 'driver',
})

const PAGE_LIMIT = 20

const chatStore = useChatStore()
const authStore = useAuthStore()

// --- Ko'rinish yordamchilari ---
const isSupport = (chat: IChat) => chat.kind === 'support'
const isDriverPeerChat = (chat: IChat) =>
  chat.kind === 'support' || chat.kind === 'direct' || !!chat.inAppOnly

const showDriverPageFor = (chat: IChat) =>
  isAdminUser(authStore.user) && isDriverPeerChat(chat) && !!chat.peer?.userId

/** Peer ismi — haydovchi/admin ham oddiy foydalanuvchi kabi */
const peerName = (chat: IChat) => {
  const p = chat.peer
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  if (p.username) return p.username
  if (p.userId) return p.userId
  return isSupport(chat) ? 'Admin' : 'Buyurtmachi'
}

const formatDate = (value: string | Date) => {
  if (!value) return ''
  const d = new Date(value)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// --- Selection ---
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
  () => chatStore.chats.length > 0 && selectedIds.value.length === chatStore.chats.length
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

const saveScroll = () => {
  if (!import.meta.client) return
  chatStore.chatsListScrollY = window.scrollY || document.documentElement.scrollTop || 0
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
  saveScroll()
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
  saveScroll()
  navigateTo(`/admin/driver/${encodeURIComponent(id)}`)
}

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
</script>
