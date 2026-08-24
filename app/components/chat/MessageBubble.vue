<template>
  <div
    class="flex"
    :class="[
      out ? 'justify-end' : 'justify-start',
      highlight ? 'ring-2 ring-amber-400/80 rounded-2xl' : '',
    ]"
  >
    <div class="relative max-w-[82%] overflow-hidden">
      <div
        v-if="!selectionMode && swipeX < -4"
        class="absolute inset-y-0 right-0 w-11 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white shadow-sm transition-opacity"
          :style="{ opacity: swipeDeleteOpacity }"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="text-[12px]" />
        </div>
      </div>

      <div
        v-if="!selectionMode && swipeX > 4"
        class="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center bg-sky-500 text-white shadow-sm transition-opacity"
          :style="{ opacity: swipeIconOpacity }"
        >
          <font-awesome-icon icon="fa-solid fa-reply" class="text-[12px]" />
        </div>
      </div>

      <div
        class="relative"
        :class="[
          swipeDragging ? 'will-change-transform' : 'transition-transform duration-200',
        ]"
        :style="{
          transform: `translate3d(${swipeX}px,0,0)`,
          touchAction: swipeTouchAction,
        }"
        @pointerdown.capture="onSwipePointerDown"
        @pointermove="onSwipePointerMove"
        @pointerup="onSwipePointerUp"
        @pointercancel="onSwipePointerUp"
        @click.capture="onSwipeClickCapture"
      >
    <div
      class="relative max-w-full rounded-2xl px-3.5 py-2 shadow-sm overflow-hidden select-none touch-manipulation"
      :class="[
        'bg-white text-slate-800 border border-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
        out ? 'rounded-br-md' : 'rounded-bl-md',
        type === 'photo' || type === 'sticker' ? '!p-1.5' : '',
        type === 'document' ? '!p-2' : '',
        isSelectable && selectionMode ? (selected ? 'ring-2 ring-indigo-500' : 'ring-2 ring-indigo-300/60') : '',
      ]"
      @pointerdown="onSelectPointerDown"
      @pointerup="onSelectPointerUp"
      @pointercancel="onSelectPointerUp"
      @pointerleave="onSelectPointerCancel"
      @click.capture="onBubbleClickCapture"
    >
      <ChatMessageReplyQuote
        v-if="replyTo?.text"
        :text="replyTo.text"
        :out="out"
        :reply-out="replyTo.direction === 'out'"
      />

      <div
        v-if="isSelectable && selectionMode"
        class="absolute top-2 left-2 z-10 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors"
        :class="selected
          ? 'bg-indigo-500 border-indigo-500 text-white'
          : 'border-white/80 bg-black/20 text-transparent'"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
      </div>

      <!-- Voice player -->
      <div v-if="type === 'voice'" class="flex items-center gap-2.5 min-w-[180px] px-2 py-0.5">
        <button
          type="button"
          class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-all"
          :class="out ? 'bg-sky-100 text-sky-600' : 'bg-sky-500/15 text-sky-500'"
          :aria-label="playing ? 'To\'xtatish' : 'Tinglash'"
          :disabled="loading"
          @click="toggle"
        >
          <font-awesome-icon
            v-if="loading"
            icon="fa-solid fa-spinner"
            class="animate-spin text-sm"
          />
          <font-awesome-icon
            v-else
            :icon="playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'"
            class="text-sm"
          />
        </button>

        <div class="flex-1 min-w-0">
          <div
            class="h-1 rounded-full overflow-hidden cursor-pointer"
            :class="out ? 'bg-slate-200' : 'bg-slate-200'"
            @click="seek"
          >
            <div
              class="h-full rounded-full transition-[width] duration-100"
              :class="'bg-sky-500'"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div
            class="mt-1 flex justify-between text-[10px] tabular-nums"
            :class="'text-slate-400'"
          >
            <span>{{ currentLabel }}</span>
            <span>{{ durationLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Rasm / stiker -->
      <div v-else-if="type === 'photo' || type === 'sticker'" class="space-y-1.5">
        <button
          type="button"
          class="block w-full overflow-hidden rounded-xl relative"
          :class="type === 'sticker' ? 'max-w-[200px]' : 'max-w-[320px]'"
          @click.stop="handlePhotoStickerTap"
        >
          <div
            v-if="loading"
            class="w-full min-h-[140px] flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/50 rounded-xl"
          >
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-lg opacity-60" />
          </div>

          <!-- Hira placeholder — to'liq media yuklanmaguncha -->
          <div
            v-else-if="!fullLoaded"
            class="relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-slate-200/90 dark:bg-slate-700/70"
            :class="type === 'sticker' ? 'min-h-[160px]' : 'min-h-[180px]'"
          >
            <div
              class="absolute inset-0 scale-110 bg-gradient-to-br from-slate-300/80 via-slate-400/50 to-slate-300/80 dark:from-slate-600/80 dark:via-slate-500/40 dark:to-slate-600/80"
              style="filter: blur(18px);"
            />
            <div class="absolute inset-0 backdrop-blur-xl bg-white/10 dark:bg-black/10" />
            <span class="relative z-10 flex flex-col items-center gap-1.5 px-3 text-center">
              <font-awesome-icon
                :icon="type === 'sticker' ? 'fa-solid fa-face-smile' : 'fa-solid fa-image'"
                class="text-xl opacity-50 text-slate-500 dark:text-slate-300"
              />
              <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Ko'rish uchun bosing
              </span>
            </span>
          </div>

          <video
            v-else-if="isStickerVideo"
            :src="src"
            class="block w-full max-w-[200px] max-h-[200px] object-contain rounded-xl mx-auto transition-opacity duration-300"
            autoplay
            loop
            muted
            playsinline
          />
          <img
            v-else-if="src"
            :src="src"
            :alt="type === 'sticker' ? 'Stiker' : 'Rasm'"
            class="block w-full max-w-[320px] max-h-[420px] object-contain rounded-xl mx-auto transition-opacity duration-300"
            :class="type === 'sticker' ? '!max-w-[200px] !max-h-[200px]' : ''"
            @error="onImageError"
          >
          <div
            v-else
            class="w-full min-h-[120px] flex flex-col items-center justify-center gap-1 text-xs opacity-70"
            @click.stop="retryMedia"
          >
            <span>Yuklanmadi</span>
            <span class="underline">Qayta urinish</span>
          </div>
        </button>
        <p
          v-if="text"
          class="px-2 text-[15px] leading-relaxed"
        >
          <ChatHtmlText v-if="textFormat === 'html'" :html="text" :out="out" />
          <ChatLinkifiedText v-else :text="text" :out="out" :mask-phones="maskPhones" />
        </p>
      </div>

      <!-- Hujjat (PDF, DOCX) -->
      <div v-else-if="type === 'document'" class="space-y-1.5 min-w-[200px]">
        <button
          type="button"
          class="flex items-center gap-3 w-full max-w-[320px] rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80 active:scale-[0.98] transition-transform"
          @click.stop="openDocument"
        >
          <span
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg"
            :class="isPdfDocument
              ? 'bg-red-500/15 text-red-500'
              : 'bg-blue-500/15 text-blue-500'"
          >
            <font-awesome-icon
              v-if="loading"
              icon="fa-solid fa-spinner"
              class="animate-spin text-base"
            />
            <font-awesome-icon
              v-else
              :icon="documentIcon"
              class="text-xl"
            />
          </span>
          <span class="min-w-0 flex-1 text-left">
            <span class="block text-[14px] font-semibold truncate text-slate-800 dark:text-slate-100">
              {{ documentLabel }}
            </span>
            <span class="block text-[11px] mt-0.5 text-sky-500 font-semibold">
              {{ loading ? 'Yuklanmoqda...' : fullLoaded ? 'Ochilgan' : 'Ochish' }}
            </span>
          </span>
          <font-awesome-icon
            icon="fa-solid fa-arrow-up-right-from-square"
            class="shrink-0 text-[12px] text-slate-400"
          />
        </button>
        <p
          v-if="text && text !== documentLabel"
          class="px-1 text-[15px] leading-relaxed"
        >
          <ChatLinkifiedText :text="text" :out="out" :mask-phones="maskPhones" />
        </p>
      </div>

      <!-- Joylashuv -->
      <a
        v-else-if="type === 'location' && mapsUrl"
        :href="mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 min-w-[200px] px-1 py-1 no-underline text-slate-800 dark:text-slate-100"
      >
        <span
          class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-sky-500/15 text-sky-500"
        >
          <font-awesome-icon icon="fa-solid fa-location-dot" />
        </span>
        <span class="min-w-0">
          <span class="block text-[15px] font-semibold truncate">
            {{ locationTitle || 'Joylashuv' }}
          </span>
          <span
            class="block text-[11px] mt-0.5 text-slate-500 dark:text-slate-300"
          >
            Xaritada ochish
          </span>
        </span>
      </a>

      <!-- Matn (link / telefon bosiladi) -->
      <div
        v-else-if="textFormat === 'html' && text"
        class="text-[15px] leading-relaxed"
      >
        <ChatHtmlText :html="text" :out="out" />
      </div>
      <p
        v-else
        class="text-[15px] leading-relaxed"
      >
        <ChatLinkifiedText :text="text" :out="out" :mask-phones="maskPhones" />
      </p>

      <div
        class="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400 dark:text-slate-300"
        :class="type === 'photo' || type === 'sticker' || type === 'document' ? 'px-1.5 pb-0.5' : ''"
      >
        <span>{{ time }}</span>
        <template v-if="out">
          <font-awesome-icon v-if="status === 'sending'" icon="fa-solid fa-clock" class="text-[9px]" />
          <font-awesome-icon
            v-else-if="status === 'failed' && !mediaPath"
            icon="fa-solid fa-exclamation-triangle"
            class="text-[9px] text-amber-500"
            title="Yuborilmadi"
          />
          <font-awesome-icon
            v-else
            :icon="(read || status === 'read') ? 'fa-solid fa-check-double' : 'fa-solid fa-check'"
            class="text-[9px]"
            :class="(read || status === 'read') ? 'text-sky-500' : ''"
          />
        </template>
      </div>

      <!-- Xabar yetib bormadi — aniq sabab (SPAM / bloklangan) -->
      <div
        v-if="status === 'failed' && errorText"
        class="mt-1.5 flex items-start gap-1.5 px-1.5 pb-0.5"
      >
        <font-awesome-icon
          icon="fa-solid fa-circle-exclamation"
          class="mt-0.5 text-[10px] shrink-0 text-red-500"
        />
        <p
          class="text-[11px] font-semibold leading-snug text-red-500"
        >
          {{ errorText }}
        </p>
      </div>

      <audio
        v-if="type === 'voice'"
        ref="audioEl"
        :src="src || undefined"
        preload="metadata"
        playsinline
        class="hidden"
        @timeupdate="onTime"
        @ended="onEnded"
        @loadedmetadata="onMeta"
        @error="onAudioError"
      />
    </div>
      </div>
    </div>

    <!-- Rasm / PDF lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightbox"
          class="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center p-4"
          @click.self="closeLightbox"
        >
          <button
            type="button"
            class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="Yopish"
            @click="closeLightbox"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
          <img
            v-if="lightboxMode === 'image' && src && !isStickerVideo"
            :src="src"
            alt="Rasm"
            class="max-w-[min(100vw-2rem,1400px)] max-h-[min(100vh-4rem,90vh)] w-auto h-auto object-contain rounded-lg shadow-2xl"
          >
          <video
            v-else-if="lightboxMode === 'image' && src && isStickerVideo"
            :src="src"
            class="max-w-[min(100vw-2rem,480px)] max-h-[min(100vh-4rem,480px)] w-auto h-auto object-contain rounded-lg shadow-2xl"
            autoplay
            loop
            muted
            playsinline
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { agentDebugLog } from '~/utils/agentDebugLog'
import { claimVoicePlay, releaseVoicePlay } from '~/composables/useExclusiveVoicePlay'

interface Props {
  text?: string
  textFormat?: 'plain' | 'html'
  time?: string
  date?: string | Date
  out?: boolean
  read?: boolean
  status?: 'sending' | 'sent' | 'failed' | 'read'
  /** failed holatida — foydalanuvchiga tushunarli xato sababi (SPAM/blok) */
  error?: string
  type?: 'text' | 'photo' | 'video' | 'voice' | 'document' | 'sticker' | 'location'
  messageId?: string
  /** Serverda media saqlangan yo'l — fonda yuklanganda player qayta urinadi */
  mediaPath?: string
  mimeType?: string
  duration?: number
  locationLat?: number
  locationLng?: number
  locationTitle?: string
  highlight?: boolean
  /** Tomoshabin rejimi — telefon raqamlar yashiriladi */
  maskPhones?: boolean
  /** Ovoz/rasm tanlash rejimi */
  selectionMode?: boolean
  selected?: boolean
  replyTo?: {
    messageId?: string
    text?: string
    type?: string
    direction?: 'in' | 'out'
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  time: '',
  date: '',
  out: false,
  read: false,
  status: 'sent',
  error: '',
  type: 'text',
  mediaPath: '',
  mimeType: '',
  duration: 0,
  locationLat: undefined,
  locationLng: undefined,
  locationTitle: '',
  highlight: false,
  maskPhones: false,
  selectionMode: false,
  selected: false,
  replyTo: null,
})

/** Failed xabarda ko'rsatiladigan sabab — media xabarlarda ham ko'rsatiladi */
const errorText = computed(() => {
  if (props.status !== 'failed') return ''
  return String(props.error || '').trim()
})

const emit = defineEmits<{ 'long-press': []; 'toggle-select': []; reply: []; delete: [] }>()

const SWIPE_REVEAL = 56
const swipeX = ref(0)
const swipeDragging = ref(false)
const swipeStartX = ref(0)
const swipeOriginX = ref(0)
const swipeOriginY = ref(0)
const swipeAxis = ref<'h' | 'v' | null>(null)
const swipeMoved = ref(false)
const swipeHandled = ref(false)

const swipeTouchAction = computed(() => {
  if (props.selectionMode) return 'auto'
  if (swipeAxis.value === 'h' || swipeDragging.value) return 'none'
  return 'manipulation'
})

const swipeIconOpacity = computed(() =>
  Math.min(1, swipeX.value / SWIPE_REVEAL),
)

const swipeDeleteOpacity = computed(() =>
  Math.min(1, -swipeX.value / SWIPE_REVEAL),
)

const onSwipePointerDown = (e: PointerEvent) => {
  if (props.selectionMode) return
  swipeDragging.value = true
  swipeMoved.value = false
  swipeAxis.value = null
  swipeOriginX.value = e.clientX
  swipeOriginY.value = e.clientY
  swipeStartX.value = e.clientX - swipeX.value
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const onSwipePointerMove = (e: PointerEvent) => {
  if (!swipeDragging.value || props.selectionMode) return
  const rawDx = e.clientX - swipeOriginX.value
  const rawDy = e.clientY - swipeOriginY.value
  if (!swipeAxis.value) {
    if (Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return
    swipeAxis.value = Math.abs(rawDx) >= Math.abs(rawDy) ? 'h' : 'v'
    if (swipeAxis.value === 'v') {
      swipeDragging.value = false
      return
    }
  }
  if (swipeAxis.value !== 'h') return
  swipeMoved.value = true
  clearLongPress()
  const dx = e.clientX - swipeStartX.value
  if (dx > 0) {
    swipeX.value = Math.min(SWIPE_REVEAL, dx)
  } else if (dx < 0) {
    swipeX.value = Math.max(-SWIPE_REVEAL, dx)
  } else {
    swipeX.value = 0
  }
}

const onSwipePointerUp = (e?: PointerEvent) => {
  try {
    if (e?.currentTarget && typeof e.pointerId === 'number') {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    }
  } catch {
    /* */
  }

  const axis = swipeAxis.value
  const reveal = swipeX.value
  swipeDragging.value = false
  swipeAxis.value = null

  if (axis === 'h' && reveal >= SWIPE_REVEAL * 0.65) {
    swipeHandled.value = true
    emit('reply')
  } else if (axis === 'h' && reveal <= -SWIPE_REVEAL * 0.65) {
    swipeHandled.value = true
    emit('delete')
  }

  swipeX.value = 0
  swipeMoved.value = false
}

const onSwipeClickCapture = (e: Event) => {
  if (swipeHandled.value) {
    e.preventDefault()
    e.stopPropagation()
    swipeHandled.value = false
  }
}

const isSelectable = computed(
  () =>
    props.type === 'text' ||
    props.type === 'voice' ||
    props.type === 'photo' ||
    props.type === 'sticker' ||
    props.type === 'location' ||
    props.type === 'document',
)

let longPressTimer: ReturnType<typeof setTimeout> | null = null

const clearLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const onSelectPointerDown = (e: PointerEvent) => {
  if (!isSelectable.value || props.selectionMode) return
  clearLongPress()
  longPressTimer = setTimeout(() => {
    longPressTimer = null
    emit('long-press')
  }, 500)
}

const onSelectPointerUp = () => clearLongPress()
const onSelectPointerCancel = () => clearLongPress()

const onBubbleClickCapture = (e: Event) => {
  if (swipeHandled.value) {
    e.preventDefault()
    e.stopPropagation()
    swipeHandled.value = false
    return
  }
  if (swipeMoved.value) {
    e.preventDefault()
    e.stopPropagation()
    swipeMoved.value = false
    return
  }
  if (!isSelectable.value || !props.selectionMode) return
  e.preventDefault()
  e.stopPropagation()
  emit('toggle-select')
}

onBeforeUnmount(() => clearLongPress())

const mapsUrl = computed(() => {
  const lat = Number(props.locationLat)
  const lng = Number(props.locationLng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `https://maps.google.com/?q=${lat},${lng}`
})

const { getUrl, peekUrl, invalidateMedia, mediaCacheEpoch } = useChatMedia()

const audioEl = ref<HTMLAudioElement | null>(null)
const src = ref('')
const loading = ref(false)
const fullLoaded = ref(false)
const loadFailed = ref(false)
const playing = ref(false)
const lightbox = ref(false)
const lightboxMode = ref<'image'>('image')
const closeLightbox = () => {
  lightbox.value = false
  lightboxMode.value = 'image'
}
useHistoryBackClose(lightbox, closeLightbox, { key: 'ztLightbox' })
const current = ref(0)
const total = ref(props.duration || 0)

const progress = computed(() => {
  if (!total.value) return 0
  return Math.min(100, (current.value / total.value) * 100)
})

const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const currentLabel = computed(() => fmt(current.value))
const durationLabel = computed(() => fmt(total.value || props.duration || 0))

const isPdfMime = (mime?: string) => /pdf/i.test(String(mime || ''))
const isDocMime = (mime?: string, name?: string) => {
  const m = String(mime || '').toLowerCase()
  const n = String(name || '').toLowerCase()
  return (
    m.includes('word') ||
    m.includes('docx') ||
    m.includes('msword') ||
    /\.docx?$/i.test(n)
  )
}

const documentLabel = computed(() => {
  const t = String(props.text || '').trim()
  if (t) return t
  if (isPdfMime(props.mimeType)) return 'PDF hujjat'
  if (isDocMime(props.mimeType, props.text)) return 'Word hujjat'
  return 'Hujjat'
})

const isPdfDocument = computed(
  () =>
    props.type === 'document' &&
    (isPdfMime(props.mimeType) || /\.pdf$/i.test(String(props.text || ''))),
)

const documentIcon = computed(() =>
  isPdfDocument.value ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-word',
)

const isStickerVideo = computed(
  () =>
    props.type === 'sticker' &&
    String(props.mimeType || '').toLowerCase().startsWith('video/'),
)

const mediaKind = computed((): 'voice' | 'photo' | 'document' => {
  if (props.type === 'voice') return 'voice'
  if (props.type === 'document') return 'document'
  if (props.type === 'sticker' && isStickerVideo.value) return 'document'
  return 'photo'
})

const isMediaBubble = computed(
  () =>
    props.type === 'voice' ||
    props.type === 'photo' ||
    props.type === 'sticker' ||
    props.type === 'document',
)

const isRemoteMedia = (path?: string | null) => {
  const p = String(path || '').trim()
  return !p || p === 'remote'
}

// #region agent log
if (import.meta.client && isMediaBubble.value) {
  agentDebugLog({
    hypothesisId: 'D',
    location: 'MessageBubble.vue:setup',
    message: 'media_bubble_mounted',
    data: {
      messageId: props.messageId || null,
      type: props.type,
      mediaPath: props.mediaPath || null,
    },
  })
}
// #endregion

const applySrc = (url: string) => {
  src.value = url || ''
}

const applyCachedIfAny = (): boolean => {
  if (!props.messageId) return false
  const id = String(props.messageId)
  if (id.startsWith('temp-')) {
    const local = peekUrl(id)
    if (local) {
      applySrc(local)
      fullLoaded.value = true
      return true
    }
    return false
  }
  const cached = peekUrl(id, props.mediaPath || 'remote')
  if (!cached) return false
  applySrc(cached)
  fullLoaded.value = true
  return true
}

/** To'liq media — faqat foydalanuvchi bosganda yoki keshdan */
const loadFullMedia = async (opts: { force?: boolean } = {}) => {
  if (!props.messageId) return
  const id = String(props.messageId)
  if (id.startsWith('temp-')) {
    const local = peekUrl(id)
    if (local) {
      applySrc(local)
      fullLoaded.value = true
    }
    return
  }

  if (!opts.force && fullLoaded.value && src.value) return

  if (!opts.force) {
    const cachedUrl = await getUrl(props.messageId, mediaKind.value, {
      onlyCache: true,
      mediaPath: props.mediaPath || 'remote',
    })
    if (cachedUrl) {
      applySrc(cachedUrl)
      fullLoaded.value = true
      loadFailed.value = false
      return
    }
  }

  if (opts.force) {
    invalidateMedia(props.messageId)
    applySrc('')
    fullLoaded.value = false
  } else if (src.value) {
    return
  }

  loading.value = true
  try {
    const url = await getUrl(
      props.messageId,
      mediaKind.value,
      {
        forceNetwork: !!opts.force,
        mediaPath: props.mediaPath || 'remote',
      },
    )
    if (url) {
      applySrc(url)
      fullLoaded.value = true
      loadFailed.value = false
    } else {
      loadFailed.value = true
    }
  } catch (e) {
    console.error('media load', e)
    agentDebugLog({
      hypothesisId: 'D',
      location: 'MessageBubble.vue:loadFullMedia',
      message: 'loadFullMedia_fail',
      data: {
        messageId: props.messageId,
        type: props.type,
        mediaPath: props.mediaPath || null,
        force: !!opts.force,
        err: String((e as any)?.message || e),
      },
    })
    if (opts.force && props.messageId) invalidateMedia(props.messageId)
    applySrc('')
    fullLoaded.value = false
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

/** Ovoz — play bosilganda yuklanadi */
const ensureVoiceSrc = async (opts: { force?: boolean } = {}) => {
  if (!props.messageId) return
  const id = String(props.messageId)
  if (id.startsWith('temp-')) {
    const local = peekUrl(id)
    if (local) applySrc(local)
    return
  }
  if (opts.force) {
    invalidateMedia(props.messageId)
    applySrc('')
  } else if (src.value) {
    return
  }
  const cached = peekUrl(props.messageId, props.mediaPath || 'remote')
  if (cached && !opts.force) {
    applySrc(cached)
    return
  }
  loading.value = true
  try {
    const url = await getUrl(
      props.messageId,
      'voice',
      {
        forceNetwork: !!opts.force,
        mediaPath: props.mediaPath || 'remote',
      },
    )
    if (url) applySrc(url)
  } catch (e) {
    console.error('voice load', e)
    if (opts.force && props.messageId) invalidateMedia(props.messageId)
    applySrc('')
  } finally {
    loading.value = false
  }
}

const retryMedia = async () => {
  loadFailed.value = false
  applySrc('')
  fullLoaded.value = false
  if (props.type === 'voice') {
    await ensureVoiceSrc({ force: true })
    return
  }
  await loadFullMedia({ force: true })
}

/** Audio element tayyor bo'lguncha kutadi */
const waitCanPlay = (a: HTMLAudioElement, ms = 12_000) =>
  new Promise<void>((resolve, reject) => {
    if (a.readyState >= 2) {
      resolve()
      return
    }
    const t = setTimeout(() => {
      cleanup()
      reject(new Error('audio timeout'))
    }, ms)
    const onOk = () => {
      cleanup()
      resolve()
    }
    const onErr = () => {
      cleanup()
      reject(new Error('audio error'))
    }
    const cleanup = () => {
      clearTimeout(t)
      a.removeEventListener('canplay', onOk)
      a.removeEventListener('loadeddata', onOk)
      a.removeEventListener('error', onErr)
    }
    a.addEventListener('canplay', onOk, { once: true })
    a.addEventListener('loadeddata', onOk, { once: true })
    a.addEventListener('error', onErr, { once: true })
    try {
      a.load()
    } catch {
      /* */
    }
  })

const stopLocalVoice = () => {
  const a = audioEl.value
  if (a && !a.paused) a.pause()
  playing.value = false
  if (props.messageId) releaseVoicePlay(props.messageId)
}

const playAudio = async () => {
  await nextTick()
  const a = audioEl.value
  if (!a || !src.value) throw new Error('audio yo\'q')
  // Boshqa bubble dagi voice to'xtasin
  if (props.messageId) {
    claimVoicePlay(props.messageId, stopLocalVoice)
  }
  a.src = src.value
  await waitCanPlay(a)
  await a.play()
  playing.value = true
}

const toggle = async () => {
  if (props.selectionMode && isSelectable.value) {
    emit('toggle-select')
    return
  }
  const a = audioEl.value
  if (playing.value && a) {
    stopLocalVoice()
    return
  }

  // Play bosilganda serverdan yuklab olamiz
  await ensureVoiceSrc({ force: !src.value })
  try {
    await playAudio()
  } catch (e) {
    console.error('play', e)
    applySrc('')
    await ensureVoiceSrc({ force: true })
    try {
      await playAudio()
    } catch (e2) {
      console.error('play retry', e2)
      // #region agent log
      agentDebugLog({
        hypothesisId: 'E',
        location: 'MessageBubble.vue:toggle',
        message: 'voice_play_fail',
        data: {
          messageId: props.messageId,
          mediaPath: props.mediaPath || null,
          hasSrc: !!src.value,
          err: String((e2 as any)?.message || e2),
        },
      })
      // #endregion
      stopLocalVoice()
    }
  }
}

const openBlobExternal = (url: string, mime?: string, filename?: string) => {
  const name = String(filename || '').trim()
  if (isPdfMime(mime) || /\.pdf$/i.test(name)) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    if (name) a.download = name
    a.click()
  }
}

const handlePhotoStickerTap = async () => {
  if (swipeHandled.value) {
    swipeHandled.value = false
    return
  }
  if (props.selectionMode && isSelectable.value) {
    emit('toggle-select')
    return
  }
  if (!fullLoaded.value) {
    loadFailed.value = false
    await loadFullMedia({ force: true })
    if (!fullLoaded.value) return
  }
  openLightbox()
}

const openLightbox = () => {
  if (!fullLoaded.value || !src.value) return
  lightboxMode.value = 'image'
  lightbox.value = true
}

const openDocument = async () => {
  if (swipeHandled.value) {
    swipeHandled.value = false
    return
  }
  if (props.selectionMode && isSelectable.value) {
    emit('toggle-select')
    return
  }
  if (!fullLoaded.value) {
    loadFailed.value = false
    await loadFullMedia({ force: true })
  }
  if (!src.value) return
  openBlobExternal(src.value, props.mimeType, documentLabel.value)
}

const onTime = () => {
  if (audioEl.value) current.value = audioEl.value.currentTime
}

const onMeta = () => {
  if (audioEl.value && Number.isFinite(audioEl.value.duration)) {
    total.value = audioEl.value.duration
  }
}

const onEnded = () => {
  playing.value = false
  current.value = 0
  if (props.messageId) releaseVoicePlay(props.messageId)
}

const onAudioError = async () => {
  stopLocalVoice()
  await retryMedia()
}

const onImageError = () => {
  if (!fullLoaded.value) return
  loadFailed.value = true
  fullLoaded.value = false
  applySrc('')
}

const seek = (e: MouseEvent) => {
  const a = audioEl.value
  if (!a || !total.value) return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  a.currentTime = ratio * total.value
  current.value = a.currentTime
}

watch(
  () => props.messageId,
  (id, prevId) => {
    if (!isMediaBubble.value) return
    if (!id || id === prevId) return
    applySrc('')
    fullLoaded.value = false
    loadFailed.value = false
    if (id.startsWith('temp-') || applyCachedIfAny()) return
  },
  { immediate: true },
)

/** mediaPath yangilanganda — faqat allaqachon yuklangan bo'lsa */
watch(
  () => props.mediaPath,
  async (path, prev) => {
    if (!isMediaBubble.value) return
    if (!props.messageId || path === prev) return
    if (!fullLoaded.value) return
    const becameReady =
      isRemoteMedia(prev) && !isRemoteMedia(path)
    if (becameReady) {
      applySrc('')
      fullLoaded.value = false
      await loadFullMedia({ force: true })
    }
  },
)

watch(
  () => props.status,
  async (status, prev) => {
    if (props.type !== 'voice') return
    if (!props.messageId) return
    if (status === 'failed' && props.mediaPath && !src.value) {
      await ensureVoiceSrc()
      return
    }
    if (prev !== 'sending' || status === 'sending') return
    const cached = peekUrl(props.messageId, props.mediaPath)
    if (cached) applySrc(cached)
  },
)

/** Profil → kesh tozalanganda — faqat yuklangan media qayta olinadi */
watch(mediaCacheEpoch, () => {
  if (!isMediaBubble.value || !fullLoaded.value) return
  if (props.type === 'voice') {
    stopLocalVoice()
    applySrc('')
    void ensureVoiceSrc({ force: true })
    return
  }
  applySrc('')
  fullLoaded.value = false
  void loadFullMedia({ force: true })
})

onBeforeUnmount(() => {
  stopLocalVoice()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
