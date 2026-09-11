<template>
  <div class="pt-1">
    <p
      v-if="isEmpty"
      class="py-8 text-center text-[12px] font-medium text-slate-400"
    >
      Bu davrda guruh daromadi yo'q
    </p>
    <template v-else>
      <p class="mb-3 px-1 text-[12px] font-black text-slate-700 dark:text-slate-200">
        {{ displayTitle }}
      </p>

      <div
        class="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80
               bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
      >
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <line
            v-for="grid in gridLines"
            :key="grid"
            x1="0"
            :y1="grid"
            x2="100"
            :y2="grid"
            stroke="currentColor"
            class="text-slate-200/80 dark:text-slate-700/60"
            stroke-width="0.35"
            vector-effect="non-scaling-stroke"
          />
          <line
            v-if="selectedLineX !== null"
            :x1="selectedLineX"
            y1="4"
            :x2="selectedLineX"
            y2="76"
            stroke="currentColor"
            class="text-emerald-400/50 dark:text-emerald-500/40"
            stroke-width="0.6"
            stroke-dasharray="2 2"
            vector-effect="non-scaling-stroke"
          />
          <path
            v-for="area in areaPaths"
            :key="`area-${area.slug}`"
            :d="area.path"
            :fill="area.color"
            :opacity="area.opacity"
          />
          <path
            v-for="line in linePaths"
            :key="line.slug"
            :d="line.path"
            fill="none"
            :stroke="line.color"
            stroke-width="2.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
            :opacity="line.opacity"
          />
        </svg>
        <button
          v-for="dot in dots"
          :key="`${dot.slug}-${dot.idx}`"
          type="button"
          class="absolute rounded-full border-2 border-white dark:border-slate-900 transition-all"
          :class="dot.idx === currentIdx
            ? 'w-3.5 h-3.5 -ml-[7px] -mb-[7px] ring-2 ring-white/80 shadow-md'
            : 'w-2.5 h-2.5 -ml-[5px] -mb-[5px]'"
          :style="{
            left: `${dot.xPct}%`,
            bottom: `${dot.yPct}%`,
            backgroundColor: dot.color,
            opacity: dot.opacity,
          }"
          :aria-label="`${dot.title} ${dot.label} ${formatAmount(dot.value)}`"
          @click="selectIdx(dot.idx)"
        />
      </div>

      <div class="flex gap-1 mt-2.5">
        <button
          v-for="(label, idx) in labels"
          :key="`${label}-${idx}`"
          type="button"
          class="flex-1 text-center text-[9px] font-bold uppercase py-1.5 rounded-lg transition-all"
          :class="idx === currentIdx
            ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/25'
            : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'"
          @click="selectIdx(idx)"
        >
          {{ label }}
        </button>
      </div>

      <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          v-for="region in rankedRegions"
          :key="region.slug"
          type="button"
          class="rounded-xl border p-2.5 text-left transition-all active:scale-[0.99]"
          :class="focusSlug === region.slug
            ? 'border-emerald-400/80 bg-emerald-50/80 dark:bg-emerald-950/25 shadow-sm'
            : 'border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'"
          @click="toggleFocus(region.slug)"
          @mouseenter="hoverSlug = region.slug"
          @mouseleave="hoverSlug = ''"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-1 h-9 rounded-full shrink-0"
              :style="{ backgroundColor: region.color }"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {{ region.title }}
              </p>
              <p class="text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{{ formatCount(region.count) }} a'zo</span>
                <span class="text-slate-300 dark:text-slate-600 mx-1">·</span>
                <span class="text-sky-600 dark:text-sky-400">{{ formatCount(region.active) }} faol</span>
              </p>
              <p class="text-[11px] font-black tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1">Shu oy</span>
                {{ formatAmount(region.amount) }}
              </p>
              <p class="text-[10px] font-semibold tabular-nums text-slate-400 dark:text-slate-500 mt-0.5">
                Jami {{ formatAmount(region.totalIncome ?? 0) }}
              </p>
            </div>
            <span class="text-[10px] font-black tabular-nums text-slate-400 shrink-0 self-start mt-0.5">
              {{ region.share }}%
            </span>
          </div>
          <div class="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{
                width: `${region.share}%`,
                backgroundColor: region.color,
              }"
            />
          </div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
export interface RegionIncomeSeries {
  slug: string
  title: string
  amounts: number[]
  payments?: number[]
  count?: number
  active?: number
  totalIncome?: number
  totalIncomePayments?: number
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
const hoverSlug = ref('')
const focusSlug = ref('')

const labels = computed(() => props.chart?.labels ?? [])
const regions = computed(() => props.chart?.regions ?? [])

const regionsWithColor = computed(() =>
  regions.value.map((region, idx) => ({
    ...region,
    color: REGION_COLORS[idx % REGION_COLORS.length],
  })),
)

const isEmpty = computed(() => !regions.value.length)

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

const activeHighlight = computed(() => focusSlug.value || hoverSlug.value)

const monthDetail = computed(() => props.chart?.months?.[currentIdx.value]?.detail ?? '')

const displayTitle = computed(() => {
  const label = labels.value[currentIdx.value] ?? '—'
  return monthDetail.value ? `${label} ${monthDetail.value}` : label
})

const monthTotal = computed(() =>
  regions.value.reduce((sum, r) => sum + (r.amounts[currentIdx.value] ?? 0), 0),
)

const rankedRegions = computed(() => {
  const total = Math.max(monthTotal.value, 1)
  return regionsWithColor.value
    .map((region) => {
      const amount = region.amounts[currentIdx.value] ?? 0
      return {
        ...region,
        amount,
        share: Math.round((amount / total) * 100),
      }
    })
    .sort((a, b) => b.amount - a.amount)
})

const selectedLineX = computed(() => {
  const n = labels.value.length
  if (!n) return null
  return n > 1 ? (currentIdx.value / (n - 1)) * 100 : 50
})

const gridLines = [20, 40, 60]

const selectIdx = (idx: number) => {
  selectedIdx.value = idx
}

const toggleFocus = (slug: string) => {
  focusSlug.value = focusSlug.value === slug ? '' : slug
}

watch(
  () => props.chart,
  () => {
    selectedIdx.value = -1
    focusSlug.value = ''
    hoverSlug.value = ''
  },
)

const lineOpacity = (slug: string) => {
  const active = activeHighlight.value
  if (!active) return 1
  return active === slug ? 1 : 0.2
}

const buildPoints = (amounts: number[]) => {
  const n = amounts.length
  if (!n) return []
  return amounts.map((value, i) => {
    const ratio = value / globalMax.value
    const xPct = n > 1 ? (i / (n - 1)) * 100 : 50
    const yPct = 10 + ratio * 68
    return { xPct, yPct, value, idx: i }
  })
}

const linePaths = computed(() =>
  regionsWithColor.value.map((region) => ({
    slug: region.slug,
    color: region.color,
    opacity: lineOpacity(region.slug),
    path: buildPoints(region.amounts)
      .map((p, i) => {
        const x = p.xPct
        const y = 80 - p.yPct
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' '),
  })),
)

const areaPaths = computed(() =>
  linePaths.value.map((line) => {
    const pts = buildPoints(
      regionsWithColor.value.find((r) => r.slug === line.slug)?.amounts ?? [],
    )
    if (!pts.length) return { slug: line.slug, color: line.color, opacity: 0, path: '' }
    const bottom = 80
    const start = pts[0]
    const end = pts[pts.length - 1]
    const lineStr = pts
      .map((p, i) => {
        const x = p.xPct
        const y = 80 - p.yPct
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
    return {
      slug: line.slug,
      color: line.color,
      opacity: lineOpacity(line.slug) * 0.12,
      path: `${lineStr} L ${end.xPct} ${bottom} L ${start.xPct} ${bottom} Z`,
    }
  }),
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
      opacity: lineOpacity(region.slug),
    })),
  ),
)

const formatAmount = (value: number) =>
  `${(Number(value) || 0).toLocaleString('ru-RU')} so'm`

const formatCount = (value?: number) => (Number(value) || 0).toLocaleString('ru-RU')
</script>
