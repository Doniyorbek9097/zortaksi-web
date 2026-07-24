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
        <!-- Order e'lon matni -->
        <div
          v-if="orderText"
          class="rounded-2xl px-3.5 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400 mb-1.5">
            Buyurtma e'loni
          </p>
          <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
            <ChatLinkifiedText :text="orderText" />
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
          :duration="msg.duration"
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

    <!-- Ulanish holati banneri (support chatda kerak emas) -->
    <div v-if="!isSupport && (conn === 'connecting' || conn === 'idle')" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
        Yo'lovchiga ulanmoqda... Iltimos kuting
      </div>
    </div>

    <div v-else-if="!isSupport && conn === 'restricted'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="mr-1.5" />
          {{ connReason || 'Hozircha bu yo\'lovchiga yozib bo\'lmaydi (spam yoki bloklangan).' }}
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

    <div v-else-if="!isSupport && conn === 'unreachable'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-ban" class="mr-1.5" />
          {{ callPhone
            ? 'Xabar yozib bo\'lmaydi. Telefon qilishingiz mumkin.'
            : 'Bu yo\'lovchi bilan bog\'lanish imkoni yo\'q. Buyurtmalarga o\'ting.' }}
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

    <!-- Composer — support doim ochiq; oddiy chatda ulanish kutadi -->
    <ChatComposer
      v-if="isSupport || conn === 'ready' || conn === 'connecting' || conn === 'idle'"
      v-model="draft"
      :disabled="!isSupport && conn !== 'ready'"
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

const isSupport = computed(() =>
  chatStore.currentChat?.kind === 'support' || route.query.support === '1'
)

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
  return isSupport.value ? 'Admin' : 'Buyurtmachi'
})

const peerAvatar = computed(() => chatStore.currentChat?.peer?.avatar)
const peerUserId = computed(() => chatStore.currentChat?.peer?.userId)

const isOnline = computed(() => !!chatStore.peerPresence?.online)
const statusText = computed(() => {
  if (chatStore.isPeerTyping) return 'yozmoqda...'
  if (chatStore.peerPresence?.label) return chatStore.peerPresence.label
  return '...'
})

const orderText = computed(() =>
  String(chatStore.currentChat?.orderText || '').trim()
)

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const focusId = ref(String(route.query.focus || ''))

/** Klaviatura / visualViewport — shell doim ko'rinadigan zonada */
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
  shellStyle.value = {
    top: `${Math.max(0, vv.offsetTop)}px`,
    height: `${Math.max(0, vv.height)}px`,
  }
}

// Ulanish holati (senderga yozish mumkinmi)
const conn = computed(() => chatStore.connectionStatus)
const connReason = computed(() => chatStore.connectionReason)

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
  if (!isSupport.value && chatStore.connectionStatus !== 'ready') return
  await chatStore.sendMessage(chatId.value, text)
  scrollToBottom()
}

const onVoice = async (blob: Blob, seconds: number) => {
  if (!isSupport.value && chatStore.connectionStatus !== 'ready') return
  await chatStore.sendVoice(chatId.value, blob, seconds)
  scrollToBottom()
}

const onPhoto = async (file: File) => {
  if (!isSupport.value && chatStore.connectionStatus !== 'ready') return
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
let prevBodyOverflow = ''
let prevHtmlOverflow = ''

onMounted(async () => {
  prevBodyOverflow = document.body.style.overflow
  prevHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'

  syncViewport()
  window.visualViewport?.addEventListener('resize', syncViewport)
  window.visualViewport?.addEventListener('scroll', syncViewport)
  window.addEventListener('resize', syncViewport)

  await chatStore.fetchMessages(chatId.value)
  scrollToFocus()

  if (isSupport.value || chatStore.currentChat?.kind === 'support') {
    chatStore.connectionStatus = 'ready'
    void chatStore.fetchPresence(chatId.value)
    presenceTimer = setInterval(() => {
      chatStore.fetchPresence(chatId.value)
    }, 45000)
  } else {
    const peer = chatStore.currentChat?.peer
    const alreadyLinked = !!(peer?.viaUserbotId && peer?.accessHash)
    if (alreadyLinked) {
      chatStore.connectionStatus = 'ready'
      void chatStore.connect(chatId.value, { silent: true })
    } else {
      chatStore.connect(chatId.value)
    }

    presenceTimer = setInterval(() => {
      chatStore.fetchPresence(chatId.value)
    }, 45000)
  }
})

onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener('resize', syncViewport)
  window.visualViewport?.removeEventListener('scroll', syncViewport)
  window.removeEventListener('resize', syncViewport)
  document.body.style.overflow = prevBodyOverflow
  document.documentElement.style.overflow = prevHtmlOverflow

  if (presenceTimer) clearInterval(presenceTimer)
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
