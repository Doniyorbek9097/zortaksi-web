<template>
  <div class="mt-2 space-y-2">
    <div
      v-if="loading && !stats"
      class="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
    />

    <template v-else-if="stats">
      <div
        class="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-2.5"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-white text-[9px] shrink-0"
            >
              <font-awesome-icon icon="fa-solid fa-server" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black text-slate-700 dark:text-slate-200">RAM</p>
              <p class="text-[9px] font-bold text-slate-400 truncate">
                {{ stats.memory.usedGb }} / {{ stats.memory.totalGb }} GB
              </p>
            </div>
          </div>
          <span
            class="text-[12px] font-black tabular-nums shrink-0"
            :class="percentTone(stats.memory.usedPercent)"
          >
            {{ stats.memory.usedPercent }}%
          </span>
        </div>
        <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="barTone(stats.memory.usedPercent)"
            :style="{ width: `${Math.min(100, stats.memory.usedPercent)}%` }"
          />
        </div>
        <p class="mt-1 text-[8px] font-bold text-slate-400">
          Bo'sh: {{ stats.memory.freeGb }} GB
        </p>
      </div>

      <div
        class="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-2.5"
      >
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-white text-[9px] shrink-0"
            >
              <font-awesome-icon icon="fa-solid fa-bolt" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black text-slate-700 dark:text-slate-200">CPU</p>
              <p class="text-[9px] font-bold text-slate-400 truncate">
                {{ stats.cpu.cores }} yadro
              </p>
            </div>
          </div>
          <span
            class="text-[12px] font-black tabular-nums shrink-0"
            :class="percentTone(stats.cpu.usedPercent)"
          >
            {{ stats.cpu.usedPercent }}%
          </span>
        </div>
        <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="barTone(stats.cpu.usedPercent)"
            :style="{ width: `${Math.min(100, stats.cpu.usedPercent)}%` }"
          />
        </div>
        <p class="mt-1 text-[8px] font-bold text-slate-400 truncate" :title="stats.cpu.model">
          {{ stats.cpu.model }}
        </p>
      </div>

      <button
        type="button"
        class="w-full rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-3 py-2.5 text-[11px] font-black text-rose-700 dark:text-rose-300 active:scale-[0.99] transition-transform disabled:opacity-60"
        :disabled="maintaining"
        @click="confirmOpen = true"
      >
        <font-awesome-icon
          :icon="maintaining ? 'fa-solid fa-spinner' : 'fa-solid fa-rotate'"
          :class="maintaining ? 'fa-spin' : ''"
          class="mr-1.5"
        />
        {{ maintaining ? 'Bo\'shatilmoqda...' : 'RAM/CPU bo\'shatish (pm2 restart)' }}
      </button>

      <p
        v-if="maintenanceMessage"
        class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center"
      >
        {{ maintenanceMessage }}
      </p>
    </template>

    <p v-else-if="error" class="text-[10px] font-bold text-rose-500 text-center py-1">
      {{ error }}
    </p>

    <BaseConfirmDialog
      v-model="confirmOpen"
      title="Serverni bo'shatish"
      message="Barcha ilova keshlari tozalanadi va pm2 restart all bajariladi. 10–20 soniya API va socket uziladi. Davom etasizmi?"
      confirm-text="Bo'shatish"
      cancel-text="Bekor"
      variant="danger"
      :loading="maintaining"
      @confirm="onConfirmMaintenance"
    />
  </div>
</template>

<script setup lang="ts">
import type { ServerResourceStats } from '~/composables/dashboard/useServerResources'

const props = defineProps<{
  stats: ServerResourceStats | null
  loading: boolean
  maintaining: boolean
  maintenanceMessage: string
  error: string
}>()

const emit = defineEmits<{
  maintenance: []
}>()

const confirmOpen = ref(false)

const onConfirmMaintenance = () => {
  emit('maintenance')
  confirmOpen.value = false
}

const percentTone = (pct: number) => {
  if (pct >= 85) return 'text-rose-600 dark:text-rose-400'
  if (pct >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

const barTone = (pct: number) => {
  if (pct >= 85) return 'bg-gradient-to-r from-rose-500 to-red-600'
  if (pct >= 70) return 'bg-gradient-to-r from-amber-400 to-orange-500'
  return 'bg-gradient-to-r from-emerald-500 to-teal-500'
}
</script>
