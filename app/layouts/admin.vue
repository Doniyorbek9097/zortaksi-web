<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <slot />
    <AdminBottomNavigation :chats-badge="chatsBadge" />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'

const chatStore = useChatStore()
const authStore = useAuthStore()

const chatsBadge = computed(() =>
  chatStore.unreadTotal > 0
    ? (chatStore.unreadTotal > 99 ? '99+' : chatStore.unreadTotal)
    : undefined
)

const refreshBadges = async () => {
  if (!authStore.token && !authStore.user) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 50 })
}

onMounted(() => {
  void refreshBadges()
})
</script>
