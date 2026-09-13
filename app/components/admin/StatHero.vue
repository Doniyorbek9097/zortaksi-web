<template>
  <div
    class="rounded-xl px-2.5 py-2 flex items-center gap-2 border"
    :class="surfaceClass"
  >
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] shrink-0 shadow-sm"
      :class="iconClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-1 min-w-0">
        <p class="text-[16px] font-black leading-none tabular-nums truncate" :class="valueClass">
          {{ displayValue }}
        </p>
        <span
          v-if="change != null"
          class="text-[9px] font-black tabular-nums shrink-0"
          :class="change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
        >
          {{ change > 0 ? '+' : '' }}{{ change }}
        </span>
      </div>
      <p class="mt-0.5 text-[9px] font-bold leading-tight line-clamp-2" :class="labelClass">
        {{ label }}
      </p>
    </div>
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
    surface: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-100/80 dark:border-sky-900/40',
    icon: 'bg-sky-500 text-white',
    value: 'text-sky-700 dark:text-sky-300',
    label: 'text-sky-600/75 dark:text-sky-400/75',
  },
  emerald: {
    surface: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100/80 dark:border-emerald-900/40',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600/75 dark:text-emerald-400/75',
  },
  violet: {
    surface: 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-100/80 dark:border-violet-900/40',
    icon: 'bg-violet-500 text-white',
    value: 'text-violet-700 dark:text-violet-300',
    label: 'text-violet-600/75 dark:text-violet-400/75',
  },
  amber: {
    surface: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-100/80 dark:border-amber-900/40',
    icon: 'bg-amber-500 text-white',
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
