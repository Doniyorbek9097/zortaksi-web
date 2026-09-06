<template>
  <div
    ref="rootEl"
    class="ptr-root relative"
    :class="[
      fill ? 'h-full min-h-0' : 'min-h-[100dvh]',
      { 'ptr-pulling': pulling || refreshing },
    ]"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <!-- Indicator -->
    <div
      class="ptr-indicator pointer-events-none absolute left-0 right-0 z-[60] flex justify-center"
      :style="indicatorStyle"
      aria-hidden="true"
    >
      <div
        class="ptr-badge flex items-center gap-2 rounded-full px-3.5 py-2 shadow-lg border backdrop-blur-xl transition-colors"
        :class="refreshing
          ? 'bg-sky-500 text-white border-sky-400/40 shadow-sky-500/30'
          : pullDistance > threshold * 0.85
            ? 'bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-500/25'
            : 'bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'"
      >
        <span class="relative w-5 h-5 flex items-center justify-center">
          <font-awesome-icon
            v-if="refreshing"
            icon="fa-solid fa-spinner"
            class="animate-spin text-sm"
          />
          <font-awesome-icon
            v-else
            icon="fa-solid fa-arrow-down"
            class="text-sm transition-transform duration-150"
            :style="{ transform: `rotate(${arrowDeg}deg)` }"
          />
        </span>
        <span class="text-[11px] font-black tracking-wide uppercase">
          {{ label }}
        </span>
      </div>
    </div>

    <div
      class="ptr-content"
      :class="fill ? 'h-full min-h-0' : ''"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { runPullToRefresh } from '~/composables/usePullToRefresh'

const props = withDefaults(
  defineProps<{
    /** Max pull px */
    maxPull?: number
    /** Refresh threshold */
    threshold?: number
    /** Scroll container selector (masalan chat). Bo'sh — window/document */
    scrollSelector?: string
    disabled?: boolean
    /** Chat kabi fixed shell — to'liq balandlik */
    fill?: boolean
  }>(),
  {
    maxPull: 120,
    threshold: 72,
    scrollSelector: '',
    disabled: false,
    fill: false,
  }
)

const emit = defineEmits<{ refresh: [] }>()

const rootEl = ref<HTMLElement | null>(null)
const pullDistance = ref(0)
const pulling = ref(false)
const refreshing = ref(false)

let startY = 0
let tracking = false
let armed = false

const arrowDeg = computed(() =>
  pullDistance.value >= props.threshold ? 180 : Math.min(180, (pullDistance.value / props.threshold) * 180)
)

const label = computed(() => {
  if (refreshing.value) return 'Yangilanmoqda…'
  if (pullDistance.value >= props.threshold) return 'Qo‘yib yuboring'
  if (pullDistance.value > 12) return 'Yangilash'
  return ''
})

const indicatorStyle = computed(() => {
  const y = Math.max(0, pullDistance.value - 8)
  const opacity = Math.min(1, pullDistance.value / 28)
  return {
    top: `${8 + y * 0.35}px`,
    opacity: String(opacity),
    transform: `scale(${0.86 + Math.min(pullDistance.value, props.threshold) / props.threshold * 0.14})`,
  }
})

const contentStyle = computed(() => ({
  transform: pullDistance.value > 0 ? `translate3d(0, ${pullDistance.value * 0.45}px, 0)` : undefined,
  transition: pulling.value ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
}))

function getScrollTop(): number {
  if (!import.meta.client) return 0
  if (props.scrollSelector) {
    const el = document.querySelector(props.scrollSelector) as HTMLElement | null
    if (el) return el.scrollTop
  }
  const se = document.scrollingElement || document.documentElement
  return se?.scrollTop ?? window.scrollY ?? 0
}

function onTouchStart(e: TouchEvent) {
  if (props.disabled || refreshing.value) return
  if (e.touches.length !== 1) return
  if (getScrollTop() > 2) {
    armed = false
    return
  }
  startY = e.touches[0].clientY
  tracking = true
  armed = true
  pulling.value = false
}

function onTouchMove(e: TouchEvent) {
  if (!tracking || !armed || props.disabled || refreshing.value) return
  if (e.touches.length !== 1) return

  const dy = e.touches[0].clientY - startY
  if (dy <= 0 || getScrollTop() > 2) {
    pullDistance.value = 0
    pulling.value = false
    if (dy <= 0) armed = false
    return
  }

  // Rubber-band
  const dampened = Math.min(props.maxPull, dy * 0.42)
  pullDistance.value = dampened
  pulling.value = true

  if (dampened > 8) {
    e.preventDefault()
  }
}

async function onTouchEnd() {
  if (!tracking) return
  tracking = false
  pulling.value = false

  const shouldRefresh = pullDistance.value >= props.threshold && !props.value && !props.disabled
  if (!shouldRefresh) {
    pullDistance.value = 0
    armed = false
    return
  }

  refreshing.value = true
  pullDistance.value = Math.min(props.threshold, 56)
  emit('refresh')
  try {
    await runPullToRefresh()
  } finally {
    refreshing.value = false
    pullDistance.value = 0
    armed = false
  }
}
</script>

<style scoped>
.ptr-root {
  overscroll-behavior-y: contain;
  overscroll-behavior-x: none;
  -webkit-overflow-scrolling: touch;
  max-width: 100vw;
}
.ptr-content {
  will-change: transform;
  min-height: inherit;
}
.ptr-root.ptr-pulling {
  touch-action: pan-y pinch-zoom;
}
.ptr-badge {
  will-change: transform, opacity;
}
</style>
