<template>
  <div class="pt-1">
    <p
      v-if="isEmpty"
      class="py-10 text-center text-[12px] font-medium text-slate-400"
    >
      Bu davrda ma'lumot yo'q
    </p>
    <template v-else>
      <div class="flex items-end justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Eng yuqori oy
          </p>
          <p class="text-lg font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
            {{ peakLabel }}
          </p>
        </div>
        <p class="text-base font-black tabular-nums bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          {{ formattedValue(peakValue) }}
        </p>
      </div>

      <div class="relative h-36 w-full rounded-2xl bg-gradient-to-b from-sky-500/5 to-transparent border border-slate-100 dark:border-slate-800 overflow-hidden">
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full opacity-30"
          aria-hidden="true"
        >
          <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" class="text-slate-300 dark:text-slate-700" stroke-width="0.3" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" class="text-slate-300 dark:text-slate-700" stroke-width="0.3" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" class="text-slate-300 dark:text-slate-700" stroke-width="0.3" />
        </svg>

        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
            </linearGradient>
            <filter id="admin-trend-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            v-if="areaPath"
            :d="areaPath"
            fill="url(#admin-trend-fill)"
          />
          <path
            v-if="linePath"
            :d="linePath"
            fill="none"
            stroke="#0ea5e9"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
            filter="url(#admin-trend-glow)"
          />
        </svg>

        <div
          v-for="(pt, idx) in points"
          :key="pt.label"
          class="absolute w-3.5 h-3.5 -ml-[7px] -mb-[7px] rounded-full border-2 border-white dark:border-slate-900 shadow-md transition-all"
          :class="idx === activeIdx
            ? 'bg-sky-500 ring-4 ring-sky-500/25 scale-110'
            : 'bg-sky-300 dark:bg-sky-600'"
          :style="{
            left: `${pt.xPct}%`,
            bottom: `${pt.yPct}%`,
          }"
        />
      </div>

      <div class="flex gap-1 mt-3">
        <span
          v-for="(item, idx) in items"
          :key="item.label"
          class="flex-1 text-center text-[9px] font-bold uppercase truncate py-1 rounded-md transition-colors"
          :class="idx === activeIdx
            ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
            : 'text-slate-400'"
        >
          {{ item.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface TrendItem {
  label: string
  value: number
}

const props = defineProps<{
  items: TrendItem[]
  valueMode?: 'number' | 'amount'
}>()

const isEmpty = computed(() =>
  props.items.length > 0 && props.items.every((i) => i.value === 0)
)

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1))

const activeIdx = computed(() => {
  const vals = props.items.map((i) => i.value)
  return vals.reduce((best, v, i) => (v > vals[best] ? i : best), 0)
})

const peakValue = computed(() => props.items[activeIdx.value]?.value ?? 0)
const peakLabel = computed(() => props.items[activeIdx.value]?.label ?? '—')

const points = computed(() => {
  const n = props.items.length
  if (!n) return []
  return props.items.map((item, i) => {
    const ratio = item.value / max.value
    const xPct = n > 1 ? (i / (n - 1)) * 100 : 50
    const yPct = 8 + ratio * 72
    return {
      xPct,
      yPct,
      label: item.label,
      value: item.value,
    }
  })
})

const linePath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  return pts
    .map((p, i) => {
      const x = p.xPct
      const y = 80 - p.yPct
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const bottom = 80
  const start = pts[0]
  const end = pts[pts.length - 1]
  return `${linePath.value} L ${end.xPct} ${bottom} L ${start.xPct} ${bottom} Z`
})

const formattedValue = (value: number) => {
  if (props.valueMode === 'amount') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M so'm`
    if (value >= 1000) return `${Math.round(value / 1000)}K so'm`
    return `${value.toLocaleString('ru-RU')} so'm`
  }
  return value.toLocaleString('ru-RU')
}
</script>
