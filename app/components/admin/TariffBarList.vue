<template>
  <div class="space-y-3">
    <div
      v-for="(item, idx) in items"
      :key="item.tariffId || item.title"
      class="space-y-1"
    >
      <div class="flex items-center justify-between gap-2 text-[12px]">
        <span class="font-semibold text-slate-600 dark:text-slate-300 truncate min-w-0">
          <span
            v-if="idx < 3"
            class="mr-1 font-black"
            :class="rankClass(idx)"
          >
            {{ idx + 1 }}.
          </span>
          {{ item.title }}
        </span>
        <span class="font-black text-slate-900 dark:text-white shrink-0 tabular-nums text-right">
          {{ item.count.toLocaleString('ru-RU') }} ta
          <span class="text-[10px] font-semibold text-violet-500">
            ({{ formatAmount(item.amount) }})
          </span>
        </span>
      </div>
      <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="barClass(idx)"
          :style="{ width: `${barWidth(item.count)}%` }"
        />
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

const props = defineProps<{ items: TariffStatItem[] }>()

const maxCount = computed(() =>
  Math.max(...props.items.map((i) => i.count), 1)
)

const barWidth = (count: number) =>
  Math.max(6, Math.round((count / maxCount.value) * 100))

const formatAmount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return n.toLocaleString('ru-RU')
}

const rankClass = (idx: number) => {
  if (idx === 0) return 'text-amber-500'
  if (idx === 1) return 'text-slate-400'
  if (idx === 2) return 'text-orange-400'
  return 'text-slate-400'
}

const barClass = (idx: number) => {
  if (idx === 0) return 'bg-amber-400'
  if (idx === 1) return 'bg-violet-400'
  if (idx === 2) return 'bg-sky-400'
  return 'bg-violet-300 dark:bg-violet-800'
}
</script>
