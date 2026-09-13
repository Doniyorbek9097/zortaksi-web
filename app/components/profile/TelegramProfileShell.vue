<template>
  <div
    class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    style="--zt-hero-h: min(55vh, 460px)"
  >
    <div v-if="loading" class="min-h-[100dvh] flex items-center justify-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-slate-400" />
    </div>

    <template v-else-if="profile">
      <!-- Qotib turuvchi rasm (scroll paytida joyida qoladi) -->
      <div
        class="fixed inset-x-0 top-0 z-0 h-[var(--zt-hero-h)] bg-slate-950"
        aria-hidden="false"
      >
        <div
          v-if="visiblePhotos.length"
          ref="galleryEl"
          class="h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-x"
          @scroll="onGalleryScroll"
        >
          <div
            v-for="(src, i) in visiblePhotos"
            :key="`${src}-${i}`"
            class="inline-flex w-full h-full snap-center align-top items-center justify-center bg-slate-950"
          >
            <img
              :src="src"
              :alt="profile.name"
              class="max-w-full max-h-full w-auto h-auto object-contain select-none"
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

        <!-- Yuklanish indikatori -->
        <div
          v-if="refreshing"
          class="absolute top-[max(0.5rem,env(safe-area-inset-top))] inset-x-0 z-30 flex justify-center pointer-events-none"
        >
          <span class="px-3 py-1 rounded-full bg-black/45 text-white text-[11px] font-bold backdrop-blur-sm">
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin mr-1.5" />
            Yangilanmoqda
          </span>
        </div>

        <!-- Progress chiziqlar -->
        <div
          v-if="visiblePhotos.length > 1"
          class="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-none"
          :class="refreshing ? 'mt-8' : ''"
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
          <!-- Tezkor tugmalar -->
          <div class="px-3 pt-4">
            <slot name="actions">
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="group flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-all"
                  @click="$emit('message')"
                >
                  <span class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-active:bg-white/30 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-[15px]" />
                  </span>
                  <span class="text-[13px] font-black tracking-wide">Xabar</span>
                </button>
                <button
                  type="button"
                  class="group flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
                  :disabled="!telHref"
                  @click="$emit('call')"
                >
                  <span class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-active:bg-white/30 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-phone" class="text-[15px]" />
                  </span>
                  <span class="text-[13px] font-black tracking-wide">Chaqiruv</span>
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
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
