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
        <div v-if="heroPhoto" class="h-full w-full flex items-center justify-center bg-slate-950">
          <img
            :src="heroPhoto"
            :alt="profile.name"
            class="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none"
            draggable="false"
            loading="eager"
            decoding="async"
            @error="heroBroken = true"
          >
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center text-white text-6xl font-black"
          :class="heroColorClass"
        >
          {{ heroInitial }}
        </div>

        <button
          type="button"
          class="absolute left-4 top-[max(1.25rem,env(safe-area-inset-top,0px))] z-30 w-10 h-10 rounded-full bg-black/45 text-white flex items-center justify-center active:scale-95 backdrop-blur-sm shadow-lg shadow-black/20"
          aria-label="Orqaga"
          @click="$emit('back')"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <div
          v-if="refreshing"
          class="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30"
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
        <div v-if="showActions" class="px-3 pt-3">
          <slot name="actions">
            <div class="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                class="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all"
                @click="$emit('message')"
              >
                <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-sm" />
                </span>
                <span class="text-[13px] font-bold">Xabar yozish</span>
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
                :disabled="!telHref"
                @click="$emit('call')"
              >
                <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
                </span>
                <span class="text-[13px] font-bold">Qo'ng'iroq qilish</span>
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
import { avatarColorClass, avatarInitial } from '~/utils/avatarPlaceholder'
import { normalizeTo998 } from '~/utils/phone'

const props = withDefaults(defineProps<{
  profile: TelegramUserProfile | null
  photoUrls: string[]
  loading?: boolean
  refreshing?: boolean
  error?: string
  telHref?: string
  showActions?: boolean
}>(), {
  showActions: true,
})

defineEmits<{
  back: []
  message: []
  call: []
}>()

const heroBroken = ref(false)

watch(
  () => props.photoUrls,
  () => {
    heroBroken.value = false
  },
)

/** Faqat asosiy rasm — galereya yo'q */
const heroPhoto = computed(() => {
  if (heroBroken.value) return ''
  return props.photoUrls.find(Boolean) || ''
})

const heroInitial = computed(() => avatarInitial(props.profile?.name))
const heroColorClass = computed(() => avatarColorClass(props.profile?.name))

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
</script>
