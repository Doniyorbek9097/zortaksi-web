<template>
  <AuthSessionGate>
    <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <slot />
      <DriverBottomNavigation />
    </div>
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'

const chatStore = useChatStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 50 })
}

onMounted(() => {
  orderStore.startRecentMinuteTicker()
  void refreshBadges()
})

watch(
  () => [authStore.sessionReady, authStore.user?.userId] as const,
  ([ready, id]) => {
    if (ready && id) void refreshBadges()
  }
)
</script>

<style scoped>
.driver-shell {
  scrollbar-gutter: stable;
}
</style>
