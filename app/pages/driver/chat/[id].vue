<template>
  <div
    class="fixed inset-0 z-40 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    style="height: 100dvh; width: 100%;"
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
    >
      <template #actions>
        <div
          v-if="showClearHistoryBtn && !selectionMode"
          class="mx-auto w-full max-w-2xl px-3 py-2 border-b border-slate-200/50 dark:border-slate-800/50"
        >
          <button
            type="button"
            :disabled="isClearingHistory"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-200/60 dark:border-red-900/40 active:scale-[0.98] transition-all disabled:opacity-50"
            @click="openClearHistoryDialog"
          >
            <font-awesome-icon
              :icon="isClearingHistory ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'"
              :class="{ 'animate-spin': isClearingHistory }"
            />
            Chat tarixini tozalash
          </button>
        </div>
      </template>
    </ChatHeader>

    <!-- Xabarlar -->
    <div v-if="isOpening && openFailed" class="flex-1 min-h-0 flex flex-col overflow-y-auto">
      <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 space-y-4 flex-1">
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
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mx-auto w-full max-w-xs">
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
      <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 space-y-2 min-h-full flex flex-col">
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

        <!-- Loading — chat almashtirish yoki birinchi yuklash -->
        <div v-if="showMessageSkeleton" class="space-y-2 flex-1">
          <div
            v-for="n in CHAT_SKELETON_ROWS"
            :key="n"
            class="h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            :class="n % 2 ? 'w-[58%]' : 'w-[72%] ml-auto'"
          />
        </div>

        <!-- Empty — darhol ko'rinsin (order konteksti bo'lsa) -->
        <BaseEmptyState
          v-else-if="!chatStore.messages.length && showReadyEmpty"
          icon="fa-solid fa-comments"
          title="Xabar yozishga tayyor"
          class="!min-h-0 flex-1"
        />

        <template v-else-if="messagesMatchChat">
        <ChatMessageBubble
          v-for="msg in visibleMessages"
          :key="String(msg._id)"
          v-memo="[
            msg._id,
            msg.text,
            msg.status,
            msg.date,
            msg.mediaPath,
            msg.direction,
            selectionMode,
            isMessageSelected(String(msg._id)),
            focusId === String(msg._id),
          ]"
          :id="`msg-${msg._id}`"
          :text="msg.text"
          :text-format="msg.textFormat"
          :time="formatTime(msg.date)"
          :date="msg.date"
          :out="msg.direction === 'out'"
          :read="msg.status === 'read'"
          :status="msg.status"
          :error="msg.error"
          :type="chatMediaType(msg)"
          :message-id="String(msg._id)"
          :media-path="msg.mediaPath"
          :mime-type="msg.mimeType"
          :duration="msg.duration"
          :location-lat="msg.locationLat"
          :location-lng="msg.locationLng"
          :location-title="msg.locationTitle"
          :highlight="focusId === String(msg._id)"
          :selection-mode="selectionMode"
          :selected="isMessageSelected(String(msg._id))"
          :reply-to="msg.replyTo"
          @long-press="onMessageLongPress(String(msg._id))"
          @toggle-select="toggleMessageSelect(String(msg._id))"
          @reply="onMessageReply(msg)"
          @delete="onMessageDeleteRequest(String(msg._id))"
        />
        </template>

        <!-- Admin yozmoqda... -->
        <div
          v-if="chatStore.isPeerTyping && messagesMatchChat && !showMessageSkeleton"
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

    <!-- Ulanish banneri — order chatda input placeholder yetarli -->
    <div v-if="needsTelegramConnect && conn === 'connecting' && !isOrderSenderChat" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
        {{ 'Foydalanuvchiga ulanmoqda... Iltimos kuting' }}
      </div>
    </div>

    <!-- O'z hisob ishlamadi — proxy orqali ulanish uchun RUXSAT so'raladi -->
    <div v-else-if="conn === 'proxy-required'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-user-shield" class="mr-1.5" />
          {{ connReason || "O'z hisobingiz orqali yozib bo'lmadi. Proksi orqali yozishga ruxsat berasizmi?" }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            :disabled="proxyConnecting"
            class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-sky-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all disabled:opacity-60"
            @click="confirmProxyConnect"
          >
            <font-awesome-icon icon="fa-solid fa-route" />
            {{ proxyConnecting ? 'Ulanmoqda...' : "Proksi orqali bog'lanib ko'rish" }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all"
            @click="dismissProxyConfirm"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'restricted'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="mr-1.5" />
          {{ connReason || 'Hozircha bu foydalanuvchiga yozib bo\'lmaydi (spam yoki bloklangan).' }}
        </p>
        <div class="flex flex-col items-center gap-2">
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
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'unreachable'" class="mx-auto w-full max-w-2xl px-3 pb-2">
      <div class="py-3 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold text-center space-y-2">
        <p>
          <font-awesome-icon icon="fa-solid fa-ban" class="mr-1.5" />
          {{ connReason || (callPhone
            ? 'Xabar yozib bo\'lmaydi. Telefon qilishingiz mumkin.'
            : 'Bu foydalanuvchi bilan bog\'lanish imkoni yo\'q.') }}
        </p>
        <div class="flex flex-col items-center gap-2">
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
    </div>

    <!-- Tanlangan xabarlarni o'chirish -->
    <ChatMessageSelectionBar
      v-if="selectionMode"
      :selected-count="selectedCount"
      :deleting="isDeletingMessages"
      @cancel="exitSelectionMode"
      @delete="confirmDeleteSelected"
    />

    <!-- Composer — ochilish/loading paytida ham ko'rinsin -->
    <ChatReplyBar
      v-if="replyTarget"
      :reply="replyTarget"
      @cancel="replyTarget = null"
    />

    <ChatComposer
      v-if="showComposer && !selectionMode"
      v-model="draft"
      :disabled="composerDisabled"
      :placeholder="composerPlaceholder"
      :slash-commands="adminSlashCommands"
      @send="onSend"
      @voice="onVoice"
      @photo="onPhoto"
    />

    <BaseConfirmDialog
      v-model="showDeleteDialog"
      title="Xabarni o'chirish"
      description="Ilova va Telegram"
      :message="deleteDialogMessage"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="isDeletingMessages"
      :close-on-confirm="false"
      @confirm="executeDeleteMessages"
    />

    <BaseConfirmDialog
      v-model="showClearHistoryDialog"
      title="Chat tarixini tozalash"
      description="Ilova va Telegram"
      message="Barcha xabarlar ikkala tomondan ham o'chiriladi. Davom etasizmi?"
      confirm-text="Ha, tozalash"
      cancel-text="Bekor"
      variant="danger"
      :loading="isClearingHistory"
      :close-on-confirm="false"
      @confirm="executeClearHistory"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useChatStore } from '~/stores/chat.store'
import { normalizeTelHref, normalizeTo998, resolveChatPhone, extractPhoneFromText, revealOrderTextPhones } from '~/utils/phone'
import { resolveOrderTextHint, resolveQuickLinks, buildChatStubFromOrderQuery, buildChatStubFromOrder, buildMinimalOrderChatStub, hasOrderQueryContext, hasOrderSenderQueryContext, resolveChatFromOpenQuery, isFromGroupTakeClient, mergeOrderChatContext, pickQuickLinkQuery } from '~/utils/orderChatQuery'
import { useOrderTakeAccess } from '~/composables/useOrderTakeAccess'
import { getApiErrorMessage } from '~/utils/apiError'
import { hasTelegramPeerLink } from '~/stores/chat/actions/connection'
import { compactQuery } from '~/utils/navigationQuery'
import { isAdminUser } from '~/utils/userRole'
import { useAdminSlashCommands } from '~/composables/useAdminSlashCommands'
import { replyTargetFromMessage } from '~/utils/messageReplyPreview'
import { isLegacyPaymentChatMessage } from '~/utils/legacyPaymentChatMessage'
import { CHAT_SKELETON_ROWS } from '~/utils/memoryBudget'
import type { ChatReplyTarget } from '~/components/chat/ReplyBar.vue'

definePageMeta({
  layout: false,
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const isAdmin = computed(() => isAdminUser(authStore.user))
const { commands: adminSlashCommandList, load: loadAdminSlashCommands } = useAdminSlashCommands()
const adminSlashCommands = computed(() =>
  isAdmin.value ? adminSlashCommandList.value : [],
)
const { ensureAccess: ensureOrderTakeAccessFromApi, redirectIfBlocked: redirectOrderTakeBlocked } =
  useOrderTakeAccess()

const chatId = computed(() => route.params.id as string)
/** Route hali `open` bo'lsa ham API dan kelgan haqiqiy chat id */
const effectiveChatId = computed(() => {
  const routeId = String(chatId.value || '').trim()
  if (routeId && routeId !== 'open') return routeId
  const fromChat = String(chatStore.currentChat?._id || '').trim()
  return fromChat || routeId
})
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

/** Peer ismi — faqat joriy chatId uchun */
const activeChatMeta = computed(() => {
  const id = chatId.value
  if (!id || id === 'open') return chatStore.currentChat
  if (String(chatStore.currentChat?._id || '') === id) return chatStore.currentChat
  return chatStore.chats.find((c) => String(c._id) === id) || chatStore.currentChat
})

const name = computed(() => {
  const p = activeChatMeta.value?.peer
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

const peerAvatar = computed(() => activeChatMeta.value?.peer?.avatar)
const peerUserId = computed(() => activeChatMeta.value?.peer?.userId)

const orderText = computed(() => {
  const fromChat = String(activeChatMeta.value?.orderText || '').trim()
  if (fromChat) return fromChat
  return resolveOrderTextHint(
    route.query as Record<string, unknown>,
    activeChatMeta.value,
  )
})

/** Buyurtma banneri yoki cache — skeletonsiz darhol UI */
const hasInstantContext = computed(
  () => !!orderText.value || !!route.query.orderId,
)

/** Order sender chat — skeleton ko'rsatilmaydi, inputda ulanmoqda */
const isOrderSenderChat = computed(
  () =>
    !!activeChatMeta.value?.orderId ||
    hasInstantContext.value ||
    !!route.query.orderId,
)

/** Joriy chat xabarlari yuklangan/yuklanmoqda */
const messagesMatchChat = computed(() => {
  const id = effectiveChatId.value
  if (!id || id === 'open') return false
  return chatStore.messagesChatId === id
})

const showMessageSkeleton = computed(() => {
  if (isOpening.value || chatId.value === 'open') return false
  if (isOrderSenderChat.value) return false
  if (!messagesMatchChat.value) return true
  return (
    chatStore.isLoadingMessages &&
    !chatStore.messages.length &&
    !hasInstantContext.value
  )
})

const isOnline = computed(() => !!chatStore.peerPresence?.online)
const statusText = computed(() => {
  if (isOrderSenderChat.value && conn.value === 'connecting') return 'ulanmoqda...'
  if (showMessageSkeleton.value) return 'yuklanmoqda...'
  if ((isOpening.value || chatStore.isLoadingMessages) && !hasInstantContext.value) {
    return 'ochilmoqda...'
  }
  if (chatStore.isPeerTyping) return 'yozmoqda...'
  if (chatStore.peerPresence?.label) return chatStore.peerPresence.label
  if (isDirect.value) return 'Haydovchi'
  if (hasInstantContext.value && chatStore.isLoadingMessages) return 'yangilanmoqda...'
  return '...'
})

const showReadyEmpty = computed(
  () =>
    (messagesMatchChat.value || isOrderSenderChat.value) &&
    (!chatStore.isLoadingMessages ||
      hasInstantContext.value ||
      isOrderSenderChat.value),
)

/** Direct chatda buyurtma matni o'rniga fixed kontekst xabari */
const showOrderBanner = computed(() => {
  if (showMessageSkeleton.value && !hasInstantContext.value) return false
  return isDirect.value || !!orderText.value
})

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
  const raw = orderText.value.replace(/^\[Buyurtma\]\s*/i, '').trim() || orderText.value
  const phoneHint =
    String(route.query.phone || '').trim() ||
    String(chatStore.currentChat?.peer?.phone || '').trim()
  return revealOrderTextPhones(raw, phoneHint)
})

const draft = ref('')
const replyTarget = ref<ChatReplyTarget | null>(null)
const visibleMessages = computed(() =>
  chatStore.messages.filter((m) => !isLegacyPaymentChatMessage(m)),
)
const scrollEl = ref<HTMLElement | null>(null)
const focusId = ref(String(route.query.focus || ''))
const selectionMode = ref(false)
/** Tanlangan xabarlar — Set tez qidiruv uchun (includes O(n) emas) */
const selectedIdSet = shallowRef(new Set<string>())
const selectedCount = computed(() => selectedIdSet.value.size)
const isMessageSelected = (id: string) => selectedIdSet.value.has(id)
const isDeletingMessages = ref(false)
const isClearingHistory = ref(false)
const showDeleteDialog = ref(false)
const showClearHistoryDialog = ref(false)
const pendingDeleteIds = ref<string[]>([])
const openFailed = ref(false)
const openError = ref('')
const proxyConnecting = ref(false)

/** Chat ochilmasa ham query/stash dan buyurtma matni */
const fallbackOrderText = computed(() => {
  if (!isOpening.value || !openFailed.value) return ''
  const raw = resolveOrderTextHint(route.query as Record<string, unknown>, null)
  return revealOrderTextPhones(raw, String(route.query.phone || ''))
})

const enterSelectionMode = (messageId: string) => {
  selectionMode.value = true
  const next = new Set(selectedIdSet.value)
  next.add(messageId)
  selectedIdSet.value = next
}

const exitSelectionMode = () => {
  selectionMode.value = false
  selectedIdSet.value = new Set()
}

const onMessageLongPress = (messageId: string) => {
  enterSelectionMode(messageId)
}

const toggleMessageSelect = (messageId: string) => {
  if (!selectionMode.value) return
  const next = new Set(selectedIdSet.value)
  if (next.has(messageId)) next.delete(messageId)
  else next.add(messageId)
  selectedIdSet.value = next
  if (!next.size) selectionMode.value = false
}

const onMessageReply = (msg: { _id: string; text?: string; type?: string; locationTitle?: string; duration?: number; direction?: string }) => {
  if (selectionMode.value) return
  replyTarget.value = replyTargetFromMessage(msg as any)
}

const showClearHistoryBtn = computed(
  () => messagesMatchChat.value && chatStore.messages.length > 0,
)

const deleteDialogMessage = computed(() => {
  const n = pendingDeleteIds.value.length
  if (n <= 1) return "Ushbu xabar ilovadan va Telegramdan o'chiriladi."
  return `${n} ta xabar ilovadan va Telegramdan o'chiriladi.`
})

const openDeleteDialog = (ids: string[]) => {
  const valid = [...new Set(ids.map(String).filter((id) => id && !id.startsWith('temp-')))]
  if (!valid.length) return
  pendingDeleteIds.value = valid
  showDeleteDialog.value = true
}

const onMessageDeleteRequest = (messageId: string) => {
  if (selectionMode.value) return
  openDeleteDialog([messageId])
}

const openClearHistoryDialog = () => {
  if (!chatStore.messages.length) return
  showClearHistoryDialog.value = true
}

const confirmDeleteSelected = () => {
  openDeleteDialog([...selectedIdSet.value])
}

const executeDeleteMessages = async () => {
  const ids = pendingDeleteIds.value.filter((id) => !id.startsWith('temp-'))
  if (!ids.length || isDeletingMessages.value) return

  isDeletingMessages.value = true
  try {
    await chatStore.deleteMessages(effectiveChatId.value, ids)
    exitSelectionMode()
    showDeleteDialog.value = false
    pendingDeleteIds.value = []
  } catch (err) {
    console.error('deleteMessages error:', err)
  } finally {
    isDeletingMessages.value = false
  }
}

const executeClearHistory = async () => {
  if (isClearingHistory.value || !chatStore.messages.length) return

  isClearingHistory.value = true
  try {
    await chatStore.clearChatHistory(effectiveChatId.value)
    exitSelectionMode()
    showClearHistoryDialog.value = false
  } catch (err) {
    console.error('clearChatHistory error:', err)
  } finally {
    isClearingHistory.value = false
  }
}

// Ulanish holati (senderga yozish mumkinmi)
const conn = computed(() => chatStore.connectionStatus)
const connReason = computed(() => chatStore.connectionReason)

/** Optimistik composer — faqat haqiqiy peer link */
const composerLikelyReady = computed(() =>
  hasPeerLink.value,
)

/** Haqiqiy Telegram yuborish tayyorligi */
const hasPeerLink = computed(() =>
  hasTelegramPeerLink(chatStore.currentChat),
)

const canSendTelegram = computed(
  () => isInAppChat.value || hasPeerLink.value || conn.value === 'ready',
)

/** Loading / open — faqat bootstrap va kontekst yo'q bo'lsa */
const composerBusy = computed(
  () => isOpening.value && !composerLikelyReady.value && !hasInstantContext.value,
)

const showComposer = computed(
  () =>
    !openFailed.value &&
    (isOpening.value ||
    composerBusy.value ||
    isInAppChat.value ||
    composerLikelyReady.value ||
    conn.value === 'ready' ||
    conn.value === 'connecting' ||
    conn.value === 'idle'),
)

const composerDisabled = computed(
  () =>
    composerBusy.value ||
    (!isInAppChat.value && conn.value !== 'ready' && !hasPeerLink.value),
)

const composerPlaceholder = computed(() => {
  if (
    isOrderSenderChat.value &&
    !isInAppChat.value &&
    conn.value !== 'ready' &&
    !hasPeerLink.value
  ) {
    return 'Ulanmoqda...'
  }
  if (composerBusy.value) return 'Ulanmoqda...'
  if (!isInAppChat.value && conn.value !== 'ready' && !hasPeerLink.value) {
    return 'Ulanmoqda...'
  }
  return 'Xabar yozing...'
})

/** Voice/photo/document — MessageBubble to'g'ri tip bilan ochilsin */
const chatMediaType = (msg: {
  type?: string
  mediaPath?: string
  mimeType?: string
  duration?: number
  locationLat?: number
  locationLng?: number
}) => {
  const t = String(msg.type || '')
  if (t === 'voice' || t === 'photo' || t === 'sticker' || t === 'location') return t
  if (msg.locationLat != null && msg.locationLng != null) return 'location'
  if (msg.duration) return 'voice'
  if (t === 'sticker') return 'sticker'
  if (t === 'document') {
    const mime = String(msg.mimeType || '')
    if (mime.startsWith('image/') || String(msg.mediaPath || '').startsWith('photo/')) {
      return 'photo'
    }
    return 'document'
  }
  if (msg.mediaPath && t !== 'text') {
    const mime = String(msg.mimeType || '')
    if (mime.startsWith('image/') || String(msg.mediaPath || '').startsWith('photo/')) {
      return 'photo'
    }
    return 'document'
  }
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
  const id = effectiveChatId.value
  if (!id || id === 'open' || !canSendTelegram.value) return
  if (needsTelegramConnect.value) {
    const ok = await chatStore.ensureTelegramReady(id)
    if (!ok) return
  }
  const replyId = replyTarget.value?.id
  await chatStore.sendMessage(id, text, replyId)
  replyTarget.value = null
  scrollToBottom()
}

const onVoice = async (blob: Blob, seconds: number) => {
  const id = effectiveChatId.value
  if (!id || id === 'open' || !canSendTelegram.value) return
  if (needsTelegramConnect.value) {
    const ok = await chatStore.ensureTelegramReady(id)
    if (!ok) return
  }
  await chatStore.sendVoice(id, blob, seconds)
  scrollToBottom()
}

const onPhoto = async (file: File) => {
  const id = effectiveChatId.value
  if (!id || id === 'open' || !canSendTelegram.value) return
  if (needsTelegramConnect.value) {
    const ok = await chatStore.ensureTelegramReady(id)
    if (!ok) return
  }
  await chatStore.sendPhoto(id, file)
  scrollToBottom()
}

/** O'z hisob spam/blok — proksi orqali ulanish */
const confirmProxyConnect = async () => {
  if (proxyConnecting.value) return
  const id = effectiveChatId.value
  if (!id || id === 'open') return
  proxyConnecting.value = true
  try {
    const res = await chatStore.connect(id, { viaProxy: true })
    const status = res?.data?.status
    if (status === 'ready') {
      chatStore.connectionStatus = 'ready'
      chatStore.connectionReason = ''
    }
  } finally {
    proxyConnecting.value = false
  }
}

/** Proksi orqali ulanish rad etildi */
const dismissProxyConfirm = () => {
  chatStore.connectionStatus = 'restricted'
  chatStore.connectionReason =
    "O'z hisobingiz orqali yozib bo'lmadi. Proksi orqali yozish rad etildi."
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

  const peerPhone = String(chatStore.currentChat?.peer?.phone || '').trim()
  if (peerPhone.replace(/\D/g, '').length >= 7) {
    return normalizeTo998(peerPhone) || peerPhone.replace(/\D/g, '')
  }

  const revealed = revealOrderTextPhones(
    orderText.value,
    peerPhone || qPhone,
  )

  return (
    resolveChatPhone({
      messages: chatStore.messages,
      peerPhone: chatStore.currentChat?.peer?.phone,
      fallbackPhone: route.query.phone as string | undefined,
    }) ||
    extractPhoneFromText(revealed) ||
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

const resetChatUi = (nextChatId?: string, opts?: { preserveConnection?: boolean; keepChat?: import('~/types').IChat | null }) => {
  chatStore.persistCurrentMessagesCache()
  chatStore.invalidateMessagesFetch()
  clearPresenceTimer()
  exitSelectionMode()
  chatStore.messages = []
  chatStore.messagesChatId = null
  chatStore.resetMessagesPagination()
  chatStore.currentChat = opts?.keepChat ?? null
  if (!opts?.preserveConnection) {
    chatStore.resetConnection()
  }
  chatStore.isLoadingMessages = true
  draft.value = ''
  focusId.value = String(route.query.focus || '')

  if (nextChatId && nextChatId !== 'open') {
    chatStore.hydrateMessagesFromCache(nextChatId)
  }
}

/** Query / stash dan darhol chat UI (sync) */
const applyInstantOrderUiFromQuery = () => {
  const q = route.query as Record<string, unknown>
  const orderId = String(q.orderId || '').trim()
  if (!orderId && !hasOrderQueryContext(q)) return

  chatStore.isLoadingMessages = false
  if (!isInAppChat.value && chatStore.connectionStatus === 'idle') {
    chatStore.connectionStatus = 'connecting'
  }

  const listedId = String(q.chatId || route.params.id || '')
  const listed =
    listedId && listedId !== 'open'
      ? chatStore.chats.find((c) => c._id === listedId)
      : undefined

  const applyStub = (stub: Partial<import('~/types').IChat>) => {
    chatStore.currentChat = mergeOrderChatContext(
      listed,
      chatStore.currentChat,
      stub,
    ) as import('~/types').IChat
    chatStore.primeFromChat(chatStore.currentChat)
  }

  if (orderId) {
    const queryStub = buildChatStubFromOrderQuery(q)

    if (hasOrderSenderQueryContext(q) && queryStub) {
      applyStub(queryStub)
      return
    }

    applyStub(buildMinimalOrderChatStub(orderId))
    if (!isFromGroupTakeClient(q) && queryStub) {
      applyStub(queryStub)
    }
    return
  }

  const stub = buildChatStubFromOrderQuery(q)
  if (stub) applyStub(stub)
}

/** Guruh «Mijozni olish» — fon API to'ldirish */
const enrichOrderUiFromApi = (orderId: string) => {
  void (async () => {
    try {
      const res = await useApi(`/orders/${orderId}`, { timeout: 10_000 })
      if (!res?.success || !res.data) return

      const fromOrder = buildChatStubFromOrder(res.data as import('~/types').IOrder)
      if (!fromOrder) return

      const q = route.query as Record<string, unknown>
      const listedId = String(q.chatId || route.params.id || '')
      const listed =
        listedId && listedId !== 'open'
          ? chatStore.chats.find((c) => c._id === listedId)
          : undefined

      chatStore.currentChat = mergeOrderChatContext(
        listed,
        chatStore.currentChat,
        fromOrder,
      ) as import('~/types').IChat
      chatStore.primeFromChat(chatStore.currentChat)
    } catch {
      /* minimal stub yetarli */
    }
  })()
}

/** Mijozni olish / order Xabar — query dan darhol UI; guruh uchun API */
const primeInstantOrderUi = () => {
  applyInstantOrderUiFromQuery()
  const orderId = String(route.query.orderId || '').trim()
  if (orderId && isFromGroupTakeClient(route.query as Record<string, unknown>)) {
    enrichOrderUiFromApi(orderId)
  }
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
  }, 90_000)
}

/** Silent connect — xabarlar loadChat da bir marta yuklanadi */
const preconnectChatOpen = (id: string, chat?: import('~/types').IChat | null) => {
  if (!id) return
  if (chat) chatStore.primeFromChat(chat)
  void chatStore.connect(id, { silent: true })
}

/** Chat topildi — ro'yxatga qo'shish va real chatId ga o'tish */
const finalizeOpenChat = async (chat: import('~/types').IChat) => {
  const newId = String(chat._id || '')
  if (!newId) return false

  const q = route.query as Record<string, unknown>
  const queryStub = buildChatStubFromOrderQuery(q)
  const merged = mergeOrderChatContext(
    chatStore.currentChat,
    queryStub,
    chat,
  ) as import('~/types').IChat

  chatStore.primeFromChat(merged)
  chatStore.currentChat = merged
  chatStore.isLoadingMessages = false
  openFailed.value = false
  openError.value = ''

  if (
    merged.orderId &&
    !merged.inAppOnly &&
    merged.kind !== 'support' &&
    merged.kind !== 'direct' &&
    !hasTelegramPeerLink(merged)
  ) {
    chatStore.connectionStatus = 'connecting'
  }

  const idx = chatStore.chats.findIndex((c) => c._id === newId)
  if (idx >= 0) {
    chatStore.chats[idx] = mergeOrderChatContext(chatStore.chats[idx], merged) as import('~/types').IChat
  } else {
    chatStore.chats.unshift(merged)
  }

  preconnectChatOpen(newId, merged)
  void chatStore.fetchMessages(newId)

  const nextQuery = pickQuickLinkQuery(q)
  if (isFromGroupTakeClient(q)) {
    nextQuery.fromGroup = '1'
  }

  await navigateTo({
    path: `/driver/chat/${newId}`,
    query: compactQuery(nextQuery),
    replace: true,
  })
  return true
}

/** Order tugmasidan kelgan ochilish — API shu yerda, keyin real chatId ga replace */
const bootstrapOpenChat = async (seq: number) => {
  const q = route.query as Record<string, unknown>
  const mode = String(q.open || '')
  const orderId = String(q.orderId || '')
  const userId = String(q.userId || '')

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

  const handleStartChatResponse = async (res: any) => {
    if (seq !== loadSeq) return true

    if (
      res?.code === 'TARIFF_INACTIVE' ||
      res?.code === 'NOT_VERIFIED' ||
      /tarif faol emas/i.test(String(res?.message || ''))
    ) {
      chatStore.isLoadingMessages = false
      if ((await redirectOrderTakeBlocked(route.fullPath)) || seq !== loadSeq) return true
    }

    if (res?.success && res.data?._id) {
      const chat = res.data as import('~/types').IChat
      if (!(await finalizeOpenChat(chat))) {
        await fail('Chat identifikatori topilmadi')
      }
      return true
    }

    await fail(res?.message || 'Chat ochib bo\'lmadi')
    return true
  }

  const startChatApi = () => {
    if (mode === 'order' && orderId) return chatStore.startChatFromOrder(orderId)
    if (mode === 'booked' && orderId) return chatStore.startChatWithBookedDriver(orderId)
    if (mode === 'agent' && orderId) return chatStore.startChatWithOrderOwner(orderId)
    if (mode === 'user' && userId) {
      return chatStore.startChatWithUser(userId, orderId || undefined)
    }
    return null
  }

  primeInstantOrderUi()

  const needsAccess = !!(mode === 'order' && orderId) || !!(mode === 'user' && userId)
  const chatApi = startChatApi()

  try {
    const localChat = resolveChatFromOpenQuery(q, chatStore.chats)
    if (localChat?._id) {
      const stub = buildChatStubFromOrderQuery(q)
      chatStore.currentChat = {
        ...localChat,
        ...(stub || {}),
        peer: { ...localChat.peer, ...(stub?.peer || {}) },
      } as import('~/types').IChat
      if (seq !== loadSeq) return
      await finalizeOpenChat(chatStore.currentChat)
      return
    }

    if (!chatApi) {
      await fail()
      return
    }

    if (needsAccess) {
      const [allowed, res] = await Promise.all([
        ensureOrderTakeAccessFromApi(route.fullPath),
        chatApi,
      ])
      if (!allowed || seq !== loadSeq) {
        chatStore.isLoadingMessages = false
        return
      }
      await handleStartChatResponse(res)
      return
    }

    const res = await chatApi
    await handleStartChatResponse(res)
  } catch (err) {
    console.error('bootstrapOpenChat error:', err)
    await fail(getApiErrorMessage(err, 'Chat ochib bo\'lmadi'))
  }
}

const loadChat = async (id: string) => {
  const seq = ++loadSeq
  const listedEarly = chatStore.chats.find((c) => c._id === id)
  const preserveConnection = !!(listedEarly && hasTelegramPeerLink(listedEarly))
  const queryStub = buildChatStubFromOrderQuery(route.query as Record<string, unknown>)
  const prevChat = chatStore.currentChat
  const keepChat =
    id !== 'open' && (prevChat?.orderId || queryStub?.orderId)
      ? (mergeOrderChatContext(listedEarly, queryStub, prevChat) as import('~/types').IChat)
      : null

  resetChatUi(id, { preserveConnection, keepChat })
  if (id !== 'open') {
    applyInstantOrderUiFromQuery()
    primeInstantOrderUi()
  }

  if (id === 'open') {
    openFailed.value = false
    openError.value = ''
    applyInstantOrderUiFromQuery()
    const early = resolveChatFromOpenQuery(route.query as Record<string, unknown>, chatStore.chats)
    if (early?._id) {
      chatStore.primeFromChat(early)
      preconnectChatOpen(String(early._id), early)
    }
    await bootstrapOpenChat(seq)
    return
  }

  const listed = listedEarly || chatStore.chats.find((c) => c._id === id)
  if (listed || queryStub?.orderId || prevChat?.orderId) {
    chatStore.currentChat = mergeOrderChatContext(
      listed,
      queryStub,
      chatStore.currentChat,
      prevChat,
    ) as import('~/types').IChat
  }

  chatStore.primeFromChat(chatStore.currentChat)

  const orderChat = !!(listed?.orderId || chatStore.currentChat?.orderId)
  if (orderChat) {
    chatStore.isLoadingMessages = false
  }

  const kind = listed?.kind || chatStore.currentChat?.kind
  const inApp =
    kind === 'support' ||
    kind === 'direct' ||
    !!listed?.inAppOnly ||
    !!chatStore.currentChat?.inAppOnly
  const wasLinked = chatStore.connectionStatus === 'ready'

  try {
    if (!inApp) {
      if (
        orderChat &&
        !hasTelegramPeerLink(listed || chatStore.currentChat) &&
        chatStore.connectionStatus === 'idle'
      ) {
        chatStore.connectionStatus = 'connecting'
      }
      void chatStore.connect(id, { silent: wasLinked || !!orderChat })
    }
    const hasCachedMessages =
      chatStore.messagesChatId === id && chatStore.messages.length > 0
    if (!hasCachedMessages) {
      if (orderChat) {
        void chatStore.fetchMessages(id)
      } else {
        await chatStore.fetchMessages(id)
      }
    } else {
      void chatStore.fetchMessages(id)
    }
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
  const id = effectiveChatId.value
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
  if (isAdmin.value) void loadAdminSlashCommands()

  prevBodyOverflow = document.body.style.overflow
  prevHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  window.scrollTo(0, 0)
})

onBeforeUnmount(() => {
  loadSeq += 1
  document.body.style.overflow = prevBodyOverflow
  document.documentElement.style.overflow = prevHtmlOverflow

  clearPresenceTimer()
  chatStore.currentChat = null
  chatStore.messages = []
  chatStore.resetMessagesPagination()
  chatStore.resetConnection()
  replyTarget.value = null
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
