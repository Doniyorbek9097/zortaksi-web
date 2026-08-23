<template>
  <div
    class="rounded-2xl p-4 relative overflow-hidden min-h-[112px] flex flex-col justify-between border border-white/20"
    :class="gradientClass"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.22),transparent_55%)] pointer-events-none" />
    <div class="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />

    <div class="flex items-start justify-between gap-2 relative z-[1]">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm text-white text-sm shrink-0 ring-1 ring-white/30"
      >
        <font-awesome-icon :icon="icon" />
      </div>
      <span
        v-if="change != null"
        class="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm text-white ring-1 ring-white/20"
      >
        <font-awesome-icon
          :icon="change >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"
          class="text-[8px]"
        />
        {{ change > 0 ? '+' : '' }}{{ change }}
      </span>
    </div>
    <div class="relative z-[1] mt-3">
      <p class="text-[30px] font-black leading-none tabular-nums text-white drop-shadow-sm">
        {{ displayValue }}
      </p>
      <p class="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75 leading-snug">
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
  sky: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-xl shadow-sky-600/30',
  emerald: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-xl shadow-emerald-600/30',
  violet: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 shadow-xl shadow-violet-600/30',
  amber: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 shadow-xl shadow-amber-600/30',
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
