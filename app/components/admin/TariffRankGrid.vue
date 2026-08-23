<template>
  <div class="space-y-2.5">
    <div
      v-for="(item, idx) in items"
      :key="item.tariffId || item.title"
      class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
      :class="idx === 0 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-slate-900/50'"
    >
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 text-white"
        :class="rankBadge(idx)"
      >
        {{ idx + 1 }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-bold text-slate-800 dark:text-white leading-snug">
          {{ item.title }}
        </p>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
          {{ item.count }} ta sotuv
        </p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-[12px] font-black tabular-nums text-violet-600 dark:text-violet-400">
          {{ item.amount.toLocaleString('ru-RU') }}
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

const rankBadge = (idx: number) => {
  if (idx === 0) return 'bg-amber-500'
  if (idx === 1) return 'bg-violet-500'
  if (idx === 2) return 'bg-sky-500'
  return 'bg-slate-400 dark:bg-slate-600'
}
</script>
