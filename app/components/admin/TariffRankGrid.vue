<template>
  <div class="space-y-2.5">
    <div
      v-for="(item, idx) in items"
      :key="item.tariffId || item.title"
      class="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-md"
      :class="rankSurface(idx)"
    >
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 shadow-sm"
        :class="rankBadge(idx)"
      >
        {{ idx + 1 }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-black text-slate-800 dark:text-white truncate">
          {{ item.title }}
        </p>
        <p class="text-[10px] font-bold text-slate-400 mt-0.5">
          {{ item.count }} ta sotuv
        </p>
      </div>
      <div class="text-right shrink-0 pl-2">
        <p class="text-[14px] font-black tabular-nums bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {{ formatAmount(item.amount) }}
        </p>
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">so'm</p>
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
  if (idx === 0) {
    return 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 dark:from-amber-950/50 dark:via-slate-900/80 dark:to-amber-950/20 border-amber-200/80 dark:border-amber-800/40 shadow-sm shadow-amber-500/10'
  }
  if (idx === 1) {
    return 'bg-gradient-to-r from-violet-50/80 to-white dark:from-violet-950/30 dark:to-slate-900/80 border-violet-100 dark:border-violet-900/40'
  }
  return 'bg-white/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
}

const rankBadge = (idx: number) => {
  if (idx === 0) return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
  if (idx === 1) return 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
  if (idx === 2) return 'bg-gradient-to-br from-sky-400 to-blue-500 text-white'
  return 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
}
</script>
