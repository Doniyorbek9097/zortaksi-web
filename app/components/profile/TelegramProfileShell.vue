<template>
  <div
    class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    style="--zt-hero-h: min(52vh, 440px)"
  >
    <div v-if="loading" class="min-h-[100dvh] flex items-center justify-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-slate-400" />
    </div>

    <template v-else-if="profile">
      <!-- Rasm bloki — kontent ostida, ustiga chiqmaydi -->
      <section class="relative h-[var(--zt-hero-h)] bg-slate-950 shrink-0">
        <div
          v-if="visiblePhotos.length"
          ref="galleryEl"
          class="gallery-track flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          @scroll="onGalleryScroll"
        >
          <div
            v-for="(src, i) in visiblePhotos"
            :key="`${src}-${i}`"
            class="gallery-slide flex-[0_0_100%] w-full h-full snap-center flex items-center justify-center bg-slate-950"
          >
            <img
              :src="src"
              :alt="profile.name"
              class="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none"
              draggable="false"
              :fetchpriority="i === 0 ? 'high' : 'low'"
              :loading="i === 0 ? 'eager' : 'lazy'"
              decoding="async"
            >
          </div>
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 text-white text-5xl font-black"
        >
          {{ profile.name?.trim()?.[0]?.toUpperCase() || '?' }}
        </div>

        <!-- Orqaga + rasm soni -->
        <div
          class="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-center gap-2"
        >
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center active:scale-95 backdrop-blur-sm"
            aria-label="Orqaga"
            @click="$emit('back')"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
          </button>
          <span
            v-if="visiblePhotos.length > 1"
            class="px-2.5 py-1 rounded-full bg-black/40 text-white text-[12px] font-bold tabular-nums backdrop-blur-sm"
          >
            {{ activePhoto + 1 }}/{{ visiblePhotos.length }}
          </span>
        </div>

        <!-- Yuklanish -->
        <div
          v-if="refreshing"
          class="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30"
        >
          <span class="px-2.5 py-1 rounded-full bg-black/40 text-white text-[11px] font-bold backdrop-blur-sm">
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
          </span>
        </div>

        <!-- Ism va holat -->
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

      <!-- Kontent — rasm ostida, ustiga chiqmaydi -->
      <div class="relative z-10 bg-slate-100 dark:bg-slate-950 pb-10">
        <!-- Tezkor tugmalar -->
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

const galleryEl = ref<HTMLElement | null>(null)
const activePhoto = ref(0)

const visiblePhotos = computed(() => props.photoUrls.filter(Boolean))

watch(visiblePhotos, () => {
  activePhoto.value = 0
  nextTick(() => {
    if (galleryEl.value) galleryEl.value.scrollLeft = 0
  })
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

const onGalleryScroll = () => {
  const el = galleryEl.value
  if (!el || !visiblePhotos.value.length) return
  const w = el.clientWidth || 1
  activePhoto.value = Math.max(
    0,
    Math.min(visiblePhotos.value.length - 1, Math.round(el.scrollLeft / w)),
  )
}
</script>

<style scoped>
.gallery-track {
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.gallery-slide {
  touch-action: pan-x;
}

.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
