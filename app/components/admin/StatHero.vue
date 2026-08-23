<template>
  <div
    class="rounded-xl p-3 min-h-[88px] flex flex-col"
    :class="surfaceClass"
  >
    <div class="flex items-center justify-between gap-1">
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0"
        :class="iconClass"
      >
        <font-awesome-icon :icon="icon" />
      </div>
      <span
        v-if="change != null"
        class="text-[10px] font-black tabular-nums"
        :class="change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
      >
        {{ change > 0 ? '+' : '' }}{{ change }}
      </span>
    </div>
    <p class="mt-2 text-2xl font-black leading-none tabular-nums" :class="valueClass">
      {{ displayValue }}
    </p>
    <p class="mt-1.5 text-[11px] font-bold leading-snug" :class="labelClass">
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Tone = 'sky' | 'emerald' | 'violet' | 'amber'

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
  sky: {
    surface: 'bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900',
    icon: 'bg-sky-500 text-white',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/80 dark:text-sky-400/80',
  },
  emerald: {
    surface: 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/80 dark:text-emerald-400/80',
  },
  violet: {
    surface: 'bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900',
    icon: 'bg-violet-500 text-white',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/80 dark:text-violet-400/80',
  },
  amber: {
    surface: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900',
    icon: 'bg-amber-500 text-white',
    value: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-600/80 dark:text-amber-400/80',
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
