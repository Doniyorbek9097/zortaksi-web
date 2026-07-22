<template>
  <div
    class="rounded-2xl px-3 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm"
  >
    <div
      class="w-12 h-12 rounded-full flex items-center justify-center text-lg mb-3"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p class="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
      {{ displayValue }}
    </p>
    <p class="mt-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-snug">
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Tone = 'violet' | 'green' | 'blue' | 'amber' | 'rose' | 'sky'

interface Props {
  value: number | string
  label: string
  icon: string
  tone?: Tone
  /** 849000 → 849K */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'blue',
  compact: false,
})

const toneMap: Record<Tone, string> = {
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  sky: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

const toneClass = computed(() => toneMap[props.tone])

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (!props.compact) return props.value.toLocaleString('ru-RU')
  if (props.value >= 1_000_000) return `${Math.round(props.value / 100_000) / 10}M`
  if (props.value >= 1000) return `${Math.round(props.value / 1000)}K`
  return String(props.value)
})
</script>
