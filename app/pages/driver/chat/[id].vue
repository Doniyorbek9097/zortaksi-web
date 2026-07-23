<template>
  <div class="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950">
    <!-- Header -->
    <ChatHeader
      :name="name"
      :status="statusText"
      :online="isOnline"
      :avatar="peerAvatar"
      :user-id="peerUserId"
      :can-call="!!callPhone"
      @back="goBack"
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
          :out="msg.direction === 'out'"
          :read="msg.status === 'read'"
          :status="msg.status"
          :type="msg.type"
          :message-id="msg._id"
          :duration="msg.duration"
          :highlight="focusId === msg._id"
        />
      </div>
    </div>

    <!-- Ulanish holati banneri -->
    <div v-if="conn === 'connecting'" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
        Yo'lovchiga ulanmoqda... Iltimos kuting
      </div>
    </div>

    <div v-else-if="conn === 'restricted'" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-start gap-2 py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="mt-0.5 shrink-0" />
        <span>{{ connReason || 'Hozircha bu yo\'lovchiga yozib bo\'lmaydi (spam yoki bloklangan).' }}</span>
      </div>
    </div>

    <div v-else-if="conn === 'unreachable'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-ban" class="mr-1.5" />
          Bu yo'lovchi bilan bog'lanish imkoni yo'q. Boshqa yo'lovchi toping.
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-red-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> Buyurtmalarga qaytish
        </button>
      </div>
    </div>

    <!-- Composer — faqat ulanish tayyor bo'lganda faol -->
    <ChatComposer
      v-if="conn !== 'unreachable'"
      v-model="draft"
      :disabled="conn !== 'ready'"
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

const name = computed(() => {
  const p = chatStore.currentChat?.peer
  if (p) {
    const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
    return full || p.username || p.userId || 'Buyurtmachi'
  }
  return (route.query.name as string) || 'Buyurtmachi'
})

const peerAvatar = computed(() => chatStore.currentChat?.peer?.avatar)
const peerUserId = computed(() => chatStore.currentChat?.peer?.userId)

const isOnline = computed(() => !!chatStore.peerPresence?.online)
const statusText = computed(() => {
  if (chatStore.peerPresence?.label) return chatStore.peerPresence.label
  return '...'
})

const orderText = computed(() =>
  String(chatStore.currentChat?.orderText || '').trim()
)

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const focusId = ref(String(route.query.focus || ''))

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
  if (chatStore.connectionStatus !== 'ready') return
  await chatStore.sendMessage(chatId.value, text)
  scrollToBottom()
}

const onVoice = async (blob: Blob, seconds: number) => {
  if (chatStore.connectionStatus !== 'ready') return
  await chatStore.sendVoice(chatId.value, blob, seconds)
  scrollToBottom()
}

const onPhoto = async (file: File) => {
  if (chatStore.connectionStatus !== 'ready') return
  await chatStore.sendPhoto(chatId.value, file)
  scrollToBottom()
}

const goBack = () => navigateTo('/driver/chats')

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

let presenceTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await chatStore.fetchMessages(chatId.value)
  scrollToFocus()

  const peer = chatStore.currentChat?.peer
  const alreadyLinked = !!(peer?.viaUserbotId && peer?.accessHash)
  if (alreadyLinked) {
    // Bir marta bog'langan — loadingsiz darhol yozish mumkin
    chatStore.connectionStatus = 'ready'
    void chatStore.connect(chatId.value, { silent: true })
  } else {
    chatStore.connect(chatId.value)
  }

  // Oxirgi kirish vaqtini davriy yangilab turamiz
  presenceTimer = setInterval(() => {
    chatStore.fetchPresence(chatId.value)
  }, 45000)
})

onBeforeUnmount(() => {
  if (presenceTimer) clearInterval(presenceTimer)
  chatStore.currentChat = null
  chatStore.messages = []
  chatStore.resetConnection()
})
</script>
