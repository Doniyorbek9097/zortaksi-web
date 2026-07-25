<template>
  <div v-if="!ready" class="session-gate min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-sky-500" />
      <span class="text-xs font-semibold tracking-wide">Yuklanmoqda…</span>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()

/** SSR da ready=false — noto'g'ri hisob HTML ga tushmasin */
const ready = computed(() => {
  if (import.meta.server) return false
  return authStore.sessionReady
})
</script>
