import type { ComputedRef, Ref } from 'vue'
import type { useChatStore } from '~/stores/chat.store'
import { DRIVER_ORDER_CONNECT_FAIL } from '~/stores/chat/actions/connection'
import type { ChatReplyTarget } from '~/components/chat/ReplyBar.vue'

type ChatStore = ReturnType<typeof useChatStore>

/** Chat yozish paneli — composer holati va yuborish */
export function useChatComposerPanel(opts: {
  chatStore: ChatStore
  draft: Ref<string>
  replyTarget: Ref<ChatReplyTarget | null>
  resolveActiveChatId: () => string
  ensureCurrentChatForId: (id: string) => void
  scrollToBottom: () => void
  effectiveChatId: ComputedRef<string>
  isOpening: ComputedRef<boolean>
  openFailed: Ref<boolean>
  isInAppChat: ComputedRef<boolean>
  needsTelegramConnect: ComputedRef<boolean>
  isOrderSenderChat: ComputedRef<boolean>
  hasInstantContext: ComputedRef<boolean>
  hasRealChatId: ComputedRef<boolean>
  composerLikelyReady: ComputedRef<boolean>
  canSendTelegram: ComputedRef<boolean>
  hideBottomOnConnectFail: ComputedRef<boolean>
  hasPeerLink: ComputedRef<boolean>
  conn: ComputedRef<string>
  connReason: ComputedRef<string>
  callPhone: ComputedRef<string>
}) {
  const {
    chatStore,
    draft,
    replyTarget,
    resolveActiveChatId,
    ensureCurrentChatForId,
    scrollToBottom,
    effectiveChatId,
    isOpening,
    openFailed,
    isInAppChat,
    needsTelegramConnect,
    isOrderSenderChat,
    hasInstantContext,
    hasRealChatId,
    composerLikelyReady,
    canSendTelegram,
    hideBottomOnConnectFail,
    hasPeerLink,
    conn,
    connReason,
    callPhone,
  } = opts

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
        conn.value === 'idle' ||
        conn.value === 'proxy-required' ||
        conn.value === 'unreachable'),
  )

  const composerDisabled = computed(
    () =>
      !hasRealChatId.value ||
      composerBusy.value ||
      (!isInAppChat.value && !canSendTelegram.value),
  )

  const composerPlaceholder = computed(() => {
    if (!hasRealChatId.value || composerBusy.value) {
      return 'Ulanmoqda...'
    }
    if (isOrderSenderChat.value && needsTelegramConnect.value && !hasPeerLink.value) {
      if (conn.value === 'unreachable') {
        return DRIVER_ORDER_CONNECT_FAIL
      }
      if (conn.value === 'proxy-required') {
        return 'Proksi orqali ulanishni tasdiqlang'
      }
      if (conn.value === 'connecting' || conn.value === 'idle') {
        return 'Ulanmoqda...'
      }
    }
    if (
      needsTelegramConnect.value &&
      (conn.value === 'connecting' || conn.value === 'idle') &&
      !hasPeerLink.value
    ) {
      return 'Telegram ulanmoqda...'
    }
    if (conn.value === 'unreachable') {
      if (isOrderSenderChat.value) {
        return DRIVER_ORDER_CONNECT_FAIL
      }
      return callPhone.value
        ? "Ulanib bo'lmadi — telefon qiling"
        : "Telegram orqali ulanib bo'lmadi"
    }
    return 'Xabar yozing...'
  })

  /** Media tipini bubble uchun aniqlash */
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

  const onSend = async (text: string) => {
    const id = resolveActiveChatId()
    if (!id || id === 'open') return
    ensureCurrentChatForId(id)
    chatStore.messagesChatId = id

    if (needsTelegramConnect.value) {
      if (isOrderSenderChat.value) {
        await chatStore.connect(id, { silent: true })
      } else {
        await chatStore.ensureTelegramReady(id)
      }
    }

    const replyId = replyTarget.value?.id
    try {
      await chatStore.sendMessage(id, text, replyId)
    } catch {
      /* temp bubble failed holatiga o'tadi */
    }
    replyTarget.value = null
    scrollToBottom()
  }

  const onVoice = async (blob: Blob, seconds: number) => {
    const id = resolveActiveChatId()
    if (!id || id === 'open') return
    ensureCurrentChatForId(id)
    if (needsTelegramConnect.value) void chatStore.ensureTelegramReady(id)
    await chatStore.sendVoice(id, blob, seconds)
    scrollToBottom()
  }

  const onPhoto = async (file: File) => {
    const id = resolveActiveChatId()
    if (!id || id === 'open') return
    ensureCurrentChatForId(id)
    if (needsTelegramConnect.value) void chatStore.ensureTelegramReady(id)
    await chatStore.sendPhoto(id, file)
    scrollToBottom()
  }

  return {
    composerBusy,
    showComposer,
    composerDisabled,
    composerPlaceholder,
    chatMediaType,
    onSend,
    onVoice,
    onPhoto,
  }
}
