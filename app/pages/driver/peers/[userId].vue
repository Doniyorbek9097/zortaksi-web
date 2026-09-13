<template>
  <div class="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <div v-if="loading" class="min-h-[100dvh] flex items-center justify-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-slate-400" />
    </div>

    <template v-else-if="profile">
      <!-- Rasm galereyasi -->
      <section class="relative h-[min(52vh,420px)] bg-slate-900 overflow-hidden">
        <div
          v-if="photoUrls.length"
          ref="galleryEl"
          class="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          @scroll="onGalleryScroll"
        >
          <div
            v-for="(src, i) in photoUrls"
            :key="`${src}-${i}`"
            class="shrink-0 w-full h-full snap-center"
          >
            <img
              :src="src"
              :alt="profile.name"
              class="w-full h-full object-cover"
              @error="onPhotoError(i)"
            >
          </div>
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-indigo-700 text-white text-5xl font-black"
        >
          {{ profile.name?.trim()?.[0]?.toUpperCase() || '?' }}
        </div>

        <!-- Yuqori progress chiziqlar -->
        <div
          v-if="photoUrls.length > 1"
          class="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          <span
            v-for="(_, i) in photoUrls"
            :key="i"
            class="h-0.5 flex-1 rounded-full transition-colors"
            :class="i === activePhoto ? 'bg-white' : 'bg-white/35'"
          />
        </div>

        <!-- Orqaga -->
        <button
          type="button"
          class="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 w-9 h-9 rounded-full bg-black/35 text-white flex items-center justify-center active:scale-95"
          aria-label="Orqaga"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>

        <!-- Ism va holat -->
        <div class="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-16 bg-gradient-to-t from-black/75 via-black/35 to-transparent">
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
      </section>

      <!-- Tezkor tugmalar -->
      <div class="px-3 -mt-5 relative z-20">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-800/90 dark:bg-slate-900/95 text-white active:scale-[0.98] transition-transform"
            @click="openChat"
          >
            <font-awesome-icon icon="fa-solid fa-comment" class="text-lg" />
            <span class="text-[11px] font-bold">Xabar</span>
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-800/90 dark:bg-slate-900/95 text-white active:scale-[0.98] transition-transform disabled:opacity-40"
            :disabled="!telHref"
            @click="onCall"
          >
            <font-awesome-icon icon="fa-solid fa-phone" class="text-lg" />
            <span class="text-[11px] font-bold">Chaqiruv</span>
          </button>
        </div>
      </div>

      <!-- Ma'lumotlar kartasi -->
      <section class="mx-3 mt-3 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
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
            class="shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-95"
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
    </template>

    <div v-else class="min-h-[100dvh] flex flex-col items-center justify-center gap-3 px-6">
      <p class="text-sm font-bold text-red-500 text-center">{{ error || 'Profil topilmadi' }}</p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-black active:scale-95"
        @click="goBack"
      >
        Orqaga
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeTelHref, normalizeTo998 } from '~/utils/phone'
import { compactQuery } from '~/utils/navigationQuery'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()

const userId = computed(() => decodeURIComponent(String(route.params.userId || '')).trim())
const { profile, loading, error, photoUrls, load } = useTelegramUserProfile(userId)

const galleryEl = ref<HTMLElement | null>(null)
const activePhoto = ref(0)
const brokenPhotos = ref<Set<number>>(new Set())

const onGalleryScroll = () => {
  const el = galleryEl.value
  if (!el || !photoUrls.value.length) return
  const w = el.clientWidth || 1
  activePhoto.value = Math.max(0, Math.min(photoUrls.value.length - 1, Math.round(el.scrollLeft / w)))
}

const onPhotoError = (index: number) => {
  brokenPhotos.value.add(index)
}

const displayPhone = computed(() => {
  const raw = String(profile.value?.phone || '').replace(/\D/g, '')
  if (!raw) return ''
  const n = normalizeTo998(raw) || raw
  if (n.length === 12 && n.startsWith('998')) {
    return `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8, 10)} ${n.slice(10)}`
  }
  return `+${n}`
})

const telHref = computed(() => {
  const raw = profile.value?.phone
  return raw ? normalizeTelHref(raw) : ''
})

const telegramHref = computed(() => {
  const u = profile.value?.username
  if (u) return `https://t.me/${u.replace(/^@/, '')}`
  const id = profile.value?.userId
  return id ? `https://t.me/+${id}` : ''
})

const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else navigateTo('/driver/orders')
}

const openChat = async () => {
  const id = userId.value
  if (!id) return
  const chatId = String(route.query.chatId || '').trim()
  if (chatId) {
    await navigateTo({
      path: `/driver/chat/${chatId}`,
      query: compactQuery({ name: profile.value?.name }),
    })
    return
  }
  const orderId = String(route.query.orderId || '').trim()
  await navigateTo({
    path: '/driver/chat/open',
    query: compactQuery({
      open: 'user',
      userId: id,
      orderId: orderId || undefined,
      name: profile.value?.name,
    }),
  })
}

const onCall = () => {
  if (!telHref.value || !import.meta.client) return
  window.location.href = telHref.value
}

usePullToRefresh(load)
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
