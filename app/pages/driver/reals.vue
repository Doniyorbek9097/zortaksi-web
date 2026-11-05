<template>
  <div class="reals-root -mx-4 -mt-0 flex flex-col bg-black text-white">
    <header
      class="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 bg-black/80 backdrop-blur-md z-20"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <span
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-clapperboard" class="text-sm" />
        </span>
        <div class="min-w-0">
          <p class="text-[15px] font-black leading-none tracking-tight">Reals</p>
          <p class="text-[10px] font-semibold text-white/50 mt-0.5 truncate">
            Video reklamalar
          </p>
        </div>
      </div>
      <span
        v-if="reals.length"
        class="text-[10px] font-bold tabular-nums px-2.5 py-1 rounded-full bg-white/10 text-white/80"
      >
        {{ activeIndex + 1 }} / {{ reals.length }}
      </span>
    </header>

    <div
      v-if="loading && !reals.length"
      class="flex-1 min-h-[50vh] flex flex-col items-center justify-center gap-3"
    >
      <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-white/60" />
      <p class="text-[12px] font-bold text-white/50">Yuklanmoqda…</p>
    </div>

    <BaseEmptyState
      v-else-if="!reals.length"
      class="flex-1 min-h-[50vh] flex flex-col justify-center px-6"
      icon="fa-solid fa-clapperboard"
      title="Reals yo'q"
      subtitle="Tez orada yangi reklamalar chiqadi"
      tone="slate"
    />

    <div
      v-else
      ref="scrollerEl"
      class="reals-scroller flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain"
      @scroll="onScrollerScroll"
    >
      <section
        v-for="(item, index) in reals"
        :key="item.id"
        :data-real-id="item.id"
        :data-real-index="index"
        class="real-slide relative w-full snap-start snap-always flex flex-col bg-black"
      >
        <div class="relative flex-1 flex items-center justify-center min-h-0 bg-black">
          <video
            :ref="(el) => setVideoRef(item.id, el as HTMLVideoElement | null)"
            :src="videoSrc(item)"
            class="w-full max-h-full object-contain"
            playsinline
            loop
            muted
            preload="metadata"
            @click="togglePlay(item.id)"
          />

          <button
            type="button"
            class="absolute left-3 top-3 w-9 h-9 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform"
            :aria-label="isMuted(item.id) ? 'Ovozni yoqish' : 'Ovozni o\'chirish'"
            @click.stop="toggleMute(item.id)"
          >
            <font-awesome-icon
              :icon="isMuted(item.id) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"
              class="text-sm"
            />
          </button>
        </div>

        <div
          class="absolute inset-x-0 bottom-0 pb-3 pt-16 px-3 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none"
        >
          <div class="pointer-events-auto space-y-2.5 max-w-[calc(100%-3.5rem)]">
            <p class="text-[15px] font-black leading-snug line-clamp-2 drop-shadow-md">
              {{ item.title }}
            </p>
            <a
              v-if="item.productUrl"
              :href="item.productUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-transform"
              @click.stop
            >
              <font-awesome-icon icon="fa-solid fa-bag-shopping" class="text-sm" />
              Xarid qilish
            </a>
          </div>
        </div>

        <aside class="absolute right-2 bottom-28 z-10 flex flex-col items-center gap-2.5">
          <button
            type="button"
            class="real-action group"
            aria-label="Yoqtirish"
            @click="onReact(item, 'like')"
          >
            <span
              class="real-action-btn"
              :class="item.myVote === 'like'
                ? 'bg-emerald-500 border-emerald-300 text-white ring-2 ring-emerald-400/40'
                : ''"
            >
              <font-awesome-icon icon="fa-solid fa-thumbs-up" class="text-[17px]" />
            </span>
            <span class="real-action-label">{{ item.likesCount }}</span>
          </button>

          <button
            type="button"
            class="real-action group"
            aria-label="Yoqmadi"
            @click="onReact(item, 'dislike')"
          >
            <span
              class="real-action-btn"
              :class="item.myVote === 'dislike'
                ? 'bg-rose-500 border-rose-300 text-white ring-2 ring-rose-400/40'
                : ''"
            >
              <font-awesome-icon icon="fa-solid fa-thumbs-down" class="text-[17px]" />
            </span>
            <span class="real-action-label">{{ item.dislikesCount }}</span>
          </button>

          <button
            type="button"
            class="real-action group"
            aria-label="Ulashish"
            @click="onShare(item)"
          >
            <span class="real-action-btn">
              <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-[16px]" />
            </span>
            <span class="real-action-label">Ulashish</span>
          </button>
        </aside>
      </section>
    </div>

    <Transition name="reals-toast">
      <p
        v-if="shareHint"
        class="fixed left-1/2 -translate-x-1/2 bottom-[4.75rem] z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 text-white text-[12px] font-bold border border-white/10 shadow-xl max-w-[90vw] text-center"
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
const shareHint = ref('')
const videoRefs = new Map<string, HTMLVideoElement>()
const mutedById = ref<Record<string, boolean>>({})
let observer: IntersectionObserver | null = null
let shareHintTimer: ReturnType<typeof setTimeout> | null = null

const videoSrc = (r: IRealAd) => resolveMedia(r.videoUrl) || r.videoUrl

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
}

const playReal = async (id: string) => {
  const v = videoRefs.get(id)
  if (!v) return
  pauseAllExcept(id)
  v.muted = isMuted(id)
  try {
    await v.play()
  } catch {
    /* autoplay policy */
  }
}

const togglePlay = (id: string) => {
  const v = videoRefs.get(id)
  if (!v) return
  if (v.paused) void playReal(id)
  else v.pause()
}

const toggleMute = (id: string) => {
  const next = !isMuted(id)
  mutedById.value = { ...mutedById.value, [id]: next }
  const v = videoRefs.get(id)
  if (v) v.muted = next
}

/** Realsdagi mahsulot havolasi — ulashish uchun */
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
.reals-root {
  min-height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px));
  margin-bottom: calc(-1 * (3.5rem + env(safe-area-inset-bottom, 0px)));
}

.reals-scroller {
  height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px) - 3.25rem);
}

.real-slide {
  height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px) - 3.25rem);
  min-height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px) - 3.25rem);
}

.real-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.real-action-btn {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgb(255 255 255 / 0.22);
  background: rgb(0 0 0 / 0.45);
  color: white;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.35);
  transition: transform 0.15s ease, background 0.15s ease;
}

.real-action:active .real-action-btn {
  transform: scale(0.92);
}

.real-action-label {
  font-size: 10px;
  font-weight: 800;
  text-shadow: 0 1px 4px rgb(0 0 0 / 0.8);
  color: rgb(255 255 255 / 0.95);
  font-variant-numeric: tabular-nums;
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
