<template>
  <div
    class="fixed z-40 flex flex-col overflow-hidden"
    :class="isSupportPremium ? SUPPORT_CHAT_SHELL : 'bg-slate-50 dark:bg-slate-950'"
    :style="frameStyle"
  >
    <ChatHeader
      :name="name"
      :status="statusText"
      :online="isOnline"
      :avatar="peerAvatar"
      :user-id="peerUserId"
      :support="isSupportPremium"
      :profile-chat-id="effectiveChatId"
      :show-clear-history="showClearHistoryBtn && !selectionMode && !isSupport"
      :clearing="isClearingHistory"
      @back="goBack"
      @clear="openClearHistoryDialog"
    >
      <template v-if="callPhone && callTelHref && !isSupport" #actions>
        <ChatCallBar :href="callTelHref" class="!mb-0" />
      </template>
    </ChatHeader>

    <ChatSupportWelcomeCard v-if="isSupportPremium" />

    <!-- Xabarlar -->
    <div v-if="isOpening && openFailed" class="flex-1 min-h-0 flex flex-col overflow-y-auto">
      <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 space-y-4 flex-1">
        <div
          v-if="fallbackOrderText"
          class="rounded-2xl px-3.5 py-3 border bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/45"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.16em] mb-1.5 text-emerald-700 dark:text-emerald-400">
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
          </div>
        </div>
      </div>
    </div>

    <div v-else class="relative flex-1 min-h-0 flex flex-col">
      <div
        v-if="floatingDateLabel && messagesMatchChat && !showMessageSkeleton"
        class="pointer-events-none absolute top-2 left-0 right-0 z-20 flex justify-center"
      >
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold shadow-sm backdrop-blur-sm"
          :class="isSupportPremium ? supportDatePillClass : 'text-white'"
          :style="isSupportPremium ? undefined : { background: 'rgba(34, 158, 87, 0.92)' }"
        >
          {{ floatingDateLabel }}
        </span>
      </div>

      <div ref="scrollEl" class="chat-msg-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 space-y-2 min-h-full flex flex-col">
        <!-- Order e'lon / haydovchi konteksti -->
        <div
          v-if="showOrderBanner"
          class="rounded-2xl px-3.5 py-3 border"
          :class="isDirect
            ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200/70 dark:border-sky-800/50'
            : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/45 shadow-[inset_0_-1px_0_rgba(16,185,129,0.08)]'"
        >
          <p
            class="text-[10px] font-black uppercase tracking-[0.16em] mb-1.5"
            :class="isDirect
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-emerald-700 dark:text-emerald-400'"
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
            class="h-11 rounded-2xl animate-pulse"
            :class="[
              isSupportPremium ? supportSkeletonClass : 'bg-slate-100 dark:bg-slate-800',
              n % 2 ? 'w-[58%]' : 'w-[72%] ml-auto',
            ]"
          />
        </div>

        <!-- Empty — darhol ko'rinsin (order konteksti bo'lsa) -->
        <div
          v-else-if="!chatStore.messages.length && showReadyEmpty && isSupportPremium"
          class="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center"
        >
          <div :class="supportEmptyIconWrapClass">
            <font-awesome-icon icon="fa-solid fa-headset" class="text-xl" />
          </div>
          <p :class="supportEmptySubtitleClass">
            {{ SUPPORT_WELCOME_TEXT }}
          </p>
        </div>

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
          :support="isSupportPremium"
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
            class="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] font-bold border"
            :class="isSupportPremium ? supportTypingClass : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'"
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
    </div>

    <!-- Ulanish banneri — order chatda input placeholder yetarli -->
    <div v-if="needsTelegramConnect && conn === 'connecting' && !isOrderSenderChat" class="mx-auto w-full max-w-2xl px-3 pb-1">
      <div class="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
        {{ 'Foydalanuvchiga ulanmoqda... Iltimos kuting' }}
      </div>
    </div>

    <!-- O'z hisob ishlamadi — faqat ulanish tugagach -->
    <div v-else-if="CHAT_PROXY_CONNECT_ENABLED && isAdmin && needsTelegramConnect && conn === 'proxy-required'" class="mx-auto w-full max-w-2xl">
      <div class="px-3 pb-2">
        <div class="py-3 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[12px] font-bold text-center space-y-2">
          <p>
            <font-awesome-icon icon="fa-solid fa-user-shield" class="mr-1.5" />
            {{ connReason || "O'z hisobingiz orqali ulanib bo'lmadi. Tinglovchi userbot orqali bog'lanib ko'ring." }}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              :disabled="proxyConnecting"
              class="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-sky-500 text-white text-[11px] font-black uppercase tracking-wide active:scale-95 transition-all disabled:opacity-60"
              @click="confirmProxyConnect"
            >
              <font-awesome-icon icon="fa-solid fa-route" />
              {{ proxyConnecting ? 'Ulanmoqda...' : "Tinglovchi userbot orqali bog'lanish" }}
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
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'restricted'" class="mx-auto w-full max-w-2xl">
      <div class="px-3 pb-2">
        <div class="py-3 px-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[12px] font-bold text-center">
          <p>
            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="mr-1.5" />
            {{ connReason || 'Hozircha bu foydalanuvchiga yozib bo\'lmaydi (spam yoki bloklangan).' }}
          </p>
        </div>
      </div>
      <div v-if="!callPhone" class="px-3 pb-2">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-amber-500 text-white text-[12px] font-black uppercase tracking-wide active:scale-95 transition-all"
          @click="goOrders"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> Buyurtmalarga o'tish
        </button>
      </div>
    </div>

    <div v-else-if="needsTelegramConnect && conn === 'unreachable'" class="mx-auto w-full max-w-2xl">
      <div class="px-3 pb-2">
        <div class="py-3 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold text-center">
          <p>
            <font-awesome-icon icon="fa-solid fa-ban" class="mr-1.5" />
            {{ connReason || (callPhone
              ? 'Telegram orqali ulanib bo\'lmadi. Telefon qiling.'
              : 'Telegram orqali ulanib bo\'lmadi.') }}
          </p>
        </div>
      </div>
      <div v-if="!hideBottomOnConnectFail && !callPhone" class="px-3 pb-2">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-red-500 text-white text-[12px] font-black uppercase tracking-wide active:scale-95 transition-all"
          @click="goOrders"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> Buyurtmalarga o'tish
        </button>
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
      :support="isSupportPremium"
      @cancel="replyTarget = null"
    />

    <ChatComposer
      v-if="showComposer && !hideBottomOnConnectFail && !selectionMode"
      v-model="draft"
      :disabled="composerDisabled"
      :placeholder="composerPlaceholder"
      :slash-commands="adminSlashCommands"
      :support="isSupportPremium"
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
import { CHAT_SKELETON_ROWS } from '~/utils/memoryBudget'
import { useDriverChatPage } from '~/composables/chat/useDriverChatPage'
import {
  SUPPORT_CHAT_SHELL,
  SUPPORT_WELCOME_TEXT,
  supportDatePillClass,
  supportEmptyIconWrapClass,
  supportEmptySubtitleClass,
  supportSkeletonClass,
  supportTypingClass,
} from '~/utils/supportChatTheme'

definePageMeta({
  layout: false,
})

const {
  frameStyle,
  chatStore,
  isAdmin,
  adminSlashCommands,
  CHAT_PROXY_CONNECT_ENABLED,
  isOpening,
  openFailed,
  openError,
  fallbackOrderText,
  orderGroupTitle,
  goBackFromOpen,
  telegramContactUrl,
  floatingDateLabel,
  messagesMatchChat,
  showMessageSkeleton,
  showOrderBanner,
  isDirect,
  orderBannerLabel,
  displayOrderText,
  showReadyEmpty,
  visibleMessages,
  selectionMode,
  isMessageSelected,
  focusId,
  chatMediaType,
  formatTime,
  onMessageLongPress,
  toggleMessageSelect,
  onMessageReply,
  onMessageDeleteRequest,
  needsTelegramConnect,
  conn,
  connReason,
  isOrderSenderChat,
  proxyConnecting,
  confirmProxyConnect,
  dismissProxyConfirm,
  hideBottomOnConnectFail,
  callPhone,
  callTelHref,
  selectedCount,
  isDeletingMessages,
  exitSelectionMode,
  confirmDeleteSelected,
  replyTarget,
  showComposer,
  composerDisabled,
  composerPlaceholder,
  onSend,
  onVoice,
  onPhoto,
  showDeleteDialog,
  deleteDialogMessage,
  executeDeleteMessages,
  showClearHistoryDialog,
  showClearHistoryBtn,
  isClearingHistory,
  openClearHistoryDialog,
  executeClearHistory,
  goBack,
  goOrders,
  isSupport,
  isSupportPremium,
  name,
  statusText,
  isOnline,
  peerAvatar,
  peerUserId,
  effectiveChatId,
  scrollEl,
  draft,
} = useDriverChatPage()
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
