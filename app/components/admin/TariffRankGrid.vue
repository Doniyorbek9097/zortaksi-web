<template>
  <div class="space-y-2">
    <div
      v-for="(item, idx) in items"
      :key="item.tariffId || item.title"
      class="flex items-center gap-3 p-3 rounded-xl border transition-all"
      :class="rankSurface(idx)"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
        :class="rankBadge(idx)"
      >
        {{ idx + 1 }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-black text-slate-800 dark:text-white truncate">
          {{ item.title }}
        </p>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
          {{ item.count }} ta sotuv
        </p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-[13px] font-black tabular-nums text-violet-600 dark:text-violet-400">
          {{ formatAmount(item.amount) }}
        </p>
        <p class="text-[9px] font-bold text-slate-400">so'm</p>
      </div>
    </div>
    <p
      v-if="!items.length"
      class="py-6 text-center text-[12px] font-medium text-slate-400"
    >
      Hali tarif sotuvlari yo'q
    </p>
  </div>
</template>

<script setup lang="ts">
interface TariffStatItem {
  tariffId?: string | null
  title: string
  count: number
  amount: number
}

defineProps<{ items: TariffStatItem[] }>()

const formatAmount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return n.toLocaleString('ru-RU')
}

const rankSurface = (idx: number) => {
  if (idx === 0) return 'bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/50'
  if (idx === 1) return 'bg-gradient-to-r from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900 border-violet-100 dark:border-violet-900/40'
  return 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
}

const rankBadge = (idx: number) => {
  if (idx === 0) return 'bg-amber-400 text-white'
  if (idx === 1) return 'bg-violet-500 text-white'
  if (idx === 2) return 'bg-sky-400 text-white'
  return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
}
</script>
