<template>
  <div
    class="rounded-xl px-3 py-2.5 flex items-center gap-2.5 min-w-0 border"
    :class="surfaceClass"
  >
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0"
      :class="iconClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[16px] font-black leading-none tabular-nums" :class="valueClass">
        {{ displayValue }}
      </p>
      <p class="mt-1 text-[11px] font-bold leading-snug" :class="labelClass">
        {{ label }}
      </p>
    </div>
    <span
      v-if="change != null"
      class="text-[10px] font-black shrink-0 tabular-nums"
      :class="change >= 0 ? 'text-emerald-600' : 'text-rose-600'"
    >
      {{ change > 0 ? '+' : '' }}{{ change }}
    </span>
  </div>
</template>

<script setup lang="ts">
type Tone = 'green' | 'violet' | 'rose' | 'sky' | 'amber'

interface Props {
  value: number | string
  label: string
  icon: string
  tone?: Tone
  change?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'sky',
  change: null,
})

const toneMap: Record<Tone, { surface: string; icon: string; value: string; label: string }> = {
  green: {
    surface: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/90 dark:text-emerald-400/90',
  },
  violet: {
    surface: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900',
    icon: 'bg-violet-500 text-white',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/90 dark:text-violet-400/90',
  },
  rose: {
    surface: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900',
    icon: 'bg-rose-500 text-white',
    value: 'text-rose-700 dark:text-rose-300',
    label: 'text-rose-600/90 dark:text-rose-400/90',
  },
  sky: {
    surface: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900',
    icon: 'bg-sky-500 text-white',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/90 dark:text-sky-400/90',
  },
  amber: {
    surface: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900',
    icon: 'bg-amber-500 text-white',
    value: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-600/90 dark:text-amber-400/90',
  },
}

const surfaceClass = computed(() => toneMap[props.tone].surface)
const iconClass = computed(() => toneMap[props.tone].icon)
const valueClass = computed(() => toneMap[props.tone].value)
const labelClass = computed(() => toneMap[props.tone].label)

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  return props.value.toLocaleString('ru-RU')
})
</script>
