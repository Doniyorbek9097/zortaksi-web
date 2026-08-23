<template>
  <div class="space-y-3.5">
    <div
      v-for="(item, idx) in items"
      :key="item.slug || item.title"
      class="group"
    >
      <div class="flex items-center justify-between gap-2 text-[12px] mb-1.5">
        <span class="font-semibold text-slate-600 dark:text-slate-300 truncate min-w-0 flex items-center gap-1.5">
          <span
            v-if="idx < 3"
            class="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
            :class="rankBadge(idx)"
          >
            {{ idx + 1 }}
          </span>
          <span class="truncate">{{ item.title }}</span>
        </span>
        <span class="font-black text-slate-900 dark:text-white shrink-0 tabular-nums text-right">
          {{ item.count.toLocaleString('ru-RU') }}
          <span class="text-[10px] font-bold text-emerald-500">
            · {{ item.active }} faol
          </span>
        </span>
      </div>
      <div class="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-700/50">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out relative"
          :class="barClass(idx)"
          :style="{ width: `${barWidth(item.count)}%` }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
        </div>
      </div>
    </div>
    <p
      v-if="!items.length"
      class="py-6 text-center text-[12px] font-medium text-slate-400"
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

const rankBadge = (idx: number) => {
  if (idx === 0) return 'bg-amber-400 text-white shadow-sm shadow-amber-500/40'
  if (idx === 1) return 'bg-slate-400 text-white'
  if (idx === 2) return 'bg-orange-400 text-white'
  return 'bg-slate-200 dark:bg-slate-700 text-slate-500'
}

const barClass = (idx: number) => {
  if (idx === 0) return 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-sm shadow-amber-500/30'
  if (idx === 1) return 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-sm shadow-sky-500/20'
  if (idx === 2) return 'bg-gradient-to-r from-violet-400 to-purple-500 shadow-sm shadow-violet-500/20'
  return 'bg-gradient-to-r from-sky-300 to-sky-500 dark:from-sky-700 dark:to-sky-600'
}
</script>
