<template>
  <div
    class="rounded-xl px-2.5 py-2 flex items-center gap-2 min-w-0 border"
    :class="surfaceClass"
  >
    <div
      class="w-6 h-6 rounded-md flex items-center justify-center text-[9px] shrink-0"
      :class="iconClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[14px] font-black leading-none tabular-nums truncate" :class="valueClass">
        {{ displayValue }}
      </p>
      <p class="mt-0.5 text-[9px] font-bold leading-tight line-clamp-2" :class="labelClass">
        {{ label }}
      </p>
    </div>
    <span
      v-if="change != null"
      class="text-[9px] font-black shrink-0 tabular-nums"
      :class="change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
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
    surface: 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-100/70 dark:border-emerald-900/35',
    icon: 'bg-emerald-500/90 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/75 dark:text-emerald-400/75',
  },
  violet: {
    surface: 'bg-violet-50/70 dark:bg-violet-950/25 border-violet-100/70 dark:border-violet-900/35',
    icon: 'bg-violet-500/90 text-white',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/75 dark:text-violet-400/75',
  },
  rose: {
    surface: 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-100/70 dark:border-rose-900/35',
    icon: 'bg-rose-500/90 text-white',
    value: 'text-rose-700 dark:text-rose-300',
    label: 'text-rose-600/75 dark:text-rose-400/75',
  },
  sky: {
    surface: 'bg-sky-50/70 dark:bg-sky-950/25 border-sky-100/70 dark:border-sky-900/35',
    icon: 'bg-sky-500/90 text-white',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/75 dark:text-sky-400/75',
  },
  amber: {
    surface: 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-100/70 dark:border-amber-900/35',
    icon: 'bg-amber-500/90 text-white',
    value: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-600/75 dark:text-amber-400/75',
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
