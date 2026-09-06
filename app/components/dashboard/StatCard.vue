<template>
  <div class="rounded-xl p-2.5 min-h-[88px] flex flex-col" :class="tone.surface">
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 shadow-sm"
      :class="tone.icon"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p class="mt-2 text-[22px] font-black leading-none tabular-nums" :class="tone.value">
      {{ formattedValue }}
    </p>
    <p class="mt-1.5 text-[10px] font-bold leading-snug" :class="tone.label">
      {{ label }}
    </p>
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

const toneMap: Record<Color, { surface: string; icon: string; value: string; label: string }> = {
  blue: {
    surface: 'bg-sky-50 dark:bg-sky-950/35 border border-sky-100 dark:border-sky-900/50',
    icon: 'bg-sky-500 text-white',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/80 dark:text-sky-400/80',
  },
  amber: {
    surface: 'bg-amber-50 dark:bg-amber-950/35 border border-amber-100 dark:border-amber-900/50',
    icon: 'bg-amber-500 text-white',
    value: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-600/80 dark:text-amber-400/80',
  },
  green: {
    surface: 'bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900/50',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/80 dark:text-emerald-400/80',
  },
  violet: {
    surface: 'bg-violet-50 dark:bg-violet-950/35 border border-violet-100 dark:border-violet-900/50',
    icon: 'bg-violet-500 text-white',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/80 dark:text-violet-400/80',
  },
  emerald: {
    surface: 'bg-teal-50 dark:bg-teal-950/35 border border-teal-100 dark:border-teal-900/50',
    icon: 'bg-teal-500 text-white',
    value: 'text-teal-700 dark:text-teal-300',
    label: 'text-teal-600/80 dark:text-teal-400/80',
  },
  pink: {
    surface: 'bg-rose-50 dark:bg-rose-950/35 border border-rose-100 dark:border-rose-900/50',
    icon: 'bg-rose-500 text-white',
    value: 'text-rose-700 dark:text-rose-300',
    label: 'text-rose-600/80 dark:text-rose-400/80',
  },
}

const tone = computed(() => toneMap[props.color])
const formattedValue = computed(() => props.value.toLocaleString('ru-RU'))
</script>
