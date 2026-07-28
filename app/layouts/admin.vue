<template>
  <AuthSessionGate>
    <BasePullToRefresh>
      <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
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
import { isAdminUser, resolveHomePath } from '~/utils/userRole'

const chatStore = useChatStore()
const authStore = useAuthStore()

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
  if (!chatStore.chats.length) await chatStore.fetchChats({ page: 1, limit: 50 })
}

watch(
  () => authStore.sessionReady,
  (ready) => {
    if (!ready) return
    if (!authStore.user || !isAdminUser(authStore.user)) {
      void navigateTo(authStore.user ? resolveHomePath(authStore.user) : '/auth', { replace: true })
      return
    }
    void refreshBadges()
  },
  { immediate: true }
)
</script>
