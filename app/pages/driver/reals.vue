<template>
  <div class="reals-page w-full flex flex-col overflow-hidden text-white bg-black relative">
    <div
      v-if="loading && !reals.length"
      class="flex-1 flex flex-col items-center justify-center gap-4 px-6"
    >
      <div class="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-spinner" class="text-xl animate-spin text-amber-300/80" />
      </div>
      <p class="text-[12px] font-bold tracking-wide text-white/45 uppercase">Yuklanmoqda</p>
    </div>

    <div
      v-else-if="!reals.length"
      class="flex-1 flex flex-col items-center justify-center text-center px-8 pb-8"
    >
      <div
        class="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-xl"
      >
        <font-awesome-icon icon="fa-solid fa-clapperboard" class="text-3xl text-amber-300/70" />
      </div>
      <h2 class="text-lg font-black text-white/95">Hozircha video yo'q</h2>
      <p class="mt-2 text-[13px] font-medium text-white/45 max-w-xs leading-relaxed">
        Tez orada reklama rollari shu yerda chiqadi
      </p>
    </div>

    <div v-else class="reals-stage relative flex-1 min-h-0 w-full">
      <header
        class="absolute top-0 inset-x-0 z-30 px-4 pt-2 pb-1 pointer-events-none"
      >
        <div class="flex items-start justify-between gap-3">
          <h1
            class="flex-1 min-w-0 text-[17px] font-black leading-snug line-clamp-2 text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.85)]"
          >
            {{ headerTitle }}
          </h1>
          <span
            v-if="reals.length > 1"
            class="shrink-0 text-[10px] font-black tabular-nums text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)] pt-0.5"
          >
            {{ activeIndex + 1 }}/{{ reals.length }}
          </span>
        </div>
        <div v-if="reals.length > 1" class="flex gap-1 mt-2">
          <span
            v-for="(_, i) in reals"
            :key="i"
            class="h-[2px] flex-1 rounded-full transition-all duration-300"
            :class="i === activeIndex ? 'bg-amber-400/95' : 'bg-white/25'"
          />
        </div>
      </header>

      <div
        ref="scrollerEl"
        class="reals-scroller absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain"
        @scroll="onScrollerScroll"
      >
        <section
          v-for="(item, index) in reals"
          :key="item.id"
          :data-real-id="item.id"
          :data-real-index="index"
          class="real-slide relative w-full h-full min-h-full snap-start snap-always bg-black"
        >
          <video
            :ref="(el) => setVideoRef(item.id, el as HTMLVideoElement | null)"
            :src="videoSrc(item)"
            class="absolute inset-0 w-full h-full object-cover"
            playsinline
            loop
            muted
            preload="metadata"
            @click="togglePlay(item.id)"
          />

          <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/75" />

          <Transition name="reals-play-hint">
            <div
              v-if="pausedId === item.id"
              class="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
            >
              <span
                class="w-16 h-16 rounded-full border border-white/25 bg-black/40 backdrop-blur-md flex items-center justify-center"
              >
                <font-awesome-icon icon="fa-solid fa-play" class="text-2xl text-white/90 ml-1" />
              </span>
            </div>
          </Transition>

          <button
            type="button"
            class="absolute top-14 right-3 z-20 w-10 h-10 rounded-full border border-white/15 bg-black/35 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
            :aria-label="isMuted(item.id) ? 'Ovozni yoqish' : 'Ovozni o\'chirish'"
            @click.stop="toggleMute(item.id)"
          >
            <font-awesome-icon
              :icon="isMuted(item.id) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"
              class="text-sm"
            />
          </button>

          <div class="absolute right-3 top-[42%] -translate-y-1/2 z-20 flex flex-col items-center gap-3">
            <button type="button" class="real-action" aria-label="Yoqtirish" @click="onReact(item, 'like')">
              <span class="real-action-btn" :class="item.myVote === 'like' ? 'real-action-btn--like' : ''">
                <font-awesome-icon icon="fa-solid fa-thumbs-up" class="text-[15px]" />
              </span>
              <span class="real-action-label">{{ formatCount(item.likesCount) }}</span>
            </button>
            <button type="button" class="real-action" aria-label="Yoqmadi" @click="onReact(item, 'dislike')">
              <span class="real-action-btn" :class="item.myVote === 'dislike' ? 'real-action-btn--dislike' : ''">
                <font-awesome-icon icon="fa-solid fa-thumbs-down" class="text-[15px]" />
              </span>
              <span class="real-action-label">{{ formatCount(item.dislikesCount) }}</span>
            </button>
            <button type="button" class="real-action" aria-label="Ulashish" @click="onShare(item)">
              <span class="real-action-btn">
                <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-[14px]" />
              </span>
              <span class="real-action-label">Ulash</span>
            </button>
          </div>

          <div
            v-if="item.productUrl"
            class="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-20 pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          >
            <a
              :href="item.productUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="real-cta pointer-events-auto flex w-full max-w-none items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-black text-slate-900 active:scale-[0.98] transition-transform box-border"
              @click.stop
            >
              <font-awesome-icon icon="fa-solid fa-bag-shopping" class="text-sm shrink-0" />
              Xarid qilish
            </a>
          </div>
        </section>
      </div>
    </div>

    <Transition name="reals-toast">
      <p
        v-if="shareHint"
        class="fixed left-1/2 -translate-x-1/2 bottom-[4.75rem] z-50 px-4 py-2.5 rounded-2xl bg-black/80 text-white text-[12px] font-bold border border-amber-400/25 shadow-xl max-w-[90vw] text-center backdrop-blur-xl"
      >
        {{ shareHint }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { IRealAd, RealAdVote } from '~/types/realAd'
import { isDriverAppAuthenticated, navigateToServiceAuth } from '~/utils/authSession'

definePageMeta({ layout: 'driver' })

const { resolve: resolveMedia } = useMediaUrl()
const config = useRuntimeConfig()

const reals = ref<IRealAd[]>([])
const loading = ref(true)
const scrollerEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const pausedId = ref<string | null>(null)
const shareHint = ref('')
const videoRefs = new Map<string, HTMLVideoElement>()
const mutedById = ref<Record<string, boolean>>({})
let observer: IntersectionObserver | null = null
let shareHintTimer: ReturnType<typeof setTimeout> | null = null

const videoSrc = (r: IRealAd) => resolveMedia(r.videoUrl) || r.videoUrl

const headerTitle = computed(() => {
  const t = reals.value[activeIndex.value]?.title?.trim()
  return t || 'Reals'
})

const formatCount = (n: number) => {
  const v = Number(n) || 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return String(v)
}

const isMuted = (id: string) => mutedById.value[id] !== false

const setVideoRef = (id: string, el: HTMLVideoElement | null) => {
  if (el) {
    videoRefs.set(id, el)
    el.muted = isMuted(id)
  } else {
    videoRefs.delete(id)
  }
}

const pauseAllExcept = (exceptId?: string) => {
  for (const [id, v] of videoRefs) {
    if (exceptId && id === exceptId) continue
    v.pause()
  }
  if (!exceptId) pausedId.value = null
}

const playReal = async (id: string) => {
  const v = videoRefs.get(id)
  if (!v) return
  pauseAllExcept(id)
  v.muted = isMuted(id)
  try {
    await v.play()
    pausedId.value = null
  } catch {
    pausedId.value = id
  }
}

const togglePlay = (id: string) => {
  const v = videoRefs.get(id)
  if (!v) return
  if (v.paused) void playReal(id)
  else {
    v.pause()
    pausedId.value = id
  }
}

const toggleMute = (id: string) => {
  const next = !isMuted(id)
  mutedById.value = { ...mutedById.value, [id]: next }
  const v = videoRefs.get(id)
  if (v) v.muted = next
}

const shareUrlFor = (item: IRealAd) => {
  const product = String(item.productUrl || '').trim()
  if (product) return product
  const appBase = String(config.public.appUrl || (import.meta.client ? window.location.origin : '')).replace(
    /\/$/,
    '',
  )
  return `${appBase}/driver/reals?real=${encodeURIComponent(item.id)}`
}

const setupObserver = () => {
  observer?.disconnect()
  if (!scrollerEl.value || !import.meta.client) return

  observer = new IntersectionObserver(
    (entries) => {
      let best: { id: string; index: number; ratio: number } | null = null
      for (const entry of entries) {
        const el = entry.target as HTMLElement
        const id = el.dataset.realId
        const index = Number(el.dataset.realIndex || 0)
        if (!id || !entry.isIntersecting) continue
        if (!best || entry.intersectionRatio > best.ratio) {
          best = { id, index, ratio: entry.intersectionRatio }
        }
      }
      if (best && best.ratio >= 0.55) {
        activeIndex.value = best.index
        void playReal(best.id)
      }
    },
    {
      root: scrollerEl.value,
      threshold: [0.35, 0.55, 0.75],
    },
  )

  scrollerEl.value.querySelectorAll('[data-real-id]').forEach((el) => {
    observer!.observe(el)
  })
}

const onScrollerScroll = () => {
  const root = scrollerEl.value
  if (!root || !reals.value.length) return
  const h = root.clientHeight || 1
  const idx = Math.round(root.scrollTop / h)
  activeIndex.value = Math.min(Math.max(0, idx), reals.value.length - 1)
}

const load = async () => {
  loading.value = true
  try {
    const res = await useApi<{ success: boolean; data: { reals: IRealAd[] } }>('/reals')
    reals.value = res?.success ? res.data?.reals || [] : []
  } catch {
    reals.value = []
  } finally {
    loading.value = false
  }
}

const onReact = async (item: IRealAd, vote: RealAdVote) => {
  if (!isDriverAppAuthenticated()) {
    void navigateToServiceAuth('/driver/reals')
    return
  }
  try {
    const res = await useApi<{ success: boolean; data: IRealAd }>(`/reals/${item.id}/react`, {
      method: 'POST',
      body: { vote },
    })
    if (res?.success && res.data) {
      const idx = reals.value.findIndex((r) => r.id === item.id)
      if (idx !== -1) reals.value[idx] = res.data
    }
  } catch { /* */ }
}

const showShareHint = (msg: string) => {
  shareHint.value = msg
  if (shareHintTimer) clearTimeout(shareHintTimer)
  shareHintTimer = setTimeout(() => {
    shareHint.value = ''
  }, 2200)
}

const onShare = async (item: IRealAd) => {
  if (!import.meta.client) return
  const url = shareUrlFor(item)
  const title = item.title || 'ZorTaksi Reals'
  try {
    if (navigator.share) {
      await navigator.share({ title, text: `${title}\n${url}`, url })
      return
    }
    await navigator.clipboard.writeText(url)
    showShareHint('Havola nusxalandi')
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') return
    try {
      await navigator.clipboard.writeText(url)
      showShareHint('Havola nusxalandi')
    } catch {
      showShareHint('Ulashib bo\'lmadi')
    }
  }
}

watch(
  () => reals.value.length,
  async () => {
    await nextTick()
    setupObserver()
    if (reals.value[0]?.id) void playReal(reals.value[0].id)
  },
)

onMounted(async () => {
  await load()
  await nextTick()
  setupObserver()
  if (reals.value[0]?.id) void playReal(reals.value[0].id)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  pauseAllExcept()
  if (shareHintTimer) clearTimeout(shareHintTimer)
})

onBeforeRouteLeave(() => {
  pauseAllExcept()
})
</script>

<style scoped>
.reals-page {
  height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px));
  max-height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px));
}

.reals-stage {
  width: 100%;
}

.reals-scroller {
  width: 100%;
  height: 100%;
}

.real-slide {
  height: 100%;
  min-height: 100%;
  scroll-snap-stop: always;
}

.real-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.real-action-btn {
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.real-action-btn--like {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.85));
  border-color: rgba(167, 243, 208, 0.5);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
}

.real-action-btn--dislike {
  background: linear-gradient(145deg, rgba(244, 63, 94, 0.9), rgba(190, 18, 60, 0.85));
  border-color: rgba(254, 205, 211, 0.45);
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.3);
}

.real-action:active .real-action-btn {
  transform: scale(0.9);
}

.real-action-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
}

.real-cta {
  background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 35%, #f59e0b 100%);
  box-shadow:
    0 4px 20px rgba(251, 191, 36, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.reals-play-hint-enter-active,
.reals-play-hint-leave-active {
  transition: opacity 0.2s ease;
}

.reals-play-hint-enter-from,
.reals-play-hint-leave-to {
  opacity: 0;
}

.reals-toast-enter-active,
.reals-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.reals-toast-enter-from,
.reals-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
