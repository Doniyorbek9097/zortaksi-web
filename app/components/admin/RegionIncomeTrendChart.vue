<template>
  <div class="pt-1">
    <p
      v-if="isEmpty"
      class="py-8 text-center text-[12px] font-medium text-slate-400"
    >
      Bu davrda guruh daromadi yo'q
    </p>
    <template v-else>
      <div class="flex items-center justify-between gap-2 mb-3 px-1 text-[11px]">
        <span class="font-bold text-slate-600 dark:text-slate-300 min-w-0 truncate">
          {{ displayTitle }}
        </span>
        <span class="font-black tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">
          {{ formattedTotal }}
        </span>
      </div>

      <div
        class="relative h-32 w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <path
            v-for="line in linePaths"
            :key="line.slug"
            :d="line.path"
            fill="none"
            :stroke="line.color"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
            :opacity="line.dimmed ? 0.25 : 1"
          />
        </svg>
        <button
          v-for="dot in dots"
          :key="`${dot.slug}-${dot.idx}`"
          type="button"
          class="absolute w-3 h-3 -ml-1.5 -mb-1.5 rounded-full border-2 border-white dark:border-slate-900 transition-transform"
          :class="dot.idx === currentIdx ? 'scale-125 ring-2 ring-white/70' : ''"
          :style="{
            left: `${dot.xPct}%`,
            bottom: `${dot.yPct}%`,
            backgroundColor: dot.color,
            opacity: dot.dimmed ? 0.35 : 1,
          }"
          :aria-label="`${dot.title} ${dot.label} ${formatAmount(dot.value)}`"
          @click="selectIdx(dot.idx)"
        />
      </div>

      <div class="flex gap-1 mt-2">
        <button
          v-for="(label, idx) in labels"
          :key="`${label}-${idx}`"
          type="button"
          class="flex-1 text-center text-[9px] font-bold uppercase py-1 rounded-md transition-colors"
          :class="idx === currentIdx
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          @click="selectIdx(idx)"
        >
          {{ label }}
        </button>
      </div>

      <ul class="mt-3 space-y-1.5">
        <li
          v-for="region in regionsWithColor"
          :key="region.slug"
          class="flex items-center justify-between gap-2 text-[11px]"
        >
          <span class="flex items-center gap-2 min-w-0">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: region.color }"
            />
            <span class="font-semibold text-slate-700 dark:text-slate-300 truncate">
              {{ region.title }}
            </span>
          </span>
          <span class="font-black tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
            {{ formatAmount(region.amounts[currentIdx] ?? 0) }}
          </span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
export interface RegionIncomeSeries {
  slug: string
  title: string
  amounts: number[]
  payments?: number[]
}

export interface RegionIncomeChartData {
  labels: string[]
  months?: { label: string; detail?: string }[]
  regions: RegionIncomeSeries[]
}

const REGION_COLORS = [
  '#f59e0b',
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#f43f5e',
  '#eab308',
  '#06b6d4',
  '#ec4899',
]

const props = defineProps<{
  chart: RegionIncomeChartData | null | undefined
}>()

const selectedIdx = ref(-1)

const labels = computed(() => props.chart?.labels ?? [])
const regions = computed(() => props.chart?.regions ?? [])

const regionsWithColor = computed(() =>
  regions.value.map((region, idx) => ({
    ...region,
    color: REGION_COLORS[idx % REGION_COLORS.length],
  })),
)

const isEmpty = computed(() => {
  if (!regions.value.length) return true
  return regions.value.every((r) => r.amounts.every((v) => v === 0))
})

const globalMax = computed(() => {
  const vals = regions.value.flatMap((r) => r.amounts)
  return Math.max(...vals, 1)
})

const maxIdx = computed(() => {
  if (!labels.value.length) return 0
  const totals = labels.value.map((_, idx) =>
    regions.value.reduce((sum, r) => sum + (r.amounts[idx] ?? 0), 0),
  )
  return totals.reduce((best, v, i) => (v > totals[best] ? i : best), 0)
})

const currentIdx = computed(() => {
  if (selectedIdx.value >= 0 && selectedIdx.value < labels.value.length) {
    return selectedIdx.value
  }
  return maxIdx.value
})

const monthDetail = computed(() => props.chart?.months?.[currentIdx.value]?.detail ?? '')

const displayTitle = computed(() => {
  const label = labels.value[currentIdx.value] ?? '—'
  return monthDetail.value ? `${label} ${monthDetail.value}` : label
})

const formattedTotal = computed(() => {
  const total = regions.value.reduce(
    (sum, r) => sum + (r.amounts[currentIdx.value] ?? 0),
    0,
  )
  return formatAmount(total)
})

const selectIdx = (idx: number) => {
  selectedIdx.value = idx
}

watch(
  () => props.chart,
  () => {
    selectedIdx.value = -1
  },
)

const buildPoints = (amounts: number[]) => {
  const n = amounts.length
  if (!n) return []
  return amounts.map((value, i) => {
    const ratio = value / globalMax.value
    const xPct = n > 1 ? (i / (n - 1)) * 100 : 50
    const yPct = 8 + ratio * 72
    return { xPct, yPct, value, idx: i }
  })
}

const linePaths = computed(() =>
  regionsWithColor.value.map((region) => ({
    slug: region.slug,
    color: region.color,
    dimmed: false,
    path: buildPoints(region.amounts)
      .map((p, i) => {
        const x = p.xPct
        const y = 80 - p.yPct
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' '),
  })),
)

const dots = computed(() =>
  regionsWithColor.value.flatMap((region) =>
    buildPoints(region.amounts).map((p) => ({
      slug: region.slug,
      title: region.title,
      color: region.color,
      label: labels.value[p.idx] ?? '',
      value: p.value,
      xPct: p.xPct,
      yPct: p.yPct,
      idx: p.idx,
      dimmed: false,
    })),
  ),
)

const formatAmount = (value: number) =>
  `${(Number(value) || 0).toLocaleString('ru-RU')} so'm`
</script>
