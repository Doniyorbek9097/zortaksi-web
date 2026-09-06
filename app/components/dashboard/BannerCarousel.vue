<template>
  <section v-if="slides.length" class="relative">
    <div
      ref="rootEl"
      class="relative overflow-hidden rounded-2xl shadow-md shadow-slate-900/10 dark:shadow-black/30 ring-1 ring-slate-200/80 dark:ring-slate-700/80 bg-slate-900 touch-pan-y"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div
        class="flex ease-out"
        :class="dragging ? 'transition-none' : 'transition-transform duration-500'"
        :style="{ transform: `translate3d(${-index * 100 + dragPct}%, 0, 0)` }"
      >
        <button
          v-for="slide in slides"
          :key="slide.id"
          type="button"
          class="w-full shrink-0 relative aspect-[2.4/1] sm:aspect-[2.6/1] min-h-[120px] sm:min-h-[140px] block overflow-hidden bg-slate-800"
          :class="slide.targetUrl ? 'cursor-pointer active:opacity-95' : 'cursor-default'"
          :aria-label="slide.targetUrl ? 'Banner' : 'Reklama'"
          @click="openSlide(slide)"
        >
          <img
            :src="slide.src"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            draggable="false"
          >
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"
          />
        </button>
      </div>

      <div
        v-if="slides.length > 1"
        class="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none"
      >
        <div
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-md"
        >
          <button
            v-for="(slide, i) in slides"
            :key="`dot-${slide.id}`"
            type="button"
            class="rounded-full transition-all duration-300 pointer-events-auto"
            :class="i === index
              ? 'w-5 h-1.5 bg-white shadow-sm'
              : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/70'"
            :aria-label="`${i + 1}-banner`"
            @click.stop="goTo(i)"
          />
        </div>
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
  timer = setInterval(tick, 5000)
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
