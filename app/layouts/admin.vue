<template>
  <AuthSessionGate>
    <BasePullToRefresh
      :disabled="ptr.disabled"
      :scroll-selector="ptr.scrollSelector"
    >
      <div class="admin-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <!-- Tabbar fixed sticky saqlansin -->
    <AdminBottomNavigation />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useAdminLayoutBoot } from '~/composables/layout/useAdminLayoutBoot'
import { usePullToRefreshRoute } from '~/composables/usePullToRefreshRoute'

useAdminLayoutBoot()
const ptr = usePullToRefreshRoute()
</script>

<style scoped>
.admin-shell {
  padding-bottom: calc(3.5rem + var(--zt-safe-bottom, 0px));
}
</style>
