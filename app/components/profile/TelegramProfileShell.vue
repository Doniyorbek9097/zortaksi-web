<template>
  <div
    class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    style="--zt-hero-h: min(52vh, 440px)"
  >
    <div v-if="loading" class="min-h-[100dvh] flex items-center justify-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-slate-400" />
    </div>

    <template v-else-if="profile">
      <section class="relative h-[var(--zt-hero-h)] bg-slate-950 shrink-0 overflow-hidden">
        <div
          v-if="slides.length"
          ref="viewportRef"
          class="gallery-viewport h-full w-full touch-none select-none"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <div class="gallery-strip h-full" :style="stripStyle">
            <div
              v-for="(src, i) in slides"
              :key="`slide-${i}`"
              class="gallery-slide"
            >
              <img
                :src="src"
                :alt="`${profile.name} ${i + 1}`"
                class="gallery-img"
                draggable="false"
                loading="eager"
                decoding="async"
                @error="onImgError(src)"
              >
            </div>
          </div>
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 text-white text-5xl font-black"
        >
          {{ profile.name?.trim()?.[0]?.toUpperCase() || '?' }}
        </div>

        <button
          type="button"
          class="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center active:scale-95 backdrop-blur-sm"
          aria-label="Orqaga"
          @click="$emit('back')"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <div
          v-if="slides.length > 1"
          class="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30"
        >
          <span class="px-2.5 py-1 rounded-full bg-black/45 text-white text-[12px] font-bold tabular-nums backdrop-blur-sm">
            {{ activePhoto + 1 }}/{{ slides.length }}
          </span>
        </div>

        <div
          v-if="refreshing"
          class="absolute right-3 top-[max(2.75rem,env(safe-area-inset-top))] z-30"
        >
          <span class="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm">
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-[11px]" />
          </span>
        </div>

        <div class="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-16 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none">
          <h1 class="text-[24px] font-black text-white leading-tight truncate">
            {{ profile.name }}
          </h1>
          <p
            class="text-[12px] font-medium mt-0.5"
            :class="profile.presence.online ? 'text-emerald-300' : 'text-white/75'"
          >
            {{ profile.presence.online ? 'onlayn' : profile.presence.label }}
          </p>
        </div>
      </section>

      <div class="relative z-10 bg-slate-100 dark:bg-slate-950 pb-10">
        <div class="px-3 pt-3">
          <slot name="actions">
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all"
                @click="$emit('message')"
              >
                <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-[13px]" />
                </span>
                <span class="text-[12px] font-bold">Xabar</span>
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
                :disabled="!telHref"
                @click="$emit('call')"
              >
                <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-phone" class="text-[13px]" />
                </span>
                <span class="text-[12px] font-bold">Chaqiruv</span>
              </button>
            </div>
          </slot>
        </div>

        <section class="mx-3 mt-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div v-if="displayPhone" class="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <p class="text-[16px] font-semibold text-sky-500 dark:text-sky-400 tabular-nums">
              {{ displayPhone }}
            </p>
            <p class="text-[12px] font-medium text-slate-400 mt-1">Mobil raqam</p>
          </div>

          <div v-if="profile.bio" class="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <p class="text-[15px] font-medium leading-relaxed whitespace-pre-wrap break-words">
              {{ profile.bio }}
            </p>
            <p class="text-[12px] font-medium text-slate-400 mt-1.5">Tarjimayi hol</p>
          </div>

          <div v-if="profile.username" class="px-4 py-3.5 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[16px] font-semibold text-sky-500 dark:text-sky-400 truncate">
                @{{ profile.username }}
              </p>
              <p class="text-[12px] font-medium text-slate-400 mt-1">Foydalanuvchi nomi</p>
            </div>
            <a
              v-if="telegramHref"
              :href="telegramHref"
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95"
              aria-label="Telegram"
            >
              <font-awesome-icon icon="fa-brands fa-telegram" class="text-lg text-sky-500" />
            </a>
          </div>

          <div
            v-if="!displayPhone && !profile.bio && !profile.username"
            class="px-4 py-8 text-center text-[13px] font-medium text-slate-400"
          >
            Qo'shimcha ma'lumot yo'q
          </div>
        </section>

        <div v-if="$slots.extra" class="mx-3 mt-3 space-y-3">
          <slot name="extra" />
        </div>
      </div>
    </template>

    <div v-else class="min-h-[100dvh] flex flex-col items-center justify-center gap-3 px-6">
      <p class="text-sm font-bold text-red-500 text-center">{{ error || 'Profil topilmadi' }}</p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-black active:scale-95"
        @click="$emit('back')"
      >
        Orqaga
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TelegramUserProfile } from '~/composables/useTelegramUserProfile'
import { normalizeTo998 } from '~/utils/phone'

const props = defineProps<{
  profile: TelegramUserProfile | null
  photoUrls: string[]
  loading?: boolean
  refreshing?: boolean
  error?: string
  telHref?: string
}>()

defineEmits<{
  back: []
  message: []
  call: []
}>()

const viewportRef = ref<HTMLElement | null>(null)
const activePhoto = ref(0)
const failedUrls = ref<Set<string>>(new Set())
const dragging = ref(false)
const dragPx = ref(0)
let pointerStartX = 0
let pointerId: number | null = null

const slides = computed(() =>
  props.photoUrls.filter((url) => Boolean(url) && !failedUrls.value.has(url)),
)

const stripStyle = computed(() => {
  const vw = viewportRef.value?.clientWidth || 1
  const dragPercent = dragging.value ? (dragPx.value / vw) * 100 : 0
  const base = -(activePhoto.value * 100)
  return {
    transform: `translate3d(${base + dragPercent}%, 0, 0)`,
    transition: dragging.value ? 'none' : 'transform 0.22s ease-out',
  }
})

const displayPhone = computed(() => {
  const raw = String(props.profile?.phone || '').replace(/\D/g, '')
  if (!raw) return ''
  const n = normalizeTo998(raw) || raw
  if (n.length === 12 && n.startsWith('998')) {
    return `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8, 10)} ${n.slice(10)}`
  }
  return `+${n}`
})

const telegramHref = computed(() => {
  const u = props.profile?.username
  if (u) return `https://t.me/${u.replace(/^@/, '')}`
  const id = props.profile?.userId
  return id ? `https://t.me/+${id}` : ''
})

const clampActive = () => {
  const max = Math.max(0, slides.value.length - 1)
  if (activePhoto.value > max) activePhoto.value = max
}

const onImgError = (src: string) => {
  failedUrls.value = new Set([...failedUrls.value, src])
  clampActive()
}

const onPointerDown = (e: PointerEvent) => {
  if (slides.value.length <= 1) return
  dragging.value = true
  pointerStartX = e.clientX
  dragPx.value = 0
  pointerId = e.pointerId
  viewportRef.value?.setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || e.pointerId !== pointerId) return
  dragPx.value = e.clientX - pointerStartX
}

const onPointerUp = (e: PointerEvent) => {
  if (!dragging.value || e.pointerId !== pointerId) return
  dragging.value = false
  pointerId = null

  const w = viewportRef.value?.clientWidth || 1
  const threshold = Math.max(48, w * 0.15)

  if (dragPx.value <= -threshold && activePhoto.value < slides.value.length - 1) {
    activePhoto.value += 1
  } else if (dragPx.value >= threshold && activePhoto.value > 0) {
    activePhoto.value -= 1
  }

  dragPx.value = 0
  viewportRef.value?.releasePointerCapture(e.pointerId)
}

watch(
  () => props.profile?.userId,
  () => {
    activePhoto.value = 0
    failedUrls.value = new Set()
    dragPx.value = 0
    dragging.value = false
  },
)

watch(slides, (next, prev) => {
  if (!prev?.length || next[0] !== prev[0] || next.length !== prev.length) {
    activePhoto.value = 0
  }
  clampActive()
})
</script>

<style scoped>
.gallery-viewport {
  overflow: hidden;
  touch-action: none;
}

.gallery-strip {
  display: flex;
  height: 100%;
  width: 100%;
  will-change: transform;
}

.gallery-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020617;
}

.gallery-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}
</style>
