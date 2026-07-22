<template>
  <div class="pt-2">
    <div class="flex items-end gap-2 h-36">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex-1 flex flex-col items-center gap-2 min-w-0"
      >
        <div class="w-full flex-1 flex items-end justify-center">
          <div
            class="w-full max-w-[28px] rounded-t-md transition-all"
            :class="item.active ? 'bg-sky-500' : 'bg-sky-200 dark:bg-sky-900/60'"
            :style="{ height: `${barHeight(item.value)}%` }"
            :title="`${item.value.toLocaleString('ru-RU')}`"
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
  </div>
</template>

<script setup lang="ts">
interface BarItem {
  label: string
  value: number
  active?: boolean
}

const props = defineProps<{ items: BarItem[] }>()

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1))
const barHeight = (value: number) => Math.max(8, Math.round((value / max.value) * 100))
</script>
