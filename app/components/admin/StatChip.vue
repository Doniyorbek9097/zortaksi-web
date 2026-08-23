<template>
  <div
    class="rounded-xl px-3 py-3 flex items-center gap-3 min-w-0 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm border shadow-sm transition-all hover:shadow-md"
    :class="surfaceClass"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm"
      :class="iconClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[18px] font-black leading-none tabular-nums" :class="valueClass">
        {{ displayValue }}
      </p>
      <p class="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">
        {{ label }}
      </p>
    </div>
    <span
      v-if="change != null"
      class="text-[10px] font-black shrink-0 px-1.5 py-0.5 rounded-md"
      :class="change >= 0
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
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
    surface: 'border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-300/80',
    icon: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    surface: 'border-violet-200/70 dark:border-violet-900/40 hover:border-violet-300/80',
    icon: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white',
    value: 'text-violet-700 dark:text-violet-300',
  },
  rose: {
    surface: 'border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300/80',
    icon: 'bg-gradient-to-br from-rose-400 to-pink-500 text-white',
    value: 'text-rose-700 dark:text-rose-300',
  },
  sky: {
    surface: 'border-sky-200/70 dark:border-sky-900/40 hover:border-sky-300/80',
    icon: 'bg-gradient-to-br from-sky-400 to-blue-500 text-white',
    value: 'text-sky-700 dark:text-sky-300',
  },
  amber: {
    surface: 'border-amber-200/70 dark:border-amber-900/40 hover:border-amber-300/80',
    icon: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
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
