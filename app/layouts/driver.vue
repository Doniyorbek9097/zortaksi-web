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

const authStore = useAuthStore()
const orderStore = useOrderStore()

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  void orderStore.refreshNewCount()
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
  padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
