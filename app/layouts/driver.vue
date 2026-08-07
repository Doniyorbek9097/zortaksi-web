<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <DriverBottomNavigation v-if="!mandatoryRegionOpen" />
    <OrdersMandatoryRegionGate />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { isTariffActive } from '~/utils/tariffActive'

const chatStore = useChatStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

const mandatoryRegionOpen = computed(() => {
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  if (!isTariffActive(authStore.user)) return false
  return !String(authStore.user?.regionSlug || '').trim()
})

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 20 })
  void orderStore.refreshNewCount()
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
  padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
