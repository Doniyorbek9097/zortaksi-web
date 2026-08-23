<template>
  <div
    v-if="!ready"
    class="session-gate fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950"
  >
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_40%)]"
  />
    <div class="relative flex flex-col items-center gap-5 px-6">
      <div class="relative w-16 h-16">
        <div
          class="absolute inset-0 rounded-2xl bg-sky-500/25 animate-ping motion-reduce:animate-none"
          aria-hidden="true"
        />
        <div
          class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/25 ring-1 ring-white/20"
        >
          <font-awesome-icon icon="fa-solid fa-car" class="text-white text-2xl" />
        </div>
      </div>
      <div class="flex flex-col items-center gap-3">
        <p class="text-sm font-black tracking-wide text-slate-800 dark:text-white">
          ZorTaksi
        </p>
        <div class="flex items-center gap-1.5" aria-label="Yuklanmoqda">
          <span
            v-for="i in 3"
            :key="i"
            class="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-bounce motion-reduce:animate-none"
            :style="{ animationDelay: `${(i - 1) * 0.14}s` }"
          />
        </div>
        <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Tayyorlanmoqda…
        </p>
      </div>
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
