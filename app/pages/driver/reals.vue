<template>
  <div class="reals-page w-full flex flex-col overflow-hidden text-white bg-black">
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
            preload="auto"
            @click="togglePlay(item.id)"
          />

          <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-transparent" />

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

          <div
            v-if="item.productUrl"
            class="absolute inset-x-0 bottom-0 z-20 real-product-stack pointer-events-none"
          >
            <div class="real-product-bar w-full pointer-events-auto">
              <button
                v-if="productTitle(item) || productPriceLabel(item)"
                type="button"
                class="real-product-title real-title-box--link text-left w-full"
                @click.stop="openProductLink(item)"
              >
                <span class="flex-1 min-w-0 w-full">
                  <span
                    v-if="productTitle(item)"
                    class="block text-[14px] font-black leading-snug line-clamp-2 text-white"
                  >
                    {{ productTitle(item) }}
                  </span>
                  <span
                    v-if="productPriceLabel(item)"
                    class="block mt-0.5 text-[12px] font-bold text-amber-300/95 tabular-nums"
                    :class="productTitle(item) ? '' : 'text-[14px] font-black text-white'"
                  >
                    {{ productPriceLabel(item) }}
                  </span>
                </span>
              </button>

              <div class="real-product-actions">
                <button
                  type="button"
                  class="real-cta flex-1 min-w-0"
                  @click.stop="openProductLink(item)"
                >
                  <span class="real-cta-text">{{ ctaLabel(item) }}</span>
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="real-cta-arrow text-sm" />
                </button>
                <button
                  type="button"
                  class="real-sound-toggle shrink-0"
                  :aria-label="isMuted(item.id) ? 'Ovozni yoqish' : 'Ovozni o\'chirish'"
                  @click.stop="toggleMute(item.id)"
                >
                  <span
                    class="real-premium-btn real-premium-btn--inline"
                    :class="isMuted(item.id) ? 'real-premium-btn--muted' : 'real-premium-btn--sound'"
                  >
                    <font-awesome-icon
                      :icon="isMuted(item.id) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"
                      class="text-[15px]"
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <button
            v-else
            type="button"
            class="absolute right-3 bottom-3 z-20 real-action"
            :aria-label="isMuted(item.id) ? 'Ovozni yoqish' : 'Ovozni o\'chirish'"
            @click.stop="toggleMute(item.id)"
          >
            <span
              class="real-premium-btn"
              :class="isMuted(item.id) ? 'real-premium-btn--muted' : 'real-premium-btn--sound'"
            >
              <font-awesome-icon
                :icon="isMuted(item.id) ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'"
                class="text-[15px]"
              />
            </span>
            <span class="real-action-label real-action-label--premium">Ovoz</span>
          </button>

          <div
            class="absolute right-3 z-20 flex flex-col items-center gap-2.5 real-rail-social"
            :class="item.productUrl ? 'real-rail-social--with-product' : ''"
          >
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
              <span class="real-action-label">Yoqmadi</span>
            </button>
            <button type="button" class="real-action" aria-label="Ulashish" @click="onShare(item)">
              <span class="real-action-btn">
                <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-[14px]" />
              </span>
              <span class="real-action-label">Ulash</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <Transition name="reals-toast">
      <p
        v-if="shareHint"
        class="fixed left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/80 text-white text-[12px] font-bold border border-amber-400/25 shadow-xl max-w-[90vw] text-center backdrop-blur-xl reals-toast"
      >
        {{ shareHint }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { IRealAd, RealAdVote } from '~/types/realAd'
import { resolveRealAdCtaLabel } from '~/constants/realAdCta'
import { openRealProductLink, realProductShareUrl } from '~/utils/realProductUrl'
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
/** Faqat foydalanuvchi o'chirganda true; yangi realga o'tganda yana ovozli */
const soundMuted = ref(false)
const playingId = ref<string | null>(null)
let observer: IntersectionObserver | null = null
let shareHintTimer: ReturnType<typeof setTimeout> | null = null

const videoSrc = (r: IRealAd) => resolveMedia(r.videoUrl) || r.videoUrl

const productTitle = (item: IRealAd) => String(item.title || '').trim()

const productPriceLabel = (item: IRealAd) => String(item.productPrice || '').trim()

const ctaLabel = (item: IRealAd) => resolveRealAdCtaLabel(item.ctaLabel)

const openProductLink = (item: IRealAd) => {
  openRealProductLink(item.productUrl)
}

const formatCount = (n: number) => {
  const v = Number(n) || 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return String(v)
}

const isMuted = (_id: string) => soundMuted.value

const syncAllVideoMute = () => {
  const active = playingId.value
  for (const [id, v] of videoRefs) {
    v.muted = id !== active || soundMuted.value
  }
}

const setVideoRef = (id: string, el: HTMLVideoElement | null) => {
  if (el) {
    videoRefs.set(id, el)
    el.muted = id !== playingId.value || soundMuted.value
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

  if (playingId.value !== id) {
    soundMuted.value = false
  }

  playingId.value = id
  pauseAllExcept(id)
  syncAllVideoMute()

  try {
    await v.play()
    pausedId.value = null
  } catch {
    v.muted = true
    soundMuted.value = true
    try {
      await v.play()
      pausedId.value = null
    } catch {
      pausedId.value = id
    }
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
  if (playingId.value !== id) return
  soundMuted.value = !soundMuted.value
  syncAllVideoMute()
}

const shareUrlFor = (item: IRealAd) => {
  const product = String(item.productUrl || '').trim()
  const appBase = String(config.public.appUrl || (import.meta.client ? window.location.origin : '')).replace(
    /\/$/,
    '',
  )
  if (product) return realProductShareUrl(product, appBase)
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
  soundMuted.value = false
  await load()
  await nextTick()
  setupObserver()
  if (reals.value[0]?.id) void playReal(reals.value[0].id)
})

onActivated(() => {
  soundMuted.value = false
  const id = reals.value[activeIndex.value]?.id
  if (id) void playReal(id)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  pauseAllExcept()
  if (shareHintTimer) clearTimeout(shareHintTimer)
})

onBeforeRouteLeave(() => {
  pauseAllExcept()
  playingId.value = null
})
</script>

<style scoped>
/* Tabbar (h-14) + xavfsiz zona — layout padding bilan bir xil */
.reals-page {
  position: fixed;
  z-index: 30;
  top: 0;
  left: 0;
  right: 0;
  bottom: calc(3.5rem + var(--zt-safe-bottom, env(safe-area-inset-bottom, 0px)));
  width: 100%;
  max-width: 100vw;
  height: auto;
  min-height: 0;
}

:global(html[data-zt-embed='webview']) .reals-page {
  bottom: 3.5rem;
}

.reals-toast {
  bottom: calc(3.5rem + var(--zt-safe-bottom, env(safe-area-inset-bottom, 0px)) + 0.75rem);
}

:global(html[data-zt-embed='webview']) .reals-toast {
  bottom: calc(3.5rem + 0.75rem);
}

.reals-stage {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
}

.reals-scroller {
  width: 100%;
  height: 100%;
}

.real-slide {
  height: 100%;
  min-height: 100%;
  scroll-snap-stop: always;
  box-sizing: border-box;
}

.real-title-box {
  padding: 5px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.real-product-stack::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  height: 3.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.42), transparent);
  pointer-events: none;
}

.real-product-bar {
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  border: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.22) 55%,
    transparent 100%
  );
  backdrop-filter: blur(8px);
}

.real-product-title {
  display: block;
  width: 100%;
  margin-bottom: 0.375rem;
  text-align: left;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.85);
}

.real-product-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.real-cta {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 0.75rem;
  text-align: center;
  font-size: 13px;
  font-weight: 900;
  color: #1c1917;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 35%, #f59e0b 100%);
  box-shadow:
    0 4px 20px rgba(251, 191, 36, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
  transition: transform 0.15s ease;
}

.real-cta-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.real-cta-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.85;
}

.real-cta:active {
  transform: scale(0.98);
}

.real-sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
}

.real-sound-toggle:active .real-premium-btn {
  transform: scale(0.9);
}

.real-premium-btn--inline {
  width: 2.75rem;
  height: 2.75rem;
}

.real-title-box--link {
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  font: inherit;
  transition: transform 0.15s ease, background 0.15s ease;
}

.real-title-box--link:active {
  transform: scale(0.98);
  background: rgba(0, 0, 0, 0.4);
}

.real-rail-social {
  bottom: calc(4.85rem + 30px);
}

.real-rail-social--with-product {
  bottom: calc(7.5rem + 30px);
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

.real-premium-btn {
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(253, 224, 71, 0.55);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, transparent 42%),
    linear-gradient(135deg, #fde68a 0%, #fbbf24 38%, #d97706 100%);
  color: #1c1917;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2) inset,
    0 4px 22px rgba(251, 191, 36, 0.45),
    0 8px 28px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.real-premium-btn::after {
  content: '';
  position: absolute;
  inset: -40% -60%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 60%
  );
  animation: real-premium-shine 3.2s ease-in-out infinite;
  pointer-events: none;
}

.real-premium-btn--buy {
  width: 3.1rem;
  height: 3.1rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.28) inset,
    0 0 28px rgba(251, 191, 36, 0.55),
    0 6px 26px rgba(217, 119, 6, 0.4),
    0 10px 32px rgba(0, 0, 0, 0.4);
}

.real-premium-btn--sound {
  color: #422006;
}

.real-premium-btn--muted {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, transparent 42%),
    linear-gradient(135deg, rgba(253, 230, 138, 0.95) 0%, rgba(251, 191, 36, 0.75) 50%, rgba(180, 83, 9, 0.85) 100%);
  color: rgba(28, 25, 23, 0.75);
  border-color: rgba(253, 224, 71, 0.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12) inset,
    0 4px 18px rgba(251, 191, 36, 0.28),
    0 8px 24px rgba(0, 0, 0, 0.35);
}

.real-action:active .real-premium-btn {
  transform: scale(0.9);
}

.real-action-label--premium {
  color: #fde68a;
  text-shadow:
    0 0 12px rgba(251, 191, 36, 0.55),
    0 1px 4px rgba(0, 0, 0, 0.95);
}

.real-action-label--buy {
  max-width: 4.5rem;
  text-align: center;
  line-height: 1.15;
  font-size: 8px;
  letter-spacing: 0.04em;
}

@keyframes real-premium-shine {
  0%,
  72% {
    transform: translateX(-120%) rotate(12deg);
    opacity: 0;
  }
  78% {
    opacity: 1;
  }
  100% {
    transform: translateX(120%) rotate(12deg);
    opacity: 0;
  }
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
