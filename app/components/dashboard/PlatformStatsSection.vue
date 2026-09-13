<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-sky-50/50 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-sky-950/15"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs shadow-sm shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-chart-line" />
        </div>
        <div class="min-w-0">
          <p class="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight">
            Ilova statistikasi
          </p>
          <p class="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            Jonli ma'lumotlar
          </p>
        </div>
      </div>
    </div>

    <div class="p-2.5">
      <div v-if="loading && !ready" class="grid grid-cols-2 gap-1.5">
        <div
          v-for="n in 6"
          :key="n"
          class="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
        />
      </div>
      <div v-else class="grid grid-cols-2 gap-1.5">
        <DashboardStatCard
          v-for="stat in stats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PlatformStatItem } from '~/composables/dashboard/usePlatformStats'

defineProps<{
  stats: PlatformStatItem[]
  loading: boolean
  ready: boolean
}>()
</script>
