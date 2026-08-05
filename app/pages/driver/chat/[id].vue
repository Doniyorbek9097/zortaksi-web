<template>
  <!-- visualViewport: klaviatura ochilganda header ko'rinib turadi -->
  <BasePullToRefresh
    fill
    scroll-selector=".chat-msg-scroll"
    class="fixed left-0 right-0 z-40"
    :style="shellStyle"
  >
  <div
    class="flex flex-col overflow-hidden h-full bg-slate-50 dark:bg-slate-950"
  >
    <!-- Header — support ham oddiy chat ko'rinishida -->
    <ChatHeader
      :name="name"
      :status="statusText"
      :online="isOnline"
      :avatar="peerAvatar"
      :user-id="peerUserId"
      :can-call="!!callPhone"
      :call-href="callTelHref"
      @back="goBack"
    />

    <ChatQuickActions
      :show="showQuickActions"
      :telegram-href="telegramContactUrl"
      :group-href="groupViewUrl"
    />

    <!-- Xabarlar -->
    <div v-if="isOpening && openFailed" class="flex-1 min-h-0 flex flex-col overflow-y-auto">
      <div class="mx-auto w-full max-w-2xl px-3 py-4 space-y-4 flex-1">
        <div
          v-if="fallbackOrderText"
          class="rounded-2xl px-3.5 py-3 border bg-amber-50 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/50"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.16em] mb-1.5 text-amber-600 dark:text-amber-400">
            Buyurtma e'loni
          </p>
          <p
            v-if="orderGroupTitle"
            class="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-1.5"
          >
            {{ orderGroupTitle }}
          </p>
          <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
            <ChatLinkifiedText :text="fallbackOrderText" />
          </p>
        </div>

        <div class="flex flex-col items-center justify-center px-3 py-6 text-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 inline-flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="text-2xl" />
          </div>
          <div class="space-y-1">
            <p class="text-base font-black text-slate-900 dark:text-white">Chat ochilmadi</p>
            <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
              {{ openError }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-xs">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-black active:scale-95"
              @click="goBackFromOpen"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" />
              Orqaga
            </button>
            <a
              v-if="telegramContactUrl"
              :href="telegramContactUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-[12px] font-black active:scale-95"
            >
              <font-awesome-icon icon="fa-brands fa-telegram" />
              Telegram orqali
            </a>
            <a
              v-if="callTelHref"
              :href="callTelHref"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[12px] font-black active:scale-95"
            >
              <font-awesome-icon icon="fa-solid fa-phone" />
              Qo'ng'iroq
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-else ref="scrollEl" class="chat-msg-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
          <p
            v-if="orderGroupTitle && !isDirect"
            class="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-1.5"
          >
            {{ orderGroupTitle }}
          </p>
          <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
            <ChatLinkifiedText :text="displayOrderText" />
          </p>
        </div>

        <!-- Eski xabarlar yuklanmoqda -->
        <div
          v-if="chatStore.isLoadingOlderMessages"
          class="flex justify-center py-2"
        >
          <font-awesome-icon
            icon="fa-solid fa-spinner"
            class="animate-spin text-slate-400 text-sm"
          />
        </div>

        <!-- Loading — faqat cache/query yo'q bo'lsa skeleton -->
        <div v-if="showMessageSkeleton" class="space-y-2">
          <div v-for="n in 6" :key="n" class="h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" :class="n % 2 ? 'w-1/2' : 'w-2/3 ml-auto'" />
        </div>

        <!-- Empty — darhol ko'rinsin (order konteksti bo'lsa) -->
        <BaseEmptyState
          v-else-if="!chatStore.messages.length && showReadyEmpty"
          icon="fa-solid fa-comments"
          title="Xabar yozishga tayyor"
          class="!min-h-0 flex-1"
        />

        <ChatMessageBubble
          v-for="msg in chatStore.messages"
          :key="String(msg._id)"
          :id="`msg-${msg._id}`"
          :text="msg.text"
          :time="formatTime(msg.date)"
          :date="msg.date"
          :out="msg.direction === 'out'"
          :read="msg.status === 'read'"
          :status="msg.status"
          :type="chatMediaType(msg)"
          :message-id="String(msg._id)"
          :media-path="msg.mediaPath"
          :duration="msg.duration"
          :location-lat="msg.locationLat"
          :location-lng="msg.locationLng"
          :location-title="msg.locationTitle"
          :highlight="focusId === String(msg._id)"
          :selection-mode="selectionMode"
          :selected="selectedMessageIds.includes(String(msg._id))"
          @long-press="onMessageLongPress(String(msg._id), chatMediaType(msg))"
          @toggle-select="toggleMessageSelect(String(msg._id), chatMediaType(msg))"
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

    <!-- Tanlangan xabarlarni o'chirish -->
    <ChatMessageSelectionBar
      v-if="selectionMode"
      :selected-count="selectedMessageIds.length"
      :deleting="isDeletingMessages"
      @cancel="exitSelectionMode"
      @delete="confirmDeleteSelected"
    />

    <!-- Composer — ochilish/loading paytida ham ko'rinsin -->
    <ChatComposer
      v-if="showComposer && !selectionMode"
      v-model="draft"
      :disabled="composerDisabled"
      :placeholder="composerPlaceholder"
      @send="onSend"
      @voice="onVoice"
      @photo="onPhoto"
    />
  </div>
  </BasePullToRefresh>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useChatStore } from '~/stores/chat.store'
import { normalizeTelHref, normalizeTo998, resolveChatPhone, extractPhoneFromText } from '~/utils/phone'
import { pickQuickLinkQuery, resolveOrderTextHint, resolveQuickLinks, buildChatStubFromOrderQuery, hasOrderQueryContext } from '~/utils/orderChatQuery'
import { getApiErrorMessage } from '~/utils/apiError'
import { isAdminUser } from '~/utils/userRole'
import { isChatLikelyReady } from '~/stores/chat/actions/connection'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

const chatId = computed(() => route.params.id as string)
/** Order/interest dan darhol ochilish — API chat sahifasida ishlaydi */
const isOpening = computed(() => chatId.value === 'open')

const isSupport = computed(() =>
  chatStore.currentChat?.kind === 'support' || route.query.support === '1'
)

/** Ro'yxatdan o'tgan haydovchi ↔ haydovchi (qiziqqanlar va h.k.) */
const isDirect = computed(() => chatStore.currentChat?.kind === 'direct')

/** Ro'yxatdan o'tgan peer — faqat ilova ichida (Telegram ulanishi shart emas) */
const isInAppOnly = computed(() => !!chatStore.currentChat?.inAppOnly)

/** Telegram ulanishi shart emas — ilova ichidagi chat */
const isInAppChat = computed(() => isSupport.value || isDirect.value || isInAppOnly.value)
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
  if ((isOpening.value || chatStore.isLoadingMessages) && !hasInstantContext.value) {
    return 'ochilmoqda...'
  }
  if (chatStore.isPeerTyping) return 'yozmoqda...'
  if (chatStore.peerPresence?.label) return chatStore.peerPresence.label
  if (isDirect.value) return 'Haydovchi'
  if (hasInstantContext.value && chatStore.isLoadingMessages) return 'yangilanmoqda...'
  return '...'
})

const orderText = computed(() => {
  const fromChat = String(chatStore.currentChat?.orderText || '').trim()
  if (fromChat) return fromChat
  return resolveOrderTextHint(
    route.query as Record<string, unknown>,
    chatStore.currentChat,
  )
})

/** Buyurtma banneri yoki cache — skeletonsiz darhol UI */
const hasInstantContext = computed(
  () => !!orderText.value || !!route.query.orderId,
)

const showMessageSkeleton = computed(
  () =>
    chatStore.isLoadingMessages &&
    !chatStore.messages.length &&
    !hasInstantContext.value,
)

const showReadyEmpty = computed(
  () => !chatStore.isLoadingMessages || hasInstantContext.value,
)

/** Direct chatda buyurtma matni o'rniga fixed kontekst xabari */
const showOrderBanner = computed(() => isDirect.value || !!orderText.value)

const orderBannerLabel = computed(() =>
  isDirect.value ? 'Haydovchi' : "Buyurtma e'loni"
)

const orderGroupTitle = computed(() => {
  const fromQuery = String(route.query.groupTitle || '').trim()
  if (fromQuery) return fromQuery
  return String(chatStore.currentChat?.peer?.fromGroupTitle || '').trim()
})

const displayOrderText = computed(() => {
  if (isDirect.value) return "Bu Haydovchi bilan suhbat qurishingiz mumkin"
  return orderText.value.replace(/^\[Buyurtma\]\s*/i, '').trim() || orderText.value
})

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)
const focusId = ref(String(route.query.focus || ''))
const selectionMode = ref(false)
const selectedMessageIds = ref<string[]>([])
const isDeletingMessages = ref(false)
const openFailed = ref(false)
const openError = ref('')

/** Chat ochilmasa ham query/stash dan buyurtma matni */
const fallbackOrderText = computed(() => {
  if (!isOpening.value || !openFailed.value) return ''
  return resolveOrderTextHint(route.query as Record<string, unknown>, null)
})

const isSelectableMedia = (type: string) => type === 'voice' || type === 'photo'

const enterSelectionMode = (messageId: string) => {
  selectionMode.value = true
  if (!selectedMessageIds.value.includes(messageId)) {
    selectedMessageIds.value = [...selectedMessageIds.value, messageId]
  }
}

const exitSelectionMode = () => {
  selectionMode.value = false
  selectedMessageIds.value = []
}

const onMessageLongPress = (messageId: string, type: string) => {
  if (!isSelectableMedia(type)) return
  enterSelectionMode(messageId)
}

const toggleMessageSelect = (messageId: string, type: string) => {
  if (!isSelectableMedia(type)) return
  if (!selectionMode.value) return
  const set = new Set(selectedMessageIds.value)
  if (set.has(messageId)) set.delete(messageId)
  else set.add(messageId)
  selectedMessageIds.value = [...set]
  if (!selectedMessageIds.value.length) selectionMode.value = false
}

const confirmDeleteSelected = async () => {
  const ids = selectedMessageIds.value.filter((id) => !id.startsWith('temp-'))
  if (!ids.length || isDeletingMessages.value) return
  if (!import.meta.client) return
  const ok = window.confirm(`${ids.length} ta xabarni o'chirishni tasdiqlaysizmi?`)
  if (!ok) return

  isDeletingMessages.value = true
  try {
    await chatStore.deleteMessages(chatId.value, ids)
    exitSelectionMode()
  } catch (err) {
    console.error('deleteMessages error:', err)
    window.alert('Xabarlarni o\'chirib bo\'lmadi')
  } finally {
    isDeletingMessages.value = false
  }
}

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

/** Oldin muvaffaqiyatli bog'langan — viaUserbotId + accessHash ikkalasi kerak */
const wasLinkedBefore = computed(() =>
  isChatLikelyReady(chatStore.currentChat),
)

const canSendTelegram = computed(
  () => isInAppChat.value || wasLinkedBefore.value || conn.value === 'ready',
)

/** Loading / open — faqat bootstrap; xabarlar fon yuklanadi */
const composerBusy = computed(() => isOpening.value)

const showComposer = computed(
  () =>
    !openFailed.value &&
    (isOpening.value ||
    composerBusy.value ||
    isInAppChat.value ||
    wasLinkedBefore.value ||
    conn.value === 'ready' ||
    conn.value === 'connecting' ||
    conn.value === 'idle'),
)

const composerDisabled = computed(
  () => composerBusy.value || (!isInAppChat.value && !wasLinkedBefore.value && conn.value !== 'ready'),
)

const composerPlaceholder = computed(() => {
  if (composerBusy.value) return 'Biroz kuting...'
  if (!isInAppChat.value && !wasLinkedBefore.value && conn.value !== 'ready') {
    return 'Ulanish kutilmoqda...'
  }
  return 'Xabar yozing...'
})

/** Voice/photo/document — MessageBubble to'g'ri tip bilan ochilsin */
const chatMediaType = (msg: { type?: string; mediaPath?: string; duration?: number; locationLat?: number; locationLng?: number }) => {
  const t = String(msg.type || '')
  if (t === 'voice' || t === 'photo' || t === 'location') return t
  if (msg.locationLat != null && msg.locationLng != null) return 'location'
  if (msg.duration) return 'voice'
  if (t === 'document' || (msg.mediaPath && t !== 'text')) return 'photo'
  return t || 'text'
}

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

const goBackFromOpen = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
    return
  }
  void navigateTo('/driver/orders')
}

const goBack = () => {
  if (isOpening.value || openFailed.value) goBackFromOpen()
  else goChats()
}

const callPhone = computed(() => {
  const qPhone = String(route.query.phone || '').trim()
  if (qPhone.replace(/\D/g, '').length >= 7) {
    return normalizeTo998(qPhone) || qPhone.replace(/\D/g, '')
  }

  return (
    resolveChatPhone({
      messages: chatStore.messages,
      peerPhone: chatStore.currentChat?.peer?.phone,
      fallbackPhone: route.query.phone as string | undefined,
    }) ||
    extractPhoneFromText(orderText.value) ||
    ''
  )
})

const callTelHref = computed(() =>
  callPhone.value ? normalizeTelHref(callPhone.value) : '',
)

const quickLinks = computed(() =>
  resolveQuickLinks(route.query as Record<string, unknown>, chatStore.currentChat),
)

const telegramContactUrl = computed(() => quickLinks.value.telegramHref)

const groupViewUrl = computed(() => quickLinks.value.groupHref)

/** Buyurtmachi bilan chat — tezkor tugmalar (support/direct emas) */
const showQuickActions = computed(
  () => !isSupport.value && !isDirect.value,
)

// Yangi xabar pastga qo'shilganda scroll (prepend da emas)
watch(
  () => chatStore.messages.at(-1)?._id,
  (newId, oldId) => {
    if (newId && newId !== oldId) scrollToBottom()
  },
)
watch(() => chatStore.isPeerTyping, (v) => { if (v) scrollToBottom() })

let presenceTimer: ReturnType<typeof setInterval> | null = null
let loadSeq = 0
let scrollLoadLock = false
let prevBodyOverflow = ''
let prevHtmlOverflow = ''

const clearPresenceTimer = () => {
  if (presenceTimer) {
    clearInterval(presenceTimer)
    presenceTimer = null
  }
}

const resetChatUi = (nextChatId?: string) => {
  chatStore.persistCurrentMessagesCache()
  clearPresenceTimer()
  exitSelectionMode()
  chatStore.messages = []
  chatStore.resetMessagesPagination()
  chatStore.currentChat = null
  chatStore.resetConnection()
  chatStore.isLoadingMessages = true
  draft.value = ''
  focusId.value = String(route.query.focus || '')

  if (nextChatId && nextChatId !== 'open') {
    chatStore.hydrateMessagesFromCache(nextChatId)
  }
}

/** Mijozni olish / order Xabar — query dan darhol banner va tezkor tugmalar */
const primeInstantOrderUi = () => {
  const q = route.query as Record<string, unknown>
  if (!hasOrderQueryContext(q)) return

  chatStore.isLoadingMessages = false
  const stub = buildChatStubFromOrderQuery(q)
  if (!stub) return

  const listedId = String(q.chatId || route.params.id || '')
  const listed =
    listedId && listedId !== 'open'
      ? chatStore.chats.find((c) => c._id === listedId)
      : undefined

  chatStore.currentChat = {
    ...(listed || {}),
    ...stub,
    peer: { ...(listed?.peer || {}), ...(stub.peer || {}) },
  } as import('~/types').IChat
  chatStore.primeFromChat(chatStore.currentChat)
}

/** Tepaga scroll — keyingi 10 ta eski xabar */
const onMessagesScroll = async () => {
  const el = scrollEl.value
  const id = chatId.value
  if (!el || !id || id === 'open') return
  if (scrollLoadLock || chatStore.isLoadingOlderMessages || chatStore.isLoadingMessages) return
  if (!chatStore.hasMoreMessages) return
  if (el.scrollTop > 72) return

  scrollLoadLock = true
  const prevHeight = el.scrollHeight
  try {
    await chatStore.loadOlderMessages(id)
    await nextTick()
    el.scrollTop = el.scrollHeight - prevHeight
  } catch (err) {
    console.error('loadOlderMessages error:', err)
  } finally {
    scrollLoadLock = false
  }
}

const startPresenceLoop = (id: string) => {
  clearPresenceTimer()
  presenceTimer = setInterval(() => {
    void chatStore.fetchPresence(id)
  }, 45000)
}

/** Guruh «Mijozni olish» — tarif yo'q bo'lsa avval to'lov sahifasi */
const ensureTariffForOrderTake = async (): Promise<boolean> => {
  if (!authStore.user) {
    try {
      await authStore.getMe()
    } catch {
      /* middleware auth */
    }
  }

  if (isAdminUser(authStore.user)) return true
  if (authStore.tariffActive) return true

  chatStore.isLoadingMessages = false
  await navigateTo(
    {
      path: '/driver/payment',
      query: { tab: 'tariff', next: route.fullPath },
    },
    { replace: true },
  )
  return false
}

/** Order tugmasidan kelgan ochilish — API shu yerda, keyin real chatId ga replace */
const bootstrapOpenChat = async (seq: number) => {
  primeInstantOrderUi()

  const mode = String(route.query.open || '')
  const orderId = String(route.query.orderId || '')
  const userId = String(route.query.userId || '')
  const existingChatId = String(route.query.chatId || '').trim()

  if ((mode === 'order' && orderId) || (mode === 'user' && userId)) {
    const ok = await ensureTariffForOrderTake()
    if (!ok || seq !== loadSeq) return
  }

  const fail = async (message?: string) => {
    if (seq !== loadSeq) return
    chatStore.isLoadingMessages = false
    openFailed.value = true
    const raw = message || 'Chat ochib bo\'lmadi'
    if (/order topilmadi/i.test(raw)) {
      openError.value = 'Buyurtma muddati tugagan yoki o\'chirilgan. Telegram orqali bog\'laning.'
    } else {
      openError.value = raw
    }
  }

  try {
    if (existingChatId && mode === 'order' && orderId) {
      const listed = chatStore.chats.find((c) => c._id === existingChatId)
      if (listed) {
        chatStore.primeFromChat(listed)
        chatStore.currentChat = {
          ...listed,
          ...chatStore.currentChat,
          peer: { ...listed.peer, ...chatStore.currentChat?.peer },
        } as import('~/types').IChat
      }
      chatStore.isLoadingMessages = false
      openFailed.value = false
      openError.value = ''
      void chatStore.connect(existingChatId, { silent: true })
      await navigateTo({
        path: `/driver/chat/${existingChatId}`,
        query: pickQuickLinkQuery(route.query as Record<string, unknown>),
        replace: true,
      })
      return
    }

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
      const chat = res.data as import('~/types').IChat
      const newId = String(chat._id || '')
      if (!newId) {
        await fail('Chat identifikatori topilmadi')
        return
      }
      chatStore.primeFromChat(chat)
      chatStore.currentChat = chat
      chatStore.isLoadingMessages = false
      openFailed.value = false
      openError.value = ''
      const idx = chatStore.chats.findIndex((c) => c._id === newId)
      if (idx >= 0) {
        chatStore.chats[idx] = { ...chatStore.chats[idx], ...chat }
      } else {
        chatStore.chats.unshift(chat)
      }
      await navigateTo({
        path: `/driver/chat/${newId}`,
        query: pickQuickLinkQuery(route.query as Record<string, unknown>),
        replace: true,
      })
      return
    }
    await fail(res?.message || 'Chat ochib bo\'lmadi')
  } catch (err) {
    console.error('bootstrapOpenChat error:', err)
    await fail(getApiErrorMessage(err, 'Chat ochib bo\'lmadi'))
  }
}

const loadChat = async (id: string) => {
  const seq = ++loadSeq
  resetChatUi(id)
  primeInstantOrderUi()

  if (id === 'open') {
    openFailed.value = false
    openError.value = ''
    await bootstrapOpenChat(seq)
    return
  }

  const listed = chatStore.chats.find((c) => c._id === id)
  if (listed) chatStore.currentChat = listed

  chatStore.primeFromChat(listed || chatStore.currentChat)

  const kind = listed?.kind || chatStore.currentChat?.kind
  const inApp =
    kind === 'support' ||
    kind === 'direct' ||
    !!listed?.inAppOnly ||
    !!chatStore.currentChat?.inAppOnly
  const wasLinked = chatStore.connectionStatus === 'ready'

  try {
    if (!inApp) {
      const orderChat = !!(listed?.orderId || chatStore.currentChat?.orderId)
      void chatStore.connect(id, { silent: wasLinked || !!orderChat })
    }
    await chatStore.fetchMessages(id)
    chatStore.primeFromChat(chatStore.currentChat)
  } catch (err) {
    console.error('loadChat error:', err)
  }
  if (seq !== loadSeq) return

  if (inApp) {
    chatStore.connectionStatus = 'ready'
    void chatStore.fetchPresence(id)
  }
  startPresenceLoop(id)
  scrollToFocus()
}

// Chat → chat: component qayta mount bo'lmasa ham yangilanadi
watch(chatId, (id) => {
  if (!id) return
  void loadChat(id)
}, { immediate: true })

usePullToRefresh(async () => {
  const id = chatId.value
  if (!id || id === 'open') return
  await chatStore.fetchMessages(id)
  scrollToFocus()
})

watch(scrollEl, (el, _, onCleanup) => {
  if (!el) return
  el.addEventListener('scroll', onMessagesScroll, { passive: true })
  onCleanup(() => el.removeEventListener('scroll', onMessagesScroll))
})

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
  chatStore.resetMessagesPagination()
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
