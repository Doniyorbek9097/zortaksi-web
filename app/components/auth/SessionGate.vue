<template>
  <div
    v-if="!ready"
    class="session-gate fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950"
  >
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

/** Faqat client + sessionReady — SSR/noto'g'ri hisob hech qachon ko'rinmasin */
const ready = computed(() => import.meta.client && authStore.sessionReady)
</script>
