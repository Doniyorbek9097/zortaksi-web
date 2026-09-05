<template>
  <div class="space-y-3">
    <div
      v-for="(item, idx) in items"
      :key="item.slug || item.title"
      class="space-y-1"
    >
      <div class="text-[12px] space-y-0.5">
        <div class="flex items-start justify-between gap-3">
          <p class="font-semibold text-slate-700 dark:text-slate-300 leading-snug min-w-0">
            <span v-if="idx < 3" class="font-black text-slate-400 mr-1">{{ idx + 1 }}.</span>
            {{ item.title }}
          </p>
          <p class="shrink-0 text-[11px] font-bold tabular-nums text-right leading-snug">
            <span class="text-slate-600 dark:text-slate-400">{{ item.count.toLocaleString('ru-RU') }} a'zo</span>
            <span class="text-slate-300 dark:text-slate-600 mx-1">·</span>
            <span class="text-sky-600 dark:text-sky-400">{{ item.active.toLocaleString('ru-RU') }} faol</span>
          </p>
        </div>
        <p class="text-right text-[11px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">
          {{ formatMoney(item.income) }} so'm
        </p>
      </div>
      <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          class="h-full rounded-full"
          :class="barClass(idx)"
          :style="{ width: `${barWidth(item.count)}%` }"
        />
      </div>
    </div>
    <p
      v-if="!items.length"
      class="py-4 text-center text-[12px] font-medium text-slate-400"
    >
      Hudud ma'lumoti yo'q
    </p>
  </div>
</template>

<script setup lang="ts">
interface RegionItem {
  slug?: string
  title: string
  count: number
  active: number
  income?: number
  incomePayments?: number
}

const props = defineProps<{ items: RegionItem[] }>()

const formatMoney = (n?: number) => (Number(n) || 0).toLocaleString('ru-RU')

const maxCount = computed(() =>
  Math.max(...props.items.map((i) => i.count), 1)
)

const barWidth = (count: number) =>
  Math.max(8, Math.round((count / maxCount.value) * 100))

const barClass = (idx: number) => {
  if (idx === 0) return 'bg-amber-400'
  if (idx === 1) return 'bg-sky-400'
  if (idx === 2) return 'bg-violet-400'
  return 'bg-sky-300 dark:bg-sky-700'
}
</script>
