<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <slot />
    <DriverBottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'

const chatStore = useChatStore()
const authStore = useAuthStore()

/** Tab badge uchun unread chat sonini yuklash */
const refreshBadges = async () => {
  if (!authStore.token && !authStore.user) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 50 })
}

onMounted(() => {
  void refreshBadges()
})

watch(
  () => authStore.user?.userId,
  (id) => {
    if (id) void refreshBadges()
  }
)
</script>
