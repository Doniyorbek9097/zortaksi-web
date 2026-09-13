<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="driver-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <DriverBottomNavigation />
    <OrdersRegionGroupsWelcome />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useDriverLayoutBoot } from '~/composables/layout/useDriverLayoutBoot'

useDriverLayoutBoot()
</script>

<style scoped>
.driver-shell {
  /* Faqat tabbar balandligi + xavfsiz zona — sahifada qo'shimcha pb kerak emas */
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
