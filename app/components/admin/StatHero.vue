<template>
  <div
    class="rounded-2xl p-4 relative overflow-hidden min-h-[108px] flex flex-col justify-between"
    :class="gradientClass"
  >
    <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div class="absolute right-8 bottom-0 w-16 h-16 rounded-full bg-white/5" />
    <div class="flex items-start justify-between gap-2 relative z-[1]">
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 text-white text-sm shrink-0"
      >
        <font-awesome-icon :icon="icon" />
      </div>
      <span
        v-if="change != null"
        class="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white"
      >
        <font-awesome-icon
          :icon="change >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"
          class="text-[8px]"
        />
        {{ change > 0 ? '+' : '' }}{{ change }}
      </span>
    </div>
    <div class="relative z-[1] mt-2">
      <p class="text-[28px] font-black leading-none tabular-nums text-white">
        {{ displayValue }}
      </p>
      <p class="mt-1.5 text-[11px] font-bold text-white/80 leading-snug">
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
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'sky',
  change: null,
  compact: false,
})

const gradientMap: Record<Tone, string> = {
  sky: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25',
  emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25',
  violet: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25',
  amber: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25',
}

const gradientClass = computed(() => gradientMap[props.tone])

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  if (!props.compact) return props.value.toLocaleString('ru-RU')
  if (props.value >= 1_000_000) return `${Math.round(props.value / 100_000) / 10}M`
  if (props.value >= 1000) return `${Math.round(props.value / 1000)}K`
  return String(props.value)
})
</script>
