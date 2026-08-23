<template>
  <div
    class="rounded-xl px-3 py-2.5 flex items-center gap-2.5 border shadow-sm min-w-0"
    :class="surfaceClass"
  >
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
      :class="iconClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[17px] font-black leading-none tabular-nums" :class="valueClass">
        {{ displayValue }}
      </p>
      <p class="mt-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
        {{ label }}
      </p>
    </div>
    <span
      v-if="change != null"
      class="text-[10px] font-black shrink-0"
      :class="change >= 0 ? 'text-emerald-500' : 'text-rose-500'"
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

const toneMap: Record<Tone, { surface: string; icon: string; value: string }> = {
  green: {
    surface: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    surface: 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    value: 'text-violet-700 dark:text-violet-300',
  },
  rose: {
    surface: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
    icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    value: 'text-rose-700 dark:text-rose-300',
  },
  sky: {
    surface: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/50',
    icon: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    value: 'text-sky-700 dark:text-sky-300',
  },
  amber: {
    surface: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
  },
}

const surfaceClass = computed(() => toneMap[props.tone].surface)
const iconClass = computed(() => toneMap[props.tone].icon)
const valueClass = computed(() => toneMap[props.tone].value)

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  return props.value.toLocaleString('ru-RU')
})
</script>
