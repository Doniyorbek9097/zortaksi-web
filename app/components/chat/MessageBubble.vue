<template>
  <div
    class="flex"
    :class="[
      out ? 'justify-end' : 'justify-start',
      highlight ? 'ring-2 ring-amber-400/80 rounded-2xl' : '',
    ]"
  >
    <div
      class="relative max-w-[82%] rounded-2xl px-3.5 py-2 shadow-sm overflow-hidden"
      :class="[
        paymentCards || paymentRequest
          ? (out
            ? 'bg-teal-600 text-white rounded-br-md max-w-[92%]'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md border border-teal-300 dark:border-teal-700 max-w-[92%]')
          : out
            ? 'bg-sky-500 text-white rounded-br-md'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-700',
        paymentRequest && !paymentCards
          ? (out
            ? '!bg-sky-500'
            : '!border-sky-300 dark:!border-sky-700')
          : '',
        type === 'photo' ? '!p-1.5' : '',
      ]"
    >
      <!-- Voice player -->
      <div v-if="type === 'voice'" class="flex items-center gap-2.5 min-w-[180px] px-2 py-0.5">
        <button
          type="button"
          class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-all"
          :class="out ? 'bg-white/20 text-white' : 'bg-sky-500/15 text-sky-500'"
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
            :class="out ? 'bg-white/25' : 'bg-slate-200 dark:bg-slate-600'"
            @click="seek"
          >
            <div
              class="h-full rounded-full transition-[width] duration-100"
              :class="out ? 'bg-white' : 'bg-sky-500'"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div
            class="mt-1 flex justify-between text-[10px] tabular-nums"
            :class="out ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'"
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
          @click="openLightbox"
        >
          <div
            v-if="loading && !src"
            class="w-[220px] h-[160px] flex items-center justify-center"
          >
            <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-lg opacity-60" />
          </div>
          <img
            v-else-if="src"
            :src="src"
            alt="Rasm"
            class="max-w-[260px] max-h-[320px] w-full object-cover rounded-xl"
            loading="eager"
            @error="onImageError"
          >
          <div
            v-else
            class="w-[220px] h-[120px] flex flex-col items-center justify-center gap-1 text-xs opacity-70"
            @click.stop="retryMedia"
          >
            <span>Rasm yuklanmadi</span>
            <span class="underline">Qayta urinish</span>
          </div>
        </button>
        <p
          v-if="text"
          class="px-2 text-[15px] leading-relaxed"
          :class="out ? 'text-white' : ''"
        >
          <ChatLinkifiedText :text="text" :out="out" />
        </p>
      </div>

      <!-- Joylashuv -->
      <a
        v-else-if="type === 'location' && mapsUrl"
        :href="mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 min-w-[200px] px-1 py-1 no-underline"
        :class="out ? 'text-white' : 'text-slate-800 dark:text-slate-100'"
      >
        <span
          class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
          :class="out ? 'bg-white/20' : 'bg-sky-500/15 text-sky-500'"
        >
          <font-awesome-icon icon="fa-solid fa-location-dot" />
        </span>
        <span class="min-w-0">
          <span class="block text-[15px] font-semibold truncate">
            {{ locationTitle || 'Joylashuv' }}
          </span>
          <span
            class="block text-[11px] mt-0.5"
            :class="out ? 'text-white/75' : 'text-slate-500 dark:text-slate-400'"
          >
            Xaritada ochish
          </span>
        </span>
      </a>

      <!-- To'lov kartalari (admin javobi) -->
      <ChatPaymentCardsBubble
        v-else-if="paymentCards"
        :name="paymentCards.name"
        :owner="paymentCards.owner"
        :cards="paymentCards.cards"
        :out="out"
      />

      <!-- To'lov so'rovi (haydovchi → admin) -->
      <ChatPaymentRequestBubble
        v-else-if="paymentRequest"
        :type="paymentRequest.type"
        :name="paymentRequest.name"
        :phone="paymentRequest.phone"
        :tariff="paymentRequest.tariff"
        :amount="paymentRequest.amount"
        :pay-url="paymentRequest.payUrl"
        :user-id="paymentRequest.userId"
        :tariff-id="paymentRequest.tariffId"
        :payment-status="paymentRequest.paymentStatus"
        :date="date || undefined"
        :message-id="messageId"
        :out="out"
      />

      <!-- Matn (link / telefon bosiladi) -->
      <p
        v-else
        class="text-[15px] leading-relaxed"
      >
        <ChatLinkifiedText :text="text" :out="out" />
      </p>

      <div
        class="mt-1 flex items-center justify-end gap-1 text-[10px]"
        :class="[
          out ? 'text-white/70' : 'text-slate-400 dark:text-slate-500',
          type === 'photo' ? 'px-1.5 pb-0.5' : '',
        ]"
      >
        <span>{{ time }}</span>
        <template v-if="out">
          <font-awesome-icon v-if="status === 'sending'" icon="fa-solid fa-clock" class="text-[9px]" />
          <font-awesome-icon
            v-else-if="status === 'failed'"
            icon="fa-solid fa-exclamation-triangle"
            class="text-[9px] text-amber-200"
            title="Yuborilmadi"
          />
          <font-awesome-icon
            v-else
            :icon="(read || status === 'read') ? 'fa-solid fa-check-double' : 'fa-solid fa-check'"
            class="text-[9px]"
            :class="(read || status === 'read') ? 'text-sky-100' : ''"
          />
        </template>
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

    <!-- Rasm lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightbox"
          class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          @click.self="lightbox = false"
        >
          <button
            type="button"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="Yopish"
            @click="lightbox = false"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
          <img
            v-if="src"
            :src="src"
            alt="Rasm"
            class="max-w-full max-h-[90vh] object-contain rounded-lg"
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  time?: string
  date?: string | Date
  out?: boolean
  read?: boolean
  status?: 'sending' | 'sent' | 'failed' | 'read'
  type?: 'text' | 'photo' | 'video' | 'voice' | 'document' | 'location'
  messageId?: string
  /** Serverda media saqlangan yo'l — fonda yuklanganda player qayta urinadi */
  mediaPath?: string
  duration?: number
  locationLat?: number
  locationLng?: number
  locationTitle?: string
  highlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  time: '',
  date: '',
  out: false,
  read: false,
  status: 'sent',
  type: 'text',
  mediaPath: '',
  duration: 0,
  locationLat: undefined,
  locationLng: undefined,
  locationTitle: '',
  highlight: false,
})

const mapsUrl = computed(() => {
  const lat = Number(props.locationLat)
  const lng = Number(props.locationLng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `https://maps.google.com/?q=${lat},${lng}`
})

const { getUrl, peekUrl } = useChatMedia()

const pickLine = (raw: string, re: RegExp) => {
  const m = raw.match(re)
  return m?.[1]?.trim() || ''
}

/** [[ZT_PAYMENT_CARDS]] yoki oddiy karta matni */
const paymentCards = computed(() => {
  const raw = String(props.text || '')
  const m = raw.match(/\[\[ZT_PAYMENT_CARDS\]\]\s*([\s\S]*?)\s*\[\[\/ZT_PAYMENT_CARDS\]\]/)
  if (m?.[1]) {
    try {
      const data = JSON.parse(m[1].trim())
      const cards = (Array.isArray(data.cards) ? data.cards : [])
        .map((c: unknown) => String(c || '').replace(/\D/g, ''))
        .filter((c: string) => c.length >= 16)
      if (!cards.length) return null
      return {
        name: String(data.name || '').trim(),
        owner: String(data.owner || '').trim(),
        cards,
      }
    } catch {
      /* fallback below */
    }
  }

  // Telegram oddiy matn / eski format
  const digits = raw.replace(/\D/g, ' ').match(/\d{16}/g) || []
  const unique = [...new Set(digits)]
  if (
    unique.length >= 1 &&
    (/to['']lov so['']rovingiz qabul/i.test(raw) ||
      /karta egasi/i.test(raw) ||
      /kartadan biriga/i.test(raw) ||
      /💳/.test(raw))
  ) {
    return {
      name: pickLine(raw, /Assalomu alaykum[,\s]+(.+?)!/i).replace(/\s+/g, ' '),
      owner: pickLine(raw, /Karta egasi:\s*(.+)/i),
      cards: unique.slice(0, 3),
    }
  }
  return null
})

/** [[ZT_PAYMENT_REQUEST]] yoki oddiy so'rov matni */
const paymentRequest = computed(() => {
  const raw = String(props.text || '')
  const m = raw.match(/\[\[ZT_PAYMENT_REQUEST\]\]\s*([\s\S]*?)\s*\[\[\/ZT_PAYMENT_REQUEST\]\]/)
  if (m?.[1]) {
    try {
      const data = JSON.parse(m[1].trim())
      const statusRaw = String(data.paymentStatus || 'unpaid').trim().toLowerCase()
      return {
        type: String(data.type || (data.tariffId || data.tariff ? 'tariff' : 'topup')).trim(),
        name: String(data.name || '').trim(),
        phone: String(data.phone || '').trim(),
        tariff: String(data.tariff || '').trim(),
        amount: String(data.amount || '').trim(),
        payUrl: String(data.payUrl || '').trim(),
        userId: String(data.userId || '').trim(),
        tariffId: String(data.tariffId || '').trim(),
        paymentStatus: statusRaw === 'paid' ? 'paid' : 'unpaid',
      }
    } catch {
      /* fallback */
    }
  }

  if (
    /hisobni to['']ldir/i.test(raw) ||
    /tarif sotib olmoqchiman/i.test(raw) ||
    /🛒/.test(raw) ||
    /💰/.test(raw) ||
    (/karta raqamini yuboring/i.test(raw) && /summa/i.test(raw))
  ) {
    const url = pickLine(raw, /(https?:\/\/[^\s]+\/admin\/pay\/[^\s]+)/i)
      || pickLine(raw, /(https?:\/\/[^\s]+)/i)
    const tariff = pickLine(raw, /Tarif:\s*(.+)/i)
    const isTopup = /hisobni to['']ldir/i.test(raw) || !tariff
    return {
      type: isTopup ? 'topup' : 'tariff',
      name: pickLine(raw, /Ism:\s*(.+)/i),
      phone: pickLine(raw, /Tel:\s*(.+)/i),
      tariff,
      amount: pickLine(raw, /Summa:\s*([^\n]+?)(?:\s*so['']m)?$/im).replace(/\s*so['']m/i, '').trim(),
      payUrl: url,
      userId: '',
      tariffId: '',
      paymentStatus: 'unpaid',
    }
  }
  return null
})

const audioEl = ref<HTMLAudioElement | null>(null)
const src = ref('')
const loading = ref(false)
const playing = ref(false)
const lightbox = ref(false)
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

const mediaKind = computed(() => (props.type === 'voice' ? 'voice' : 'photo') as 'voice' | 'photo')

const syncSrcFromCache = () => {
  if (!props.messageId) return false
  const cached = peekUrl(props.messageId)
  if (cached && cached !== src.value) {
    src.value = cached
    return true
  }
  return !!cached
}

const ensureSrc = async (opts: { force?: boolean } = {}) => {
  if (!props.messageId) return
  if (!opts.force && syncSrcFromCache()) return
  if (!opts.force && src.value) return
  loading.value = true
  try {
    const url = await getUrl(
      props.messageId,
      mediaKind.value,
      opts.force ? { forceNetwork: true } : {},
    )
    if (url) src.value = url
  } catch (e) {
    console.error('media load', e)
    if (syncSrcFromCache()) return
    src.value = ''
  } finally {
    loading.value = false
  }
}

const retryMedia = async () => {
  src.value = ''
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

const playAudio = async () => {
  await nextTick()
  const a = audioEl.value
  if (!a || !src.value) throw new Error('audio yo\'q')
  a.src = src.value
  await waitCanPlay(a)
  await a.play()
  playing.value = true
}

const toggle = async () => {
  const a = audioEl.value
  if (playing.value && a) {
    a.pause()
    playing.value = false
    return
  }

  // Avval kesh, keyin majburiy server (M4A)
  await ensureSrc({ force: !src.value })
  try {
    await playAudio()
  } catch (e) {
    console.error('play', e)
    src.value = ''
    await ensureSrc({ force: true })
    try {
      await playAudio()
    } catch (e2) {
      console.error('play retry', e2)
      playing.value = false
    }
  }
}

const openLightbox = async () => {
  if (!src.value) await ensureSrc({ force: true })
  else await ensureSrc()
  if (!src.value) await ensureSrc({ force: true })
  if (src.value) lightbox.value = true
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
}

const onAudioError = async () => {
  playing.value = false
  if (props.messageId && peekUrl(props.messageId) && peekUrl(props.messageId) !== src.value) {
    syncSrcFromCache()
    return
  }
  await retryMedia()
}

const onImageError = async () => {
  if (props.messageId && peekUrl(props.messageId) && peekUrl(props.messageId) !== src.value) {
    syncSrcFromCache()
    return
  }
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
  async (id, prevId) => {
    if (props.type !== 'voice' && props.type !== 'photo') return
    if (!id) {
      src.value = ''
      return
    }
    if (id !== prevId) src.value = ''
    // remote — serverdan; diskdagi path — oddiy yuklash
    const force = !props.mediaPath || props.mediaPath === 'remote'
    await ensureSrc({ force })
  },
  { immediate: true },
)

// Telegram media avval 'remote', fonda yuklangach haqiqiy path — qayta yuklash
watch(
  () => props.mediaPath,
  async (path, prev) => {
    if (props.type !== 'voice' && props.type !== 'photo') return
    if (!props.messageId || !path || path === prev) return
    // remote → hali diskda yo'q, lekin lazy API ishlashi mumkin
    if (path === 'remote') {
      await ensureSrc({ force: true })
      return
    }
    // Endi diskda — majburiy qayta olish
    src.value = ''
    await ensureSrc({ force: true })
  },
)

// remote bo'lganda fonda saqlanishini kutib qayta urinish
let remotePoll: ReturnType<typeof setInterval> | null = null
watch(
  () => [props.mediaPath, props.messageId, props.type] as const,
  ([path, id, type]) => {
    if (remotePoll) {
      clearInterval(remotePoll)
      remotePoll = null
    }
    if ((type !== 'voice' && type !== 'photo') || !id || path !== 'remote') return
    let tries = 0
    remotePoll = setInterval(() => {
      tries += 1
      if (tries > 12 || src.value) {
        if (remotePoll) clearInterval(remotePoll)
        remotePoll = null
        return
      }
      void ensureSrc({ force: true })
    }, 2500)
  },
  { immediate: true },
)

watch(
  () => props.status,
  async (status, prev) => {
    if (props.type !== 'voice' && props.type !== 'photo') return
    if (!props.messageId) return
    if (prev === 'sending' && status !== 'sending') {
      src.value = ''
      await ensureSrc()
    }
  },
)

onBeforeUnmount(() => {
  audioEl.value?.pause()
  if (remotePoll) {
    clearInterval(remotePoll)
    remotePoll = null
  }
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
