<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="admin-shell min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <slot />
      </div>
    </BasePullToRefresh>
    <!-- Tabbar PTR transform dan tashqarida — fixed sticky saqlansin -->
    <AdminBottomNavigation />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { isAdminUser, resolveHomePath } from '~/utils/userRole'

const chatStore = useChatStore()
const authStore = useAuthStore()
const dashboardStore = useAdminDashboardStore()

watch(
  () => [authStore.sessionReady, authStore.user] as const,
  ([ready, user]) => {
    if (!import.meta.client || !ready) return
    if (user && !isAdminUser(user)) {
      void navigateTo(resolveHomePath(user), { replace: true })
    }
  },
  { immediate: true }
)

const refreshBadges = async () => {
  if (!authStore.sessionReady || (!authStore.token && !authStore.user)) return
  if (!isAdminUser(authStore.user)) return
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 20 })
}

watch(
  () => authStore.sessionReady,
  (ready) => {
    if (!ready) return
    if (!authStore.user || !isAdminUser(authStore.user)) {
      void navigateTo(authStore.user ? resolveHomePath(authStore.user) : '/auth', { replace: true })
      return
    }
    dashboardStore.loadCached()
    void dashboardStore.fetchStats({ background: dashboardStore.isReady })
    void refreshBadges()
  },
  { immediate: true }
)
</script>

<style scoped>
.admin-shell {
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.08), transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139, 92, 246, 0.06), transparent);
}
</style>
