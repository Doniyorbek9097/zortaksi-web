<template>
  <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <slot />
    <DriverBottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'

const chatStore = useChatStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

/** Tab badge uchun unread chat sonini yuklash */
const refreshBadges = async () => {
  if (!authStore.token && !authStore.user) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 50 })
}

onMounted(() => {
  orderStore.startRecentMinuteTicker()
  void refreshBadges()
})

watch(
  () => authStore.user?.userId,
  (id) => {
    if (id) void refreshBadges()
  }
)
</script>

<style scoped>
/* Scrollbar paydo bo'lganda layout siljimasin */
.driver-shell {
  scrollbar-gutter: stable;
}
</style>
