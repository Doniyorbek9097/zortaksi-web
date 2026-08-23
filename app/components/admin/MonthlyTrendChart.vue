<template>
  <div class="pt-1">
    <p
      v-if="isEmpty"
      class="py-10 text-center text-[12px] font-medium text-slate-400"
    >
      Bu davrda ma'lumot yo'q
    </p>
    <template v-else>
      <div class="flex items-end justify-between gap-3 mb-3">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Eng yuqori
          </p>
          <p class="text-xl font-black tabular-nums text-slate-900 dark:text-white mt-0.5">
            {{ peakLabel }}
          </p>
        </div>
        <p class="text-sm font-black tabular-nums text-sky-600 dark:text-sky-400">
          {{ formattedValue(peakValue) }}
        </p>
      </div>

      <div class="relative h-32 w-full rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0" />
            </linearGradient>
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
            stroke="#0284c7"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <div
          v-for="(pt, idx) in points"
          :key="pt.label"
          class="absolute w-3 h-3 -ml-1.5 -mb-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-transform"
          :class="idx === activeIdx ? 'bg-sky-500 scale-110' : 'bg-sky-300 dark:bg-sky-600'"
          :style="{
            left: `${pt.xPct}%`,
            bottom: `${pt.yPct}%`,
          }"
        />
      </div>

      <div class="flex gap-1 mt-2.5">
        <span
          v-for="(item, idx) in items"
          :key="item.label"
          class="flex-1 text-center text-[9px] font-bold uppercase truncate"
          :class="idx === activeIdx ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'"
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
