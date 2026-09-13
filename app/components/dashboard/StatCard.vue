<template>
  <div
    class="rounded-xl px-2.5 py-2 flex items-center gap-2 border"
    :class="tone.surface"
  >
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shrink-0"
      :class="tone.icon"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[16px] font-black leading-none tabular-nums truncate" :class="tone.value">
        {{ formattedValue }}
      </p>
      <p class="mt-0.5 text-[9px] font-bold leading-tight line-clamp-2" :class="tone.label">
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

const toneMap: Record<Color, { surface: string; icon: string; value: string; label: string }> = {
  blue: {
    surface: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-100/80 dark:border-sky-900/40',
    icon: 'bg-sky-500 text-white shadow-sm',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/75 dark:text-sky-400/75',
  },
  amber: {
    surface: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-100/80 dark:border-amber-900/40',
    icon: 'bg-amber-500 text-white shadow-sm',
    value: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-600/75 dark:text-amber-400/75',
  },
  green: {
    surface: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100/80 dark:border-emerald-900/40',
    icon: 'bg-emerald-500 text-white shadow-sm',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/75 dark:text-emerald-400/75',
  },
  violet: {
    surface: 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-100/80 dark:border-violet-900/40',
    icon: 'bg-violet-500 text-white shadow-sm',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/75 dark:text-violet-400/75',
  },
  emerald: {
    surface: 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-100/80 dark:border-teal-900/40',
    icon: 'bg-teal-500 text-white shadow-sm',
    value: 'text-teal-700 dark:text-teal-300',
    label: 'text-teal-600/75 dark:text-teal-400/75',
  },
  pink: {
    surface: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-100/80 dark:border-rose-900/40',
    icon: 'bg-rose-500 text-white shadow-sm',
    value: 'text-rose-700 dark:text-rose-300',
    label: 'text-rose-600/75 dark:text-rose-400/75',
  },
}

const tone = computed(() => toneMap[props.color])
const formattedValue = computed(() => props.value.toLocaleString('ru-RU'))
</script>
