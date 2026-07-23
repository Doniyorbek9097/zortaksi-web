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
          :disabled="loading || !src"
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
          >
          <div
            v-else
            class="w-[220px] h-[120px] flex items-center justify-center text-xs opacity-60"
          >
            Rasm yuklanmadi
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
        :name="paymentRequest.name"
        :phone="paymentRequest.phone"
        :tariff="paymentRequest.tariff"
        :amount="paymentRequest.amount"
        :pay-url="paymentRequest.payUrl"
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
        v-if="type === 'voice' && src"
        ref="audioEl"
        :src="src"
        preload="auto"
        class="hidden"
        @timeupdate="onTime"
        @ended="onEnded"
        @loadedmetadata="onMeta"
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
  out?: boolean
  read?: boolean
  status?: 'sending' | 'sent' | 'failed' | 'read'
  type?: 'text' | 'photo' | 'video' | 'voice' | 'document'
  messageId?: string
  duration?: number
  highlight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  time: '',
  out: false,
  read: false,
  status: 'sent',
  type: 'text',
  duration: 0,
  highlight: false,
})

const { getUrl } = useChatMedia()

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
      return {
        name: String(data.name || '').trim(),
        phone: String(data.phone || '').trim(),
        tariff: String(data.tariff || '').trim(),
        amount: String(data.amount || '').trim(),
        payUrl: String(data.payUrl || '').trim(),
      }
    } catch {
      /* fallback */
    }
  }

  if (
    /tarif sotib olmoqchiman/i.test(raw) ||
    /🛒/.test(raw) ||
    (/karta raqamini yuboring/i.test(raw) && /summa/i.test(raw))
  ) {
    const url = pickLine(raw, /(https?:\/\/[^\s]+\/admin\/pay\/[^\s]+)/i)
      || pickLine(raw, /(https?:\/\/[^\s]+)/i)
    return {
      name: pickLine(raw, /Ism:\s*(.+)/i),
      phone: pickLine(raw, /Tel:\s*(.+)/i),
      tariff: pickLine(raw, /Tarif:\s*(.+)/i),
      amount: pickLine(raw, /Summa:\s*([^\n]+?)(?:\s*so['']m)?$/im).replace(/\s*so['']m/i, '').trim(),
      payUrl: url,
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

const ensureSrc = async () => {
  if (src.value || !props.messageId) return
  loading.value = true
  try {
    src.value = await getUrl(props.messageId)
  } catch (e) {
    console.error('media load', e)
  } finally {
    loading.value = false
  }
}

const toggle = async () => {
  await ensureSrc()
  await nextTick()
  const a = audioEl.value
  if (!a || !src.value) return
  if (playing.value) {
    a.pause()
    playing.value = false
  } else {
    try {
      await a.play()
      playing.value = true
    } catch (e) {
      console.error('play', e)
    }
  }
}

const openLightbox = async () => {
  await ensureSrc()
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
  async (id) => {
    if ((props.type === 'voice' || props.type === 'photo') && id && !id.startsWith('temp-')) {
      await ensureSrc()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  audioEl.value?.pause()
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
