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
          touchAction: selectionMode ? 'auto' : 'pan-y',
        }"
        @pointerdown="onSwipePointerDown"
        @pointermove="onSwipePointerMove"
        @pointerup="onSwipePointerUp"
        @pointercancel="onSwipePointerUp"
      >
    <div
      class="relative max-w-full rounded-2xl px-3.5 py-2 shadow-sm overflow-hidden select-none touch-manipulation"
      :class="[
        'bg-white text-slate-800 border border-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
        out ? 'rounded-br-md' : 'rounded-bl-md',
        type === 'photo' ? '!p-1.5' : '',
        isFileBadge ? '!p-2' : '',
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

      <!-- Rasm -->
      <div v-else-if="type === 'photo'" class="space-y-1.5">
        <button
          type="button"
          class="block w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5"
          @click.stop="handlePhotoTap"
        >
          <div
            v-if="loading && !src"
            class="w-full min-w-[120px] max-w-[320px] h-[160px] flex items-center justify-center"
          >
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-lg opacity-60" />
          </div>
          <img
            v-else-if="src"
            :src="src"
            alt="Rasm"
            class="block w-full max-w-[320px] max-h-[420px] object-contain rounded-xl mx-auto"
            loading="lazy"
            @error="onImageError"
          >
          <div
            v-else-if="!loading"
            class="w-full min-w-[120px] max-w-[320px] h-[120px] flex flex-col items-center justify-center gap-1.5 text-xs opacity-80"
          >
            <font-awesome-icon icon="fa-solid fa-image" class="text-lg" />
            <span>Rasmni ko'rish</span>
          </div>
          <div
            v-else
            class="w-full min-w-[120px] max-w-[320px] h-[120px] flex flex-col items-center justify-center gap-1 text-xs opacity-70"
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

      <!-- Stiker, PDF, APK va boshqa fayllar — faqat tur ko'rsatiladi -->
      <div v-else-if="isFileBadge" class="space-y-1.5 min-w-[180px]">
        <div
          class="flex items-center gap-3 w-full max-w-[320px] rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/80"
        >
          <span
            class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg bg-slate-500/10 text-slate-500 dark:text-slate-300"
          >
            <font-awesome-icon :icon="fileTypeIcon" class="text-xl" />
          </span>
          <span class="min-w-0 flex-1 text-left">
            <span class="block text-[14px] font-semibold text-slate-800 dark:text-slate-100">
              {{ fileTypeLabel }}
            </span>
          </span>
        </div>
        <p
          v-if="text && text !== fileTypeLabel"
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
        :class="type === 'photo' || isFileBadge ? 'px-1.5 pb-0.5' : ''"
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

    <!-- Rasm lightbox -->
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
            v-if="src"
            :src="src"
            alt="Rasm"
            class="max-w-[min(100vw-2rem,1400px)] max-h-[min(100vh-4rem,90vh)] w-auto h-auto object-contain rounded-lg shadow-2xl"
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { agentDebugLog } from '~/utils/agentDebugLog'
import { claimVoicePlay, releaseVoicePlay } from '~/composables/useExclusiveVoicePlay'
import {
  getChatFileTypeIcon,
  getChatFileTypeLabel,
  isChatFileBadgeType,
} from '~/utils/chatFileTypeLabel'

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

const onSwipePointerUp = () => {
  if (!swipeDragging.value && swipeAxis.value !== 'h') {
    swipeAxis.value = null
    return
  }
  swipeDragging.value = false
  if (swipeAxis.value === 'h' && swipeX.value >= SWIPE_REVEAL * 0.65) {
    emit('reply')
  } else if (swipeAxis.value === 'h' && swipeX.value <= -SWIPE_REVEAL * 0.65) {
    emit('delete')
  }
  swipeX.value = 0
  swipeAxis.value = null
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
const playing = ref(false)
const lightbox = ref(false)
const closeLightbox = () => {
  lightbox.value = false
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

const isFileBadge = computed(() => isChatFileBadgeType(props.type))

const fileTypeLabel = computed(() =>
  getChatFileTypeLabel(props.type, props.mimeType, props.text),
)

const fileTypeIcon = computed(() =>
  getChatFileTypeIcon(props.type, props.mimeType, props.text),
)

const mediaKind = computed((): 'voice' | 'photo' => {
  if (props.type === 'voice') return 'voice'
  return 'photo'
})

const isMediaBubble = computed(
  () => props.type === 'voice' || props.type === 'photo',
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

const ensureSrc = async (opts: { force?: boolean } = {}) => {
  if (!props.messageId || props.type !== 'photo') return
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
      mediaKind.value,
      {
        forceNetwork: !!opts.force,
        mediaPath: props.mediaPath || 'remote',
      },
    )
    if (url) applySrc(url)
  } catch (e) {
    console.error('media load', e)
    agentDebugLog({
      hypothesisId: 'D',
      location: 'MessageBubble.vue:ensureSrc',
      message: 'ensureSrc_fail',
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
  applySrc('')
  if (props.type === 'voice') {
    await ensureVoiceSrc({ force: true })
    return
  }
  await ensureSrc({ force: true })
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

const openLightbox = () => {
  if (!src.value) return
  lightbox.value = true
}

const handlePhotoTap = async () => {
  if (props.selectionMode && isSelectable.value) {
    emit('toggle-select')
    return
  }
  if (!src.value) {
    loading.value = true
    try {
      await ensureSrc({ force: true })
    } finally {
      loading.value = false
    }
  }
  openLightbox()
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

const onImageError = async () => {
  await retryMedia()
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
    if (!id || id !== prevId) {
      applySrc('')
      if (!id) return
      if (id.startsWith('temp-')) {
        const local = peekUrl(id)
        if (local) applySrc(local)
        return
      }
      const cached = peekUrl(id, props.mediaPath)
      if (cached) {
        applySrc(cached)
        return
      }
      if (props.type === 'photo') {
        void ensureSrc()
      }
    }
  },
  { immediate: true },
)

/** mediaPath yangilanganda (remote → disk) */
watch(
  () => props.mediaPath,
  async (path, prev) => {
    if (!isMediaBubble.value) return
    if (!props.messageId || path === prev) return
    const becameReady =
      isRemoteMedia(prev) && !isRemoteMedia(path)
    if (becameReady) {
      applySrc('')
      if (props.type === 'photo') await ensureSrc({ force: true })
      return
    }
    if (!src.value && props.type === 'photo') {
      await ensureSrc()
    }
  },
)

watch(
  () => props.status,
  async (status, prev) => {
    if (!isMediaBubble.value) return
    if (!props.messageId) return
    if (status === 'failed' && props.mediaPath && !src.value) {
      if (props.type === 'voice') await ensureVoiceSrc()
      else if (props.type === 'photo') await ensureSrc()
      return
    }
    if (prev !== 'sending' || status === 'sending') return
    const cached = peekUrl(props.messageId, props.mediaPath)
    if (cached) {
      applySrc(cached)
      return
    }
    if (!src.value) {
      if (props.type === 'voice') await ensureVoiceSrc()
      else if (props.type === 'photo') await ensureSrc()
    }
  },
)

/** Profil → kesh tozalanganda bubble ni qayta yuklash */
watch(mediaCacheEpoch, () => {
  if (!isMediaBubble.value) return
  if (props.type === 'voice') {
    stopLocalVoice()
    applySrc('')
    void ensureVoiceSrc({ force: true })
    return
  }
  stopLocalVoice()
  applySrc('')
  if (!isRemoteMedia(props.mediaPath) && props.type === 'photo') {
    void ensureSrc({ force: true })
  }
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
