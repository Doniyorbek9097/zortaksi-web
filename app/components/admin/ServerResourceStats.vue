<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-950/80 flex items-center justify-between gap-2"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <div
          class="w-6 h-6 rounded-md bg-sky-500/12 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-[8px] shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-server" />
        </div>
        <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
          Server quvvati
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 disabled:opacity-50 active:scale-95 transition-transform"
        :disabled="maintaining || (!stats && loading)"
        @click="confirmOpen = true"
      >
        <font-awesome-icon
          :icon="maintaining ? 'fa-solid fa-spinner' : 'fa-solid fa-rotate'"
          :class="maintaining ? 'fa-spin' : ''"
          class="text-[8px]"
        />
        Bo'shatish
      </button>
    </div>

    <div class="p-2">
      <div
        v-if="loading && !stats"
        class="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
      />

      <div v-else-if="stats" class="grid grid-cols-3 gap-1.5">
        <div
          v-for="item in resourceItems(stats)"
          :key="item.key"
          class="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-2 py-1.5"
        >
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">{{ item.label }}</span>
            <span class="text-[10px] font-black tabular-nums" :class="percentTone(item.percent)">
              {{ item.percent }}%
            </span>
          </div>
          <div class="h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="barTone(item.percent)"
              :style="{ width: `${Math.min(100, item.percent)}%` }"
            />
          </div>
          <p class="mt-1 text-[8px] font-bold text-slate-400 tabular-nums truncate">
            {{ item.caption }}
          </p>
        </div>
      </div>

      <p v-else-if="error" class="text-[9px] font-bold text-rose-500 text-center py-1">
        {{ error }}
      </p>

      <p
        v-if="maintenanceMessage"
        class="mt-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 text-center leading-tight"
      >
        {{ maintenanceMessage }}
      </p>
    </div>

    <BaseConfirmDialog
      v-model="confirmOpen"
      title="Keshni tozalash"
      message="Ilova keshlari tozalanadi (admin, ulanish, guruhlar va boshqalar). Server qayta ishga tushirilmaydi. Davom etasizmi?"
      confirm-text="Bo'shatish"
      cancel-text="Bekor"
      variant="danger"
      :loading="maintaining"
      @confirm="onConfirmMaintenance"
    />
  </section>
</template>

<script setup lang="ts">
import type { ServerResourceStats } from '~/composables/dashboard/useServerResources'

defineProps<{
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

const resourceItems = (stats: ServerResourceStats) => [
  {
    key: 'ram',
    label: 'RAM',
    percent: stats.memory.usedPercent,
    caption: `${stats.memory.usedGb}/${stats.memory.totalGb} GB`,
  },
  {
    key: 'cpu',
    label: 'CPU',
    percent: stats.cpu.usedPercent,
    caption: `${stats.cpu.cores} yadro`,
  },
  {
    key: 'disk',
    label: 'Disk',
    percent: stats.disk?.usedPercent ?? 0,
    caption: stats.disk?.totalGb
      ? `${stats.disk.usedGb}/${stats.disk.totalGb} GB`
      : '—',
  },
]

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
