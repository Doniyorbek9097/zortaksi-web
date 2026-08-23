<template>
  <div
    class="rounded-2xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center gap-3 min-h-[76px]"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center text-base shrink-0"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-2 flex-wrap">
        <p class="text-[22px] sm:text-2xl font-black leading-none tabular-nums" :class="valueClass">
          {{ displayValue }}
        </p>
        <span
          v-if="change != null"
          class="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md"
          :class="changeBadgeClass"
        >
          <font-awesome-icon
            :icon="change >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"
            class="text-[9px]"
          />
          {{ changeLabel }}
        </span>
      </div>
      <p class="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug">
        {{ label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
type Tone = 'violet' | 'green' | 'blue' | 'amber' | 'rose' | 'sky' | 'pink' | 'emerald'

interface Props {
  value: number | string
  label: string
  icon: string
  tone?: Tone
  /** 849000 → 849K */
  compact?: boolean
  /** O'sish/kamayish (+3 yoki -2) */
  change?: number | null
  /** 'absolute' | 'percent' */
  changeMode?: 'absolute' | 'percent'
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'blue',
  compact: false,
  change: null,
  changeMode: 'absolute',
})

const toneMap: Record<Tone, string> = {
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  amber: 'bg-orange-500/15 text-orange-500 dark:text-orange-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  sky: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  pink: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  emerald: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
}

const valueColorMap: Record<Tone, string> = {
  violet: 'text-violet-600 dark:text-violet-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  blue: 'text-sky-600 dark:text-sky-400',
  amber: 'text-orange-500 dark:text-orange-400',
  rose: 'text-rose-600 dark:text-rose-400',
  sky: 'text-cyan-600 dark:text-cyan-400',
  pink: 'text-pink-600 dark:text-pink-400',
  emerald: 'text-teal-600 dark:text-teal-400',
}

const toneClass = computed(() => toneMap[props.tone])
const valueClass = computed(() => valueColorMap[props.tone])

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (!props.compact) return props.value.toLocaleString('ru-RU')
  if (props.value >= 1_000_000) return `${Math.round(props.value / 100_000) / 10}M`
  if (props.value >= 1000) return `${Math.round(props.value / 1000)}K`
  return String(props.value)
})

const changeLabel = computed(() => {
  if (props.change == null) return ''
  const sign = props.change > 0 ? '+' : ''
  if (props.changeMode === 'percent') return `${sign}${props.change}%`
  return `${sign}${props.change}`
})

const changeBadgeClass = computed(() => {
  if (props.change == null || props.change === 0) {
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800'
  }
  return props.change > 0
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
})
</script>
