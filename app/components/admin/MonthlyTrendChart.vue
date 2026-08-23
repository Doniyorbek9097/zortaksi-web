<template>
  <div class="pt-1">
    <p
      v-if="isEmpty"
      class="py-8 text-center text-[12px] font-medium text-slate-400"
    >
      Bu davrda ma'lumot yo'q
    </p>
    <template v-else>
      <div class="flex items-center justify-between gap-2 mb-3 px-1 text-[11px]">
        <span class="font-bold text-slate-600 dark:text-slate-300 min-w-0 truncate">
          {{ displayTitle }}
        </span>
        <span class="font-black tabular-nums text-sky-600 dark:text-sky-400 shrink-0">
          {{ formattedValue(selectedValue) }}
        </span>
      </div>

      <div
        class="relative h-28 w-full rounded-xl bg-sky-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          class="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <path
            v-if="areaPath"
            :d="areaPath"
            fill="#38bdf8"
            fill-opacity="0.2"
          />
          <path
            v-if="linePath"
            :d="linePath"
            fill="none"
            stroke="#0ea5e9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <button
          v-for="(pt, idx) in points"
          :key="`${pt.label}-${idx}`"
          type="button"
          class="absolute w-4 h-4 -ml-2 -mb-2 rounded-full border-2 border-white dark:border-slate-900 transition-transform"
          :class="idx === currentIdx
            ? 'bg-sky-500 scale-110 ring-2 ring-sky-300/60'
            : 'bg-sky-300 dark:bg-sky-600'"
          :style="{ left: `${pt.xPct}%`, bottom: `${pt.yPct}%` }"
          :aria-label="`${items[idx]?.label} ${formattedValue(items[idx]?.value ?? 0)}`"
          @click="selectIdx(idx)"
        />
      </div>

      <div class="flex gap-1 mt-2">
        <button
          v-for="(item, idx) in items"
          :key="`${item.label}-${idx}`"
          type="button"
          class="flex-1 text-center text-[9px] font-bold uppercase py-1 rounded-md transition-colors"
          :class="idx === currentIdx
            ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
          @click="selectIdx(idx)"
        >
          {{ item.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface TrendItem {
  label: string
  value: number
  /** Tanlanganda ko'rsatiladigan qo'shimcha (masalan sana) */
  detail?: string
}

const props = defineProps<{
  items: TrendItem[]
  valueMode?: 'number' | 'amount'
  /** Tanlangan bo'lim sarlavhasi */
  selectedTitle?: string
}>()

const selectedIdx = ref(-1)

const isEmpty = computed(() =>
  props.items.length > 0 && props.items.every((i) => i.value === 0)
)

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1))

const maxIdx = computed(() => {
  const vals = props.items.map((i) => i.value)
  if (!vals.length) return 0
  return vals.reduce((best, v, i) => (v > vals[best] ? i : best), 0)
})

const currentIdx = computed(() => {
  if (selectedIdx.value >= 0 && selectedIdx.value < props.items.length) {
    return selectedIdx.value
  }
  return maxIdx.value
})

const selectedItem = computed(() => props.items[currentIdx.value])
const selectedValue = computed(() => selectedItem.value?.value ?? 0)

const displayTitle = computed(() => {
  const item = selectedItem.value
  if (!item) return '—'
  const prefix = props.selectedTitle || ''
  if (item.detail) {
    return prefix ? `${prefix}: ${item.label} (${item.detail})` : `${item.label} (${item.detail})`
  }
  return prefix ? `${prefix}: ${item.label}` : item.label
})

const selectIdx = (idx: number) => {
  selectedIdx.value = idx
}

watch(
  () => props.items,
  () => {
    selectedIdx.value = -1
  }
)

const points = computed(() => {
  const n = props.items.length
  if (!n) return []
  return props.items.map((item, i) => {
    const ratio = item.value / max.value
    const xPct = n > 1 ? (i / (n - 1)) * 100 : 50
    const yPct = 8 + ratio * 72
    return { xPct, yPct, label: item.label, value: item.value }
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
    return `${value.toLocaleString('ru-RU')} so'm`
  }
  return value.toLocaleString('ru-RU')
}
</script>
