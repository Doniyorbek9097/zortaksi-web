<template>
  <div class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
      :class="colorClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0">
      <p class="text-xl font-black leading-none" :class="valueClass">{{ formattedValue }}</p>
      <p class="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type Color = 'blue' | 'amber' | 'green' | 'violet' | 'emerald' | 'pink'

interface Props {
  value: number
  label: string
  icon: string
  color?: Color
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
})

const bgMap: Record<Color, string> = {
  blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  amber: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
  green: 'bg-green-500/10 text-green-500 dark:text-green-400',
  violet: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
  pink: 'bg-pink-500/10 text-pink-500 dark:text-pink-400',
}

const valueColorMap: Record<Color, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  green: 'text-green-600 dark:text-green-400',
  violet: 'text-violet-600 dark:text-violet-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  pink: 'text-pink-600 dark:text-pink-400',
}

const colorClass = computed(() => bgMap[props.color])
const valueClass = computed(() => valueColorMap[props.color])
const formattedValue = computed(() => props.value.toLocaleString('ru-RU'))
</script>
