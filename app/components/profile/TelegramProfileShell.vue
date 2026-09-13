<template>
  <div
    class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    style="--zt-hero-h: min(48vh, 400px)"
  >
    <div v-if="loading" class="min-h-[100dvh] flex items-center justify-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-slate-400" />
    </div>

    <template v-else-if="profile">
      <!-- Qotib turuvchi rasm (scroll paytida joyida qoladi) -->
      <div
        class="fixed inset-x-0 top-0 z-0 h-[var(--zt-hero-h)] bg-slate-900"
        aria-hidden="false"
      >
        <div
          v-if="visiblePhotos.length"
          ref="galleryEl"
          class="h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          @scroll="onGalleryScroll"
        >
          <div
            v-for="(src, i) in visiblePhotos"
            :key="`${src}-${i}`"
            class="inline-block w-full h-full snap-center align-top"
          >
            <img :src="src" :alt="profile.name" class="w-full h-full object-cover">
          </div>
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 text-white text-5xl font-black"
        >
          {{ profile.name?.trim()?.[0]?.toUpperCase() || '?' }}
        </div>

        <!-- Progress chiziqlar -->
        <div
          v-if="visiblePhotos.length > 1"
          class="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-none"
        >
          <span
            v-for="(_, i) in visiblePhotos"
            :key="i"
            class="h-0.5 flex-1 rounded-full transition-colors"
            :class="i === activePhoto ? 'bg-white' : 'bg-white/35'"
          />
        </div>

        <!-- Orqaga -->
        <button
          type="button"
          class="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 w-9 h-9 rounded-full bg-black/35 text-white flex items-center justify-center active:scale-95"
          aria-label="Orqaga"
          @click="$emit('back')"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <!-- Ism va holat -->
        <div class="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          <h1 class="text-[26px] font-black text-white leading-tight truncate">
            {{ profile.name }}
          </h1>
          <p
            class="text-[13px] font-medium mt-0.5"
            :class="profile.presence.online ? 'text-emerald-300' : 'text-white/75'"
          >
            {{ profile.presence.online ? 'onlayn' : profile.presence.label }}
          </p>
        </div>
      </div>

      <!-- Scroll — kontent rasm ustidan ko'tariladi -->
      <div class="relative z-10 min-h-[100dvh]">
        <div class="h-[calc(var(--zt-hero-h)-3.5rem)]" aria-hidden="true" />

        <div class="rounded-t-[1.75rem] bg-slate-100 dark:bg-slate-950 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] min-h-[55vh] pb-10">
          <!-- Galereya navigatsiyasi — rasm ostida -->
          <div
            v-if="visiblePhotos.length > 1"
            class="flex items-center justify-between px-4 pt-3 pb-1"
          >
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
              :disabled="activePhoto <= 0"
              aria-label="Oldingi rasm"
              @click="slidePrev"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-left" />
            </button>
            <span class="text-[12px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
              {{ activePhoto + 1 }} / {{ visiblePhotos.length }}
            </span>
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 disabled:opacity-30"
              :disabled="activePhoto >= visiblePhotos.length - 1"
              aria-label="Keyingi rasm"
              @click="slideNext"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-right" />
            </button>
          </div>

          <!-- Tezkor tugmalar -->
          <div class="px-3 pt-2">
            <slot name="actions">
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-800/95 dark:bg-slate-900 text-white active:scale-[0.98] transition-transform"
                  @click="$emit('message')"
                >
                  <font-awesome-icon icon="fa-solid fa-comment" class="text-lg" />
                  <span class="text-[11px] font-bold">Xabar</span>
                </button>
                <button
                  type="button"
                  class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-800/95 dark:bg-slate-900 text-white active:scale-[0.98] transition-transform disabled:opacity-40"
                  :disabled="!telHref"
                  @click="$emit('call')"
                >
                  <font-awesome-icon icon="fa-solid fa-phone" class="text-lg" />
                  <span class="text-[11px] font-bold">Chaqiruv</span>
                </button>
              </div>
            </slot>
          </div>

          <!-- Asosiy ma'lumotlar -->
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

          <!-- Haydovchi / admin qo'shimcha bloklari -->
          <div v-if="$slots.extra" class="mx-3 mt-3 space-y-3">
            <slot name="extra" />
          </div>
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
import { normalizeTelHref, normalizeTo998 } from '~/utils/phone'

const props = defineProps<{
  profile: TelegramUserProfile | null
  photoUrls: string[]
  loading?: boolean
  error?: string
  telHref?: string
}>()

defineEmits<{
  back: []
  message: []
  call: []
}>()

const galleryEl = ref<HTMLElement | null>(null)
const activePhoto = ref(0)
const broken = ref<Set<number>>(new Set())

const visiblePhotos = computed(() =>
  props.photoUrls.filter((_, i) => !broken.value.has(i))
)

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

const onGalleryScroll = () => {
  const el = galleryEl.value
  if (!el || !visiblePhotos.value.length) return
  const w = el.clientWidth || 1
  activePhoto.value = Math.max(
    0,
    Math.min(visiblePhotos.value.length - 1, Math.round(el.scrollLeft / w)),
  )
}

const scrollToPhoto = (index: number) => {
  const el = galleryEl.value
  if (!el) return
  const w = el.clientWidth || 1
  el.scrollTo({ left: w * index, behavior: 'smooth' })
  activePhoto.value = index
}

const slidePrev = () => {
  if (activePhoto.value > 0) scrollToPhoto(activePhoto.value - 1)
}

const slideNext = () => {
  if (activePhoto.value < visiblePhotos.value.length - 1) {
    scrollToPhoto(activePhoto.value + 1)
  }
}
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
