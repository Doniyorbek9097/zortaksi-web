import { useAuthStore } from '~/stores/auth.store'
import { useChatStore } from '~/stores/chat.store'
import { isAdminUser } from '~/utils/userRole'
import { useAdminSlashCommands } from '~/composables/useAdminSlashCommands'
import { isLegacyPaymentChatMessage } from '~/utils/legacyPaymentChatMessage'
import { groupMessagesByDate } from '~/utils/chatDate'
import {
  clearTelegramCloseOnBack,
  installTelegramChatBackTrap,
  markTelegramCloseOnBack,
  shouldTelegramCloseOnBack,
} from '~/utils/telegramMiniAppBack'
import { isFromGroupTakeClient } from '~/utils/orderChatQuery'
import { isTelegramMiniApp } from '~/utils/telegramStartRedirect'
import type { ChatReplyTarget } from '~/components/chat/ReplyBar.vue'
import { useChatPageMeta } from './useChatPageMeta'
import { useChatMessageSelection } from './useChatMessageSelection'
import { useChatScrollPanel } from './useChatScrollPanel'
import { useChatComposerPanel } from './useChatComposerPanel'
import { useChatPageLoader } from './useChatPageLoader'
/**
 * Haydovchi chat sahifasi — barcha chat composablelarni birlashtiradi.
 */
export function useDriverChatPage() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const chatStore = useChatStore()
  const { frameStyle } = useVisualViewportFrame()

  const isAdmin = computed(() => isAdminUser(authStore.user))
  const { commands: adminSlashCommandList, load: loadAdminSlashCommands } = useAdminSlashCommands()
  const adminSlashCommands = computed(() =>
    isAdmin.value ? adminSlashCommandList.value : [],
  )

  const chatId = computed(() => route.params.id as string)
  const isOpening = computed(() => chatId.value === 'open')
  const conn = computed(() => chatStore.connectionStatus)
  const connReason = computed(() => chatStore.connectionReason)

  const openFailed = ref(false)
  const openError = ref('')
  const proxyConnecting = ref(false)
  const draft = ref('')
  const replyTarget = ref<ChatReplyTarget | null>(null)
  const scrollEl = ref<HTMLElement | null>(null)
  const focusId = ref(String(route.query.focus || ''))

  const visibleMessages = computed(() =>
    chatStore.messages.filter((m) => !isLegacyPaymentChatMessage(m)),
  )

  const messageDateGroups = computed(() => groupMessagesByDate(visibleMessages.value))

  const meta = useChatPageMeta({
    route,
    chatStore,
    chatId,
    isAdmin,
    openFailed,
    isOpening,
    conn,
  })

  const selection = useChatMessageSelection({
    chatStore,
    effectiveChatId: meta.effectiveChatId,
    messagesMatchChat: meta.messagesMatchChat,
    replyTarget,
  })

  const scroll = useChatScrollPanel({
    chatStore,
    chatId,
    scrollEl,
    focusId,
  })

  const composer = useChatComposerPanel({
    chatStore,
    draft,
    replyTarget,
    resolveActiveChatId: meta.resolveActiveChatId,
    ensureCurrentChatForId: meta.ensureCurrentChatForId,
    scrollToBottom: scroll.scrollToBottom,
    effectiveChatId: meta.effectiveChatId,
    isOpening,
    openFailed,
    isInAppChat: meta.isInAppChat,
    needsTelegramConnect: meta.needsTelegramConnect,
    isOrderSenderChat: meta.isOrderSenderChat,
    hasInstantContext: meta.hasInstantContext,
    hasRealChatId: meta.hasRealChatId,
    composerLikelyReady: meta.composerLikelyReady,
    canSendTelegram: meta.canSendTelegram,
    hideBottomOnConnectFail: meta.hideBottomOnConnectFail,
    hasPeerLink: meta.hasPeerLink,
    conn,
    connReason,
    callPhone: meta.callPhone,
  })

  const loader = useChatPageLoader({
    route,
    router,
    authStore,
    chatStore,
    chatId,
    effectiveChatId: meta.effectiveChatId,
    resolveActiveChatId: meta.resolveActiveChatId,
    ensureCurrentChatForId: meta.ensureCurrentChatForId,
    scrollToFocus: scroll.scrollToFocus,
    exitSelectionMode: selection.exitSelectionMode,
    focusId,
    draft,
    openFailed,
    openError,
    isInAppChat: meta.isInAppChat,
  })

  loader.bindChatIdWatch()
  scroll.bindScrollListener()

  const goChats = () => {
    clearTelegramCloseOnBack()
    navigateTo('/driver/chats')
  }

  const goOrders = () => {
    clearTelegramCloseOnBack()
    navigateTo('/driver/orders')
  }

  const goBackFromOpen = () => {
    if (shouldTelegramCloseOnBack()) {
      goChats()
      return
    }
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

  usePullToRefresh(async () => {
    const id = meta.effectiveChatId.value
    if (!id || id === 'open') return
    await chatStore.fetchMessages(id)
    scroll.scrollToFocus()
  })

  watch(
    () => [route.path, String(route.query.open || ''), String(route.query.orderId || '')],
    ([path, open, orderId]) => {
      const isBotEntry =
        isFromGroupTakeClient(route.query as Record<string, unknown>) ||
        (path === '/driver/chat/open' &&
          open === 'order' &&
          !!orderId &&
          isTelegramMiniApp())
      if (isBotEntry) {
        markTelegramCloseOnBack()
        installTelegramChatBackTrap()
      }
    },
    { immediate: true },
  )

  watch(
    () => route.path,
    (path) => {
      if (shouldTelegramCloseOnBack() && path.startsWith('/driver/chat/')) {
        installTelegramChatBackTrap()
      }
    },
    { immediate: true },
  )

  let prevBodyOverflow = ''
  let prevHtmlOverflow = ''

  onMounted(() => {
    if (isAdmin.value) void loadAdminSlashCommands()

    prevBodyOverflow = document.body.style.overflow
    prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  })

  onBeforeUnmount(() => {
    loader.disposeLoader()
    scroll.disposeScroll()
    document.body.style.overflow = prevBodyOverflow
    document.documentElement.style.overflow = prevHtmlOverflow

    chatStore.currentChat = null
    chatStore.messages = []
    chatStore.resetMessagesPagination()
    chatStore.resetConnection()
    replyTarget.value = null
  })

  /** O'z hisob ishlamaganda — tinglovchi userbot orqali proksi ulanish */
  const confirmProxyConnect = async () => {
    const id = meta.resolveActiveChatId()
    if (!id || id === 'open' || proxyConnecting.value) return
    proxyConnecting.value = true
    try {
      await chatStore.connect(id, { viaProxy: true })
    } finally {
      proxyConnecting.value = false
    }
  }

  return {
    frameStyle,
    authStore,
    chatStore,
    isAdmin,
    adminSlashCommands,
    chatId,
    isOpening,
    conn,
    connReason,
    openFailed,
    openError,
    draft,
    replyTarget,
    scrollEl,
    focusId,
    visibleMessages,
    messageDateGroups,
    ...meta,
    ...selection,
    ...scroll,
    ...composer,
    goBack,
    goBackFromOpen,
    goOrders,
    proxyConnecting,
    confirmProxyConnect,
  }
}
