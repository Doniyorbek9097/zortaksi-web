import type { ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { useChatStore } from '~/stores/chat.store'
import {
  resolveOrderTextHint,
  resolveQuickLinks,
  buildChatStubFromOrderQuery,
  mergeOrderChatContext,
  hasOrderQueryContext,
} from '~/utils/orderChatQuery'
import {
  normalizeTelHref,
  normalizeTo998,
  resolveChatPhone,
  extractPhoneFromText,
  revealOrderTextPhones,
} from '~/utils/phone'
import { hasTelegramPeerLink } from '~/stores/chat/actions/connection'
import { SUPPORT_OPERATOR_LABEL } from '~/utils/supportChatTheme'

type ChatStore = ReturnType<typeof useChatStore>

/**
 * Chat sahifasi meta — ism, holat, buyurtma banneri, telefon.
 */
export function useChatPageMeta(opts: {
  route: RouteLocationNormalizedLoaded
  chatStore: ChatStore
  chatId: ComputedRef<string>
  isAdmin: ComputedRef<boolean>
  openFailed: Ref<boolean>
  isOpening: ComputedRef<boolean>
  conn: ComputedRef<string>
}) {
  const { route, chatStore, chatId, isAdmin, openFailed, isOpening, conn } = opts

  /** Haqiqiy chat id — route, currentChat, chats ro'yxati */
  const resolveActiveChatId = (): string => {
    const routeId = String(chatId.value || '').trim()
    if (routeId && routeId !== 'open') return routeId

    const fromCurrent = String(chatStore.currentChat?._id || '').trim()
    if (fromCurrent) return fromCurrent

    const orderId = String(route.query.orderId || chatStore.currentChat?.orderId || '').trim()
    if (orderId) {
      const fromList = chatStore.chats.find((c) => String(c.orderId || '') === orderId)
      const listId = String(fromList?._id || '').trim()
      if (listId) return listId
    }

    return routeId
  }

  const ensureCurrentChatForId = (id: string) => {
    if (!id || id === 'open') return
    if (String(chatStore.currentChat?._id || '') === id) return
    const fromList = chatStore.chats.find((c) => String(c._id) === id)
    if (!fromList) return
    const stub = buildChatStubFromOrderQuery(route.query as Record<string, unknown>)
    chatStore.currentChat = mergeOrderChatContext(
      fromList,
      stub,
      chatStore.currentChat,
    ) as import('~/types').IChat
    chatStore.primeFromChat(chatStore.currentChat)
  }

  const effectiveChatId = computed(() => resolveActiveChatId())

  const hasRealChatId = computed(() => {
    const id = effectiveChatId.value
    return !!id && id !== 'open'
  })

  const isSupport = computed(
    () => chatStore.currentChat?.kind === 'support' || route.query.support === '1',
  )

  /** Haydovchi uchun premium yordam UI — admin oddiy chat ko'radi */
  const isSupportPremium = computed(() => isSupport.value && !isAdmin.value)

  const isDirect = computed(() => chatStore.currentChat?.kind === 'direct')
  const isInAppOnly = computed(() => !!chatStore.currentChat?.inAppOnly)
  const isInAppChat = computed(() => isSupport.value || isDirect.value || isInAppOnly.value)
  const needsTelegramConnect = computed(() => !isInAppChat.value)

  const activeChatMeta = computed(() => {
    const id = chatId.value
    if (!id || id === 'open') return chatStore.currentChat
    if (String(chatStore.currentChat?._id || '') === id) return chatStore.currentChat
    return chatStore.chats.find((c) => String(c._id) === id) || chatStore.currentChat
  })

  const name = computed(() => {
    if (isSupport.value && !isAdmin.value) return SUPPORT_OPERATOR_LABEL
    const p = activeChatMeta.value?.peer
    if (p) {
      const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
      if (full) return full
      if (p.username) return p.username
      if (p.userId) return p.userId
    }
    const qName = (route.query.name as string) || ''
    if (qName) return qName
    if (isSupport.value) return SUPPORT_OPERATOR_LABEL
    if (isDirect.value) return 'Haydovchi'
    return 'Buyurtmachi'
  })

  const peerAvatar = computed(() => activeChatMeta.value?.peer?.avatar)
  const peerUserId = computed(() => activeChatMeta.value?.peer?.userId)

  const orderText = computed(() => {
    if (isSupport.value) return ''
    const fromChat = String(activeChatMeta.value?.orderText || '').trim()
    if (fromChat) return fromChat
    return resolveOrderTextHint(route.query as Record<string, unknown>, activeChatMeta.value)
  })

  const hasInstantContext = computed(
    () =>
      !!orderText.value ||
      !!route.query.orderId ||
      isSupport.value ||
      String(route.query.open || '') === 'support',
  )

  const isOrderSenderChat = computed(
    () =>
      !!activeChatMeta.value?.orderId ||
      hasInstantContext.value ||
      !!route.query.orderId,
  )

  const messagesMatchChat = computed(() => {
    const id = effectiveChatId.value
    if (!id || id === 'open') return false
    if (chatStore.messagesChatId === id) return true
    return chatStore.messages.some(
      (m) => String((m as { chatId?: string }).chatId || '') === id,
    )
  })

  const showMessageSkeleton = computed(() => {
    if (isOpening.value || chatId.value === 'open') return false
    if (isOrderSenderChat.value) return false
    if (!messagesMatchChat.value) return true
    return chatStore.isLoadingMessages && !chatStore.messages.length && !hasInstantContext.value
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
    if (isSupport.value && !isAdmin.value) return 'Onlayn yordam'
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

  const showOrderBanner = computed(() => {
    if (isSupport.value) return false
    if (showMessageSkeleton.value && !hasInstantContext.value) return false
    return isDirect.value || !!orderText.value
  })

  const orderBannerLabel = computed(() =>
    isDirect.value ? 'Haydovchi' : "Buyurtma e'loni",
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

  const fallbackOrderText = computed(() => {
    if (!isOpening.value || !openFailed.value) return ''
    const raw = resolveOrderTextHint(route.query as Record<string, unknown>, null)
    return revealOrderTextPhones(raw, String(route.query.phone || ''))
  })

  const callPhone = computed(() => {
    if (isSupport.value && !isAdmin.value) return ''
    const qPhone = String(route.query.phone || '').trim()
    if (qPhone.replace(/\D/g, '').length >= 7) {
      return normalizeTo998(qPhone) || qPhone.replace(/\D/g, '')
    }

    const peerPhone = String(chatStore.currentChat?.peer?.phone || '').trim()
    if (peerPhone.replace(/\D/g, '').length >= 7) {
      return normalizeTo998(peerPhone) || peerPhone.replace(/\D/g, '')
    }

    const revealed = revealOrderTextPhones(orderText.value, peerPhone || qPhone)

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

  const callTelHref = computed(() => (callPhone.value ? normalizeTelHref(callPhone.value) : ''))

  const quickLinks = computed(() =>
    resolveQuickLinks(route.query as Record<string, unknown>, chatStore.currentChat),
  )

  const telegramContactUrl = computed(() => quickLinks.value.telegramHref)

  const hasPeerLink = computed(() => hasTelegramPeerLink(chatStore.currentChat))

  const composerLikelyReady = computed(() => hasPeerLink.value)

  const canSendTelegram = computed(
    () =>
      hasRealChatId.value &&
      (isInAppChat.value || hasPeerLink.value || conn.value === 'ready'),
  )

  const hideBottomOnConnectFail = computed(
    () =>
      isOrderSenderChat.value &&
      needsTelegramConnect.value &&
      conn.value === 'unreachable',
  )

  return {
    resolveActiveChatId,
    ensureCurrentChatForId,
    effectiveChatId,
    hasRealChatId,
    isSupport,
    isSupportPremium,
    isDirect,
    isInAppOnly,
    isInAppChat,
    needsTelegramConnect,
    activeChatMeta,
    name,
    peerAvatar,
    peerUserId,
    orderText,
    hasInstantContext,
    isOrderSenderChat,
    messagesMatchChat,
    showMessageSkeleton,
    isOnline,
    statusText,
    showReadyEmpty,
    showOrderBanner,
    orderBannerLabel,
    orderGroupTitle,
    displayOrderText,
    fallbackOrderText,
    callPhone,
    callTelHref,
    quickLinks,
    telegramContactUrl,
    hasPeerLink,
    composerLikelyReady,
    canSendTelegram,
    hideBottomOnConnectFail,
    hasOrderQueryContext,
  }
}
