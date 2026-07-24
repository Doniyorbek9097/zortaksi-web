<template>
  <div
    class="rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3 min-h-[76px]"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center text-base shrink-0"
      :class="colorClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[22px] sm:text-2xl font-black leading-none tabular-nums" :class="valueClass">
        {{ formattedValue }}
      </p>
      <p class="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug">
        {{ label }}
      </p>
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
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  amber: 'bg-orange-500/15 text-orange-500 dark:text-orange-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  emerald: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  pink: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
}

const valueColorMap: Record<Color, string> = {
  blue: 'text-sky-600 dark:text-sky-400',
  amber: 'text-orange-500 dark:text-orange-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  emerald: 'text-teal-600 dark:text-teal-400',
  pink: 'text-pink-600 dark:text-pink-400',
}

const colorClass = computed(() => bgMap[props.color])
const valueClass = computed(() => valueColorMap[props.color])
const formattedValue = computed(() => props.value.toLocaleString('ru-RU'))
</script>
