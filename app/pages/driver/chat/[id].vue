<template>
  <!-- visualViewport: klaviatura ochilganda header ko'rinib turadi -->
  <div
    class="fixed left-0 right-0 z-40 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    :style="shellStyle"
  >
    <!-- Header — support ham oddiy chat ko'rinishida -->
    <ChatHeader
      :name="name"
      :status="statusText"
      :online="isOnline"
      :avatar="peerAvatar"
      :user-id="peerUserId"
      :can-call="!!callPhone"
      @back="goChats"
      @call="onCall"
    />

    <!-- Xabarlar -->
    <div ref="scrollEl" class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div class="mx-auto w-full max-w-2xl px-3 py-4 space-y-2 min-h-full flex flex-col">
        <!-- Order e'lon / haydovchi konteksti -->
        <div
          v-if="showOrderBanner"
          class="rounded-2xl px-3.5 py-3 border"
          :class="isDirect
            ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200/70 dark:border-sky-800/50'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/50'"
        >
          <p
            class="text-[10px] font-black uppercase tracking-[0.16em] mb-1.5"
            :class="isDirect
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-amber-600 dark:text-amber-400'"
          >
            {{ orderBannerLabel }}
          </p>
          <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
            <ChatLinkifiedText :text="displayOrderText" />
          </p>
        </div>

        <!-- Loading -->
        <div v-if="chatStore.isLoadingMessages && !chatStore.messages.length" class="space-y-2">
          <div v-for="n in 6" :key="n" class="h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" :class="n % 2 ? 'w-1/2' : 'w-2/3 ml-auto'" />
        </div>

        <!-- Empty -->
        <BaseEmptyState
          v-else-if="!chatStore.messages.length"
          icon="fa-solid fa-comments"
          title="Xabar yozishga tayyor"
          class="!min-h-0 flex-1"
        />

        <ChatMessageBubble
          v-for="msg in chatStore.messages"
          :key="msg._id"
          :id="`msg-${msg._id}`"
          :text="msg.text"
          :time="formatTime(msg.date)"
          :date="msg.date"
          :out="msg.direction === 'out'"
          :read="msg.status === 'read'"
          :status="msg.status"
          :type="msg.type"
          :message-id="msg._id"
          :media-path="msg.mediaPath"
          :duration="msg.duration"
          :location-lat="msg.locationLat"
          :location-lng="msg.locationLng"
          :location-title="msg.locationTitle"
          :highlight="focusId === msg._id"
        />

        <!-- Admin yozmoqda... -->
        <div
          v-if="chatStore.isPeerTyping"
          class="flex justify-start"
        >
          <div
            class="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] font-bold border bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
          >
            <span class="inline-flex items-center gap-1">
              yozmoqda
              <span class="typing-dots" aria-hidden="true">
                <i /><i /><i />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ulanish banneri — faqat BIRINCHI ulanishda (oldingi bog'langan chatda ko'rsatilmaydi) -->
    <div v-if="needsTelegramConnect && conn === 'connecting' && !wasLinkedBefore" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
        Foydalanuvchiga ulanmoqda... Iltimos kuting
      </div>
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'restricted'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="mr-1.5" />
          {{ connReason || 'Hozircha bu foydalanuvchiga yozib bo\'lmaydi (spam yoki bloklangan).' }}
        </p>
        <a
          v-if="callPhone"
          :href="normalizeTelHref(callPhone)"
          class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
        >
          <font-awesome-icon icon="fa-solid fa-phone" /> Telefon qilishingiz mumkin
        </a>
        <button
          v-else
          type="button"
          class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-amber-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
          @click="goOrders"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> Buyurtmalarga o'tish
        </button>
      </div>
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'unreachable'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-ban" class="mr-1.5" />
          {{ callPhone
            ? 'Xabar yozib bo\'lmaydi. Telefon qilishingiz mumkin.'
            : 'Bu foydalanuvchi bilan bog\'lanish imkoni yo\'q. Buyurtmalarga o\'ting.' }}
        </p>
        <a
          v-if="callPhone"
          :href="normalizeTelHref(callPhone)"
          class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
        >
          <font-awesome-icon icon="fa-solid fa-phone" /> Telefon qilish
        </a>
        <button
          v-else
          type="button"
          class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-red-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
          @click="goOrders"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> Buyurtmalarga o'tish
        </button>
      </div>
    </div>

    <!-- Composer — ochilish/loading paytida ham ko'rinsin -->
    <ChatComposer
      v-if="showComposer"
      v-model="draft"
      :disabled="composerDisabled"
      :placeholder="composerPlaceholder"
      @send="onSend"
      @voice="onVoice"
      @photo="onPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { normalizeTelHref, resolveChatPhone } from '~/utils/phone'

definePageMeta({
  layout: false,
})

const route = useRoute()
const chatStore = useChatStore()

const chatId = computed(() => route.params.id as string)
/** Order/interest dan darhol ochilish — API chat sahifasida ishlaydi */
const isOpening = computed(() => chatId.value === 'open')

const isSupport = computed(() =>
  chatStore.currentChat?.kind === 'support' || route.query.support === '1'
)

/** Ro'yxatdan o'tgan haydovchi ↔ haydovchi (qiziqqanlar va h.k.) */
const isDirect = computed(() => chatStore.currentChat?.kind === 'direct')

/** Telegram ulanishi shart emas — ilova ichidagi chat */
const isInAppChat = computed(() => isSupport.value || isDirect.value)
const needsTelegramConnect = computed(() => !isInAppChat.value)

/** Peer ismi — haydovchi ham oddiy foydalanuvchi kabi (haqiqiy ism) */
const name = computed(() => {
  const p = chatStore.currentChat?.peer
  if (p) {
    const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
    if (full) return full
    if (p.username) return p.username
    if (p.userId) return p.userId
  }
  const qName = (route.query.name as string) || ''
  if (qName) return qName
  if (isSupport.value) return 'Admin'
  if (isDirect.value) return 'Haydovchi'
  return 'Buyurtmachi'
})

const peerAvatar = computed(() => chatStore.currentChat?.peer?.avatar)
const peerUserId = computed(() => chatStore.currentChat?.peer?.userId)

const isOnline = computed(() => !!chatStore.peerPresence?.online)
const statusText = computed(() => {
  if (isOpening.value || chatStore.isLoadingMessages) return 'ochilmoqda...'
  if (chatStore.isPeerTyping) return 'yozmoqda...'
  if (chatStore.peerPresence?.label) return chatStore.peerPresence.label
  if (isDirect.value) return 'Haydovchi'
  return '...'
})

const orderText = computed(() =>
  String(chatStore.currentChat?.orderText || '').trim()
)

/** Direct chatda buyurtma matni o'rniga fixed kontekst xabari */
const showOrderBanner = computed(() => isDirect.value || !!orderText.value)

const orderBannerLabel = computed(() =>
  isDirect.value ? 'Haydovchi' : "Buyurtma e'loni"
)

const displayOrderText = computed(() => {
  if (isDirect.value) return "Bu Haydovchi bilan suhbat qurishingiz mumkin"
  return orderText.value.replace(/^\[Buyurtma\]\s*/i, '').trim() || orderText.value
})

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const focusId = ref(String(route.query.focus || ''))

/**
 * Klaviatura ochilganda visualViewport;
 * yopiq holatda 100dvh — Telegram offsetTop + safe-area qo'shilib
 * yuqori/pastki ~100px bo'shliq qolmasin.
 */
const shellStyle = ref<Record<string, string>>({
  top: '0px',
  height: '100dvh',
})

const syncViewport = () => {
  if (!import.meta.client) return
  const vv = window.visualViewport
  if (!vv) {
    shellStyle.value = { top: '0px', height: '100dvh' }
    return
  }
  const keyboardGap = window.innerHeight - vv.height
  const keyboardOpen = keyboardGap > 80
  if (keyboardOpen) {
    shellStyle.value = {
      top: `${Math.max(0, vv.offsetTop)}px`,
      height: `${Math.max(0, vv.height)}px`,
    }
    return
  }
  shellStyle.value = { top: '0px', height: '100dvh' }
}

// Ulanish holati (senderga yozish mumkinmi)
const conn = computed(() => chatStore.connectionStatus)
const connReason = computed(() => chatStore.connectionReason)

/** Oldin muvaffaqiyatli bog'langan — "ulanmoqda" ko'rsatilmasin, yozish ochiq */
const wasLinkedBefore = computed(() => {
  const peer = chatStore.currentChat?.peer
  return !!(peer?.viaUserbotId || peer?.accessHash)
})

const canSendTelegram = computed(
  () => isInAppChat.value || wasLinkedBefore.value || conn.value === 'ready',
)

/** Loading / open — input yo'qolmasin */
const composerBusy = computed(
  () => isOpening.value || chatStore.isLoadingMessages,
)

const showComposer = computed(
  () =>
    isOpening.value ||
    composerBusy.value ||
    isInAppChat.value ||
    wasLinkedBefore.value ||
    conn.value === 'ready' ||
    conn.value === 'connecting' ||
    conn.value === 'idle',
)

const composerDisabled = computed(
  () => composerBusy.value || (!isInAppChat.value && !wasLinkedBefore.value && conn.value !== 'ready'),
)

const composerPlaceholder = computed(() => {
  if (composerBusy.value) return 'Biroz kuting...'
  if (!isInAppChat.value && !wasLinkedBefore.value && conn.value !== 'ready') {
    return 'Yozish uchun ulanish kutilmoqda...'
  }
  return 'Xabar yozing...'
})

const formatTime = (value: string | Date) => {
  const d = new Date(value)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

const scrollToFocus = () => {
  if (!focusId.value) {
    scrollToBottom()
    return
  }
  nextTick(() => {
    const el = document.getElementById(`msg-${focusId.value}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => { focusId.value = '' }, 2500)
    } else {
      scrollToBottom()
    }
  })
}

const onSend = async (text: string) => {
  if (isOpening.value || !canSendTelegram.value) return
  await chatStore.sendMessage(chatId.value, text)
  scrollToBottom()
}

const onVoice = async (blob: Blob, seconds: number) => {
  if (isOpening.value || !canSendTelegram.value) return
  await chatStore.sendVoice(chatId.value, blob, seconds)
  scrollToBottom()
}

const onPhoto = async (file: File) => {
  if (isOpening.value || !canSendTelegram.value) return
  await chatStore.sendPhoto(chatId.value, file)
  scrollToBottom()
}

const goChats = () => navigateTo('/driver/chats')
const goOrders = () => navigateTo('/driver/orders')

const callPhone = computed(() =>
  resolveChatPhone({
    messages: chatStore.messages,
    peerPhone: chatStore.currentChat?.peer?.phone,
    fallbackPhone: route.query.phone as string | undefined,
  })
)

const onCall = () => {
  if (!callPhone.value || !import.meta.client) return
  window.location.href = normalizeTelHref(callPhone.value)
}

// Yangi xabar kelganda pastga surish
watch(() => chatStore.messages.length, scrollToBottom)
watch(() => chatStore.isPeerTyping, (v) => { if (v) scrollToBottom() })

let presenceTimer: ReturnType<typeof setInterval> | null = null
let loadSeq = 0
let prevBodyOverflow = ''
let prevHtmlOverflow = ''

const clearPresenceTimer = () => {
  if (presenceTimer) {
    clearInterval(presenceTimer)
    presenceTimer = null
  }
}

const resetChatUi = () => {
  clearPresenceTimer()
  chatStore.messages = []
  chatStore.currentChat = null
  chatStore.resetConnection()
  chatStore.isLoadingMessages = true
  draft.value = ''
  focusId.value = String(route.query.focus || '')
}

const startPresenceLoop = (id: string) => {
  clearPresenceTimer()
  presenceTimer = setInterval(() => {
    void chatStore.fetchPresence(id)
  }, 45000)
}

const setupConnection = (id: string) => {
  if (isInAppChat.value) {
    chatStore.connectionStatus = 'ready'
    void chatStore.fetchPresence(id)
    startPresenceLoop(id)
    return
  }

  const peer = chatStore.currentChat?.peer
  const alreadyLinked = !!(peer?.viaUserbotId || peer?.accessHash)
  if (alreadyLinked) {
    chatStore.connectionStatus = 'ready'
    void chatStore.connect(id, { silent: true })
  } else {
    void chatStore.connect(id)
  }
  startPresenceLoop(id)
}

/** Order tugmasidan kelgan ochilish — API shu yerda, keyin real chatId ga replace */
const bootstrapOpenChat = async (seq: number) => {
  const mode = String(route.query.open || '')
  const orderId = String(route.query.orderId || '')
  const userId = String(route.query.userId || '')
  const username = String(route.query.username || '').replace(/^@/, '')

  const fail = async () => {
    if (seq !== loadSeq) return
    chatStore.isLoadingMessages = false
    if (username && (mode === 'order' || mode === 'agent')) {
      if (import.meta.client) window.open(`https://t.me/${username}`, '_blank')
    }
    await navigateTo('/driver/orders')
  }

  try {
    let res: any
    if (mode === 'order' && orderId) {
      res = await chatStore.startChatFromOrder(orderId)
    } else if (mode === 'booked' && orderId) {
      res = await chatStore.startChatWithBookedDriver(orderId)
    } else if (mode === 'agent' && orderId) {
      res = await chatStore.startChatWithOrderOwner(orderId)
    } else if (mode === 'user' && userId) {
      res = await chatStore.startChatWithUser(userId, orderId || undefined)
    } else {
      await fail()
      return
    }

    if (seq !== loadSeq) return

    if (res?.success && res.data?._id) {
      const q: Record<string, string> = {}
      const nameQ = String(route.query.name || '')
      const phoneQ = String(route.query.phone || '')
      if (nameQ) q.name = nameQ
      if (phoneQ) q.phone = phoneQ
      await navigateTo({
        path: `/driver/chat/${res.data._id}`,
        query: Object.keys(q).length ? q : undefined,
        replace: true,
      })
      return
    }
    await fail()
  } catch (err) {
    console.error('bootstrapOpenChat error:', err)
    await fail()
  }
}

const loadChat = async (id: string) => {
  const seq = ++loadSeq
  resetChatUi()

  if (id === 'open') {
    await bootstrapOpenChat(seq)
    return
  }

  const listed = chatStore.chats.find((c) => c._id === id)
  if (listed?.peer?.viaUserbotId || listed?.peer?.accessHash) {
    chatStore.connectionStatus = 'ready'
  }

  try {
    await chatStore.fetchMessages(id)
  } catch (err) {
    console.error('loadChat fetchMessages error:', err)
  }
  if (seq !== loadSeq) return

  scrollToFocus()
  setupConnection(id)
}

// Chat → chat: component qayta mount bo'lmasa ham yangilanadi
watch(chatId, (id) => {
  if (!id) return
  void loadChat(id)
}, { immediate: true })

onMounted(() => {
  prevBodyOverflow = document.body.style.overflow
  prevHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'

  syncViewport()
  window.visualViewport?.addEventListener('resize', syncViewport)
  window.visualViewport?.addEventListener('scroll', syncViewport)
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  loadSeq += 1
  window.visualViewport?.removeEventListener('resize', syncViewport)
  window.visualViewport?.removeEventListener('scroll', syncViewport)
  window.removeEventListener('resize', syncViewport)
  document.body.style.overflow = prevBodyOverflow
  document.documentElement.style.overflow = prevHtmlOverflow

  clearPresenceTimer()
  chatStore.currentChat = null
  chatStore.messages = []
  chatStore.resetConnection()
})
</script>

<style scoped>
.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 2px;
}
.typing-dots i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.35;
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.typing-dots i:nth-child(2) { animation-delay: 0.15s; }
.typing-dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes typing-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}
</style>
