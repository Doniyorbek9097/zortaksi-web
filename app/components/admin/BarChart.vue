<template>
  <div class="pt-2">
  <p
    v-if="isEmpty"
    class="py-8 text-center text-[12px] font-medium text-slate-400"
  >
    Bu davrda ma'lumot yo'q
  </p>
  <template v-else>
    <p
      v-if="activeItem"
      class="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 tabular-nums"
    >
      {{ activeItem.label }}: {{ formattedValue(activeItem.value) }}
    </p>
    <div class="flex items-end gap-1.5 sm:gap-2 h-36">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex-1 flex flex-col items-center gap-2 min-w-0"
      >
        <div class="w-full flex-1 flex items-end justify-center">
          <div
            class="w-full max-w-[32px] rounded-t-lg transition-all duration-300"
            :class="item.active ? 'bg-sky-500 shadow-sm shadow-sky-500/30' : 'bg-sky-200/80 dark:bg-sky-900/50'"
            :style="{ height: `${barHeight(item.value)}%` }"
          />
        </div>
        <span
          class="text-[10px] font-bold uppercase tracking-wide truncate w-full text-center"
          :class="item.active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'"
        >
          {{ item.label }}
        </span>
      </div>
    </div>
  </template>
  </div>
</template>

<script setup lang="ts">
interface BarItem {
  label: string
  value: number
  active?: boolean
}

const props = defineProps<{
  items: BarItem[]
  /** amount uchun ming so'm */
  valueMode?: 'number' | 'amount'
}>()

const isEmpty = computed(() =>
  props.items.length > 0 && props.items.every((i) => i.value === 0)
)

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1))
const barHeight = (value: number) => {
  if (value <= 0) return 4
  return Math.max(12, Math.round((value / max.value) * 100))
}

const activeItem = computed(() => props.items.find((i) => i.active))

const formattedValue = (value: number) => {
  if (props.valueMode === 'amount') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M so'm`
    if (value >= 1000) return `${Math.round(value / 1000)}K so'm`
    return `${value.toLocaleString('ru-RU')} so'm`
  }
  return value.toLocaleString('ru-RU')
}
</script>
