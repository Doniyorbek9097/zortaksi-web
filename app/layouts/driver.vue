<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <!-- Tabbar PTR transform dan tashqarida — fixed sticky saqlansin -->
    <DriverBottomNavigation v-if="!mandatoryFilterOpen" />
    <OrdersMandatoryFilterGate />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { loadOrderFilterKeywords, loadOrderFilterBotGroupId, isOrderFilterConfigured } from '~/utils/orderFilterKeywords'

const chatStore = useChatStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

const mandatoryFilterOpen = computed(() => {
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  return !isOrderFilterConfigured()
})

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 20 })
  await orderStore.refreshMemberGroupIds()
  void orderStore.refreshScopeCounts(
    loadOrderFilterBotGroupId() ? undefined : loadOrderFilterKeywords().trim() || undefined,
    loadOrderFilterBotGroupId().trim() || undefined,
  )
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

<style>
html,
body {
  overscroll-behavior-y: contain;
}
</style>
