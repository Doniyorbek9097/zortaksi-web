<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <slot />
    <DriverBottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'

const orderStore = useOrderStore()
const chatStore = useChatStore()
const authStore = useAuthStore()

/** Tab badge uchun yangi buyurtma / unread chat sonlarini yuklash */
const refreshBadges = async () => {
  if (!authStore.token && !authStore.user) return
  await Promise.allSettled([
    orderStore.refreshNewCount(),
    chatStore.chats.length ? Promise.resolve() : chatStore.fetchChats({ page: 1, limit: 50 }),
  ])
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
