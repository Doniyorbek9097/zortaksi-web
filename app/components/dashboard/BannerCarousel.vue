<template>
  <section v-if="slides.length" class="relative">
    <div
      ref="rootEl"
      class="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm touch-pan-y"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        class="flex transition-transform duration-500 ease-out"
        :class="dragging ? '' : 'duration-500'"
        :style="{ transform: `translate3d(${-index * 100 + dragPct}%, 0, 0)` }"
      >
        <button
          v-for="(slide, i) in slides"
          :key="slide.id"
          type="button"
          class="w-full shrink-0 relative aspect-[3/1] min-h-[108px] sm:min-h-[132px] md:min-h-[160px] block overflow-hidden bg-slate-200 dark:bg-slate-800"
          :aria-label="slide.name"
          @click="openSlide(slide)"
        >
          <img
            :src="slide.src"
            :alt="slide.name"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            draggable="false"
          >
          <div
            v-if="slide.targetUrl"
            class="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/55 to-transparent"
          >
            <p class="text-[11px] font-black text-white truncate text-left">{{ slide.name }}</p>
          </div>
        </button>
      </div>

      <div
        v-if="slides.length > 1"
        class="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none"
      >
        <span
          v-for="(slide, i) in slides"
          :key="`dot-${slide.id}`"
          class="h-1.5 rounded-full transition-all"
          :class="i === index ? 'w-4 bg-white shadow' : 'w-1.5 bg-white/50'"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IBanner } from '~/types/banner'

const props = defineProps<{
  banners: IBanner[]
}>()

const { resolve: resolveMedia } = useMediaUrl()

const slides = computed(() =>
  (props.banners || [])
    .filter((b) => b.active && b.imageUrl)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((b) => ({
      id: b.id,
      name: b.name,
      targetUrl: String(b.targetUrl || '').trim(),
      src: resolveMedia(b.imageUrl) || b.imageUrl,
    })),
)

const index = ref(0)
const rootEl = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

const dragging = ref(false)
const dragPct = ref(0)
let startX = 0
let startY = 0
let axisLocked: 'x' | 'y' | null = null
let moved = false

const clampIndex = (next: number) => {
  const max = slides.value.length
  if (max <= 0) return 0
  return ((next % max) + max) % max
}

const goTo = (next: number) => {
  index.value = clampIndex(next)
}

const tick = () => {
  if (slides.value.length <= 1 || dragging.value) return
  goTo(index.value + 1)
}

const startTimer = () => {
  stopTimer()
  if (slides.value.length <= 1) return
  timer = setInterval(tick, 4500)
}

const stopTimer = () => {
  if (timer) clearInterval(timer)
  timer = null
}

watch(slides, (list) => {
  if (index.value >= list.length) index.value = 0
  startTimer()
}, { immediate: true })

onMounted(startTimer)
onBeforeUnmount(stopTimer)

const openSlide = (slide: { targetUrl: string }) => {
  if (moved) return
  const target = String(slide.targetUrl || '').trim()
  if (!target) return
  if (/^https?:\/\//i.test(target)) {
    window.open(target, '_blank', 'noopener,noreferrer')
    return
  }
  const path = target.startsWith('/') ? target : `/${target}`
  void navigateTo(path)
}

const onPointerDown = (e: PointerEvent) => {
  if (slides.value.length <= 1) return
  dragging.value = true
  moved = false
  axisLocked = null
  startX = e.clientX
  startY = e.clientY
  dragPct.value = 0
  stopTimer()
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || !rootEl.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!axisLocked) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  if (axisLocked !== 'x') return
  moved = Math.abs(dx) > 8
  const width = rootEl.value.clientWidth || 1
  dragPct.value = (dx / width) * 100
}

const onPointerUp = () => {
  if (!dragging.value) return
  dragging.value = false
  if (dragPct.value > 12) goTo(index.value - 1)
  else if (dragPct.value < -12) goTo(index.value + 1)
  dragPct.value = 0
  startTimer()
}
</script>
