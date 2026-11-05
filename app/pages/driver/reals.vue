<template>
  <div class="reals-tab -mx-4 -mt-0 min-h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))] bg-black text-white">
    <div
      v-if="loading && !reals.length"
      class="min-h-[50vh] flex items-center justify-center"
    >
      <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-white/70" />
    </div>

    <BaseEmptyState
      v-else-if="!reals.length"
      class="min-h-[50vh] flex flex-col justify-center px-6"
      icon="fa-solid fa-clapperboard"
      title="Reals yo'q"
      subtitle="Tez orada yangi reklamalar chiqadi"
      tone="slate"
    />

    <div
      v-else
      ref="scrollerEl"
      class="h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))] overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain"
    >
      <section
        v-for="item in reals"
        :key="item.id"
        :data-real-id="item.id"
        class="real-slide relative w-full snap-start snap-always flex items-center justify-center bg-black"
      >
        <video
          :ref="(el) => setVideoRef(item.id, el as HTMLVideoElement | null)"
          :src="videoSrc(item)"
          class="w-full h-full object-contain max-h-full"
          playsinline
          loop
          muted
          preload="metadata"
          @click="togglePlay(item.id)"
        />

        <div
          class="absolute inset-x-0 bottom-0 pb-4 pt-20 px-3 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none"
        >
          <p class="text-[15px] font-black leading-snug line-clamp-2 pointer-events-auto">
            {{ item.title }}
          </p>
          <a
            v-if="item.productUrl"
            :href="item.productUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 flex w-full items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black bg-sky-500 text-white pointer-events-auto active:scale-[0.98] transition-transform"
            @click.stop
          >
            <font-awesome-icon icon="fa-solid fa-bag-shopping" />
            Xarid qilish
          </a>
        </div>

        <div class="absolute right-2 bottom-24 flex flex-col items-center gap-3 z-10">
          <button
            type="button"
            class="flex flex-col items-center gap-0.5"
            aria-label="Yoqtirish"
            @click="onReact(item, 'like')"
          >
            <span
              class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors shadow-lg"
              :class="item.myVote === 'like'
                ? 'bg-emerald-500 border-emerald-300 text-white'
                : 'bg-black/45 border-white/25 text-white backdrop-blur-sm'"
            >
              <font-awesome-icon icon="fa-solid fa-thumbs-up" class="text-base" />
            </span>
            <span class="text-[10px] font-bold tabular-nums drop-shadow">{{ item.likesCount }}</span>
          </button>

          <button
            type="button"
            class="flex flex-col items-center gap-0.5"
            aria-label="Yoqmadi"
            @click="onReact(item, 'dislike')"
          >
            <span
              class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors shadow-lg"
              :class="item.myVote === 'dislike'
                ? 'bg-rose-500 border-rose-300 text-white'
                : 'bg-black/45 border-white/25 text-white backdrop-blur-sm'"
            >
              <font-awesome-icon icon="fa-solid fa-thumbs-down" class="text-base" />
            </span>
            <span class="text-[10px] font-bold tabular-nums drop-shadow">{{ item.dislikesCount }}</span>
          </button>

          <button
            type="button"
            class="flex flex-col items-center gap-0.5"
            aria-label="Ulashish"
            @click="onShare(item)"
          >
            <span
              class="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/25 bg-black/45 text-white backdrop-blur-sm shadow-lg"
            >
              <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-base" />
            </span>
            <span class="text-[10px] font-bold drop-shadow">Ulashish</span>
          </button>
        </div>
      </section>
    </div>

    <p
      v-if="shareHint"
      class="fixed left-1/2 -translate-x-1/2 bottom-[4.5rem] z-50 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-[12px] font-bold border border-white/10"
    >
      {{ shareHint }}
    </p>
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
const shareHint = ref('')
const videoRefs = new Map<string, HTMLVideoElement>()
let observer: IntersectionObserver | null = null
let shareHintTimer: ReturnType<typeof setTimeout> | null = null

const videoSrc = (r: IRealAd) => resolveMedia(r.videoUrl) || r.videoUrl

const setVideoRef = (id: string, el: HTMLVideoElement | null) => {
  if (el) videoRefs.set(id, el)
  else videoRefs.delete(id)
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
  v.muted = true
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

const setupObserver = () => {
  observer?.disconnect()
  if (!scrollerEl.value || !import.meta.client) return

  observer = new IntersectionObserver(
    (entries) => {
      let best: { id: string; ratio: number } | null = null
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.realId
        if (!id || !entry.isIntersecting) continue
        if (!best || entry.intersectionRatio > best.ratio) {
          best = { id, ratio: entry.intersectionRatio }
        }
      }
      if (best && best.ratio >= 0.55) {
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
  const appBase = String(config.public.appUrl || window.location.origin).replace(/\/$/, '')
  const url = item.productUrl?.trim() || `${appBase}/driver/reals`
  const title = item.title || 'ZorTaksi Reals'
  try {
    if (navigator.share) {
      await navigator.share({ title, text: title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    showShareHint('Havola nusxalandi')
  } catch (e: any) {
    if (e?.name === 'AbortError') return
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
.reals-tab {
  margin-bottom: calc(-1 * (3.5rem + env(safe-area-inset-bottom, 0px)));
}

.real-slide {
  height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px));
  min-height: calc(100dvh - 3.5rem - env(safe-area-inset-bottom, 0px));
}
</style>
