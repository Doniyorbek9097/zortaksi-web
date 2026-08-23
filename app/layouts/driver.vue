<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <DriverBottomNavigation />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { TAB_LIST_KEEP } from '~/utils/memoryBudget'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const chatStore = useChatStore()

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  void orderStore.refreshNewCount()
  if (!chatStore.chats.length) {
    void chatStore.fetchChats({ page: 1, limit: TAB_LIST_KEEP }, { silent: true })
  }
}

onMounted(() => {
  orderStore.startRecentMinuteTicker()
  void refreshBadges()
})

onBeforeUnmount(() => {
  orderStore.stopRecentMinuteTicker()
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
  /* Faqat tabbar balandligi + xavfsiz zona — sahifada qo'shimcha pb kerak emas */
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
