<template>
  <div class="space-y-3">
    <div
      v-for="(item, idx) in items"
      :key="item.slug || item.title"
      class="space-y-1"
    >
      <div class="flex items-center justify-between gap-2 text-[12px]">
        <span class="font-semibold text-slate-700 dark:text-slate-300 min-w-0 leading-snug">
          <span v-if="idx < 3" class="font-black text-slate-400 mr-1">{{ idx + 1 }}.</span>
          {{ item.title }}
        </span>
        <span class="font-black text-slate-900 dark:text-white shrink-0 tabular-nums text-[11px]">
          {{ item.count.toLocaleString('ru-RU') }}
          <span class="text-emerald-600 font-bold">· {{ item.active }} faol</span>
        </span>
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
}

const props = defineProps<{ items: RegionItem[] }>()

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
