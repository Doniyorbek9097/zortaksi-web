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
        :support="isSupport(chat) && !isAdmin"
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
import { useDriverChatsPage } from '~/composables/chat/useDriverChatsPage'

definePageMeta({
  layout: 'driver',
})

const {
  chatStore,
  isAdmin,
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
} = useDriverChatsPage()
</script>
