<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <!-- Header -->
    <ChatsHeader
      :count="chatStore.total"
      :selection-mode="selectionMode"
      :selected-count="selectedIds.length"
      :refreshing="refreshing"
      @enter-select="enterSelect"
      @cancel-select="cancelSelect"
      @refresh="refresh"
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

    <!-- Chat list -->
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
        :support="isSupport(chat)"
        :selection-mode="selectionMode"
        :selected="selectedIds.includes(chat._id)"
        @open="openChat(chat)"
        @toggle="toggleOne(chat._id)"
        @delete="requestSwipeDelete(chat)"
      />
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

definePageMeta({
  layout: 'driver',
})

const chatStore = useChatStore()

// --- Ko'rinish yordamchilari ---
const isSupport = (chat: IChat) => chat.kind === 'support'

const peerName = (chat: IChat) => {
  if (isSupport(chat)) {
    const p = chat.peer
    const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
    return full || p.username || 'Admin yordam'
  }
  const p = chat.peer
  const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
  return full || p.username || p.userId || 'Buyurtmachi'
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
const deleting = ref(false)
const showDeleteDialog = ref(false)
const swipeDeleteId = ref<string | null>(null)

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

const refresh = async () => {
  refreshing.value = true
  try {
    await chatStore.fetchChats()
  } finally {
    refreshing.value = false
  }
}

const openChat = (chat: IChat) => {
  navigateTo({
    path: `/driver/chat/${chat._id}`,
    query: {
      name: peerName(chat),
      phone: isSupport(chat) ? undefined : chat.peer.phone,
      support: isSupport(chat) ? '1' : undefined,
    },
  })
}

onMounted(() => {
  chatStore.fetchChats()
})
</script>
