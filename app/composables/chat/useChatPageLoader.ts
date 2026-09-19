import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { useAuthStore } from '~/stores/auth.store'
import type { useChatStore } from '~/stores/chat.store'
import {
  buildChatStubFromOrderQuery,
  buildChatStubFromOrder,
  buildMinimalOrderChatStub,
  hasOrderQueryContext,
  hasOrderSenderQueryContext,
  resolveChatFromOpenQuery,
  isFromGroupTakeClient,
  mergeOrderChatContext,
} from '~/utils/orderChatQuery'
import { useOrderTakeAccess } from '~/composables/useOrderTakeAccess'
import { getApiErrorMessage } from '~/utils/apiError'
import { hasTelegramPeerLink } from '~/stores/chat/actions/connection'
import { clearTelegramStartParamStorage } from '~/utils/telegramStartParam'
import { resolveOrderTakeAccessRedirect } from '~/utils/orderTakeAccess'
import { isAdminUser } from '~/utils/userRole'
import { SUPPORT_OPERATOR_LABEL } from '~/utils/supportChatTheme'
import { useOrderStore } from '~/stores/order.store'

type AuthStore = ReturnType<typeof useAuthStore>
type ChatStore = ReturnType<typeof useChatStore>

/**
 * Chat sahifasini yuklash — open/bootstrap, xabarlar, presence.
 */
export function useChatPageLoader(opts: {
  route: RouteLocationNormalizedLoaded
  router: Router
  authStore: AuthStore
  chatStore: ChatStore
  chatId: ComputedRef<string>
  effectiveChatId: ComputedRef<string>
  resolveActiveChatId: () => string
  ensureCurrentChatForId: (id: string) => void
  scrollToFocus: () => void
  exitSelectionMode: () => void
  focusId: Ref<string>
  draft: Ref<string>
  openFailed: Ref<boolean>
  openError: Ref<string>
  isInAppChat: ComputedRef<boolean>
}) {
  const {
    route,
    router,
    authStore,
    chatStore,
    chatId,
    effectiveChatId,
    resolveActiveChatId,
    ensureCurrentChatForId,
    scrollToFocus,
    exitSelectionMode,
    focusId,
    draft,
    openFailed,
    openError,
    isInAppChat,
  } = opts

  const { ensureAccess: ensureOrderTakeAccessFromApi, redirectIfBlocked: redirectOrderTakeBlocked } =
    useOrderTakeAccess()

  let presenceTimer: ReturnType<typeof setInterval> | null = null
  let loadSeq = 0

  const clearPresenceTimer = () => {
    if (presenceTimer) {
      clearInterval(presenceTimer)
      presenceTimer = null
    }
  }

  const resetChatUi = (
    nextChatId?: string,
    opts2?: { preserveConnection?: boolean; keepChat?: import('~/types').IChat | null },
  ) => {
    chatStore.persistCurrentMessagesCache()
    chatStore.invalidateMessagesFetch()
    clearPresenceTimer()
    exitSelectionMode()

    const keepId = String(opts2?.keepChat?._id || chatStore.currentChat?._id || '').trim()
    const skipMessageReset =
      !!nextChatId &&
      nextChatId !== 'open' &&
      !!keepId &&
      keepId === String(nextChatId) &&
      chatStore.messagesChatId === keepId &&
      chatStore.messages.length > 0

    if (!skipMessageReset) {
      chatStore.messages = []
      chatStore.messagesChatId = null
      chatStore.resetMessagesPagination()
    }

    chatStore.currentChat = opts2?.keepChat ?? null
    if (!opts2?.preserveConnection) {
      chatStore.resetConnection()
    }
    chatStore.isLoadingMessages = true
    draft.value = ''
    focusId.value = String(route.query.focus || '')

    if (nextChatId && nextChatId !== 'open') {
      chatStore.hydrateMessagesFromCache(nextChatId)
    }
  }

  /** Query / stash dan darhol chat UI */
  const applyInstantOrderUiFromQuery = () => {
    const q = route.query as Record<string, unknown>
    const orderId = String(q.orderId || '').trim()
    if (!orderId && !hasOrderQueryContext(q)) return

    chatStore.isLoadingMessages = false
    if (!isInAppChat.value && chatStore.connectionStatus === 'idle') {
      chatStore.primeOrderChatConnecting(chatStore.currentChat)
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

  /** Support chat — query dan darhol UI */
  const applyInstantSupportUiFromQuery = () => {
    const q = route.query as Record<string, unknown>
    if (String(q.open || '') !== 'support') return

    const userId = String(q.userId || '').trim()
    const name = String(q.name || '').trim() || (userId ? 'Haydovchi' : SUPPORT_OPERATOR_LABEL)

    chatStore.isLoadingMessages = false
    chatStore.connectionStatus = 'ready'

    const listed = resolveChatFromOpenQuery(q, chatStore.chats)
    chatStore.currentChat = (listed || {
      kind: 'support',
      inAppOnly: true,
      peer: userId
        ? { userId, firstName: name }
        : { firstName: SUPPORT_OPERATOR_LABEL },
    }) as import('~/types').IChat
    chatStore.primeFromChat(chatStore.currentChat)
  }

  /** Guruh «Mijozni olish» — fon API to'ldirish */
  const enrichOrderUiFromApi = (orderId: string) => {
    void (async () => {
      try {
        const res = await useApi(`/orders/${orderId}`, { timeout: 10_000 })
        if (!res?.success || !res.data) return

        const fromOrder = buildChatStubFromOrder(
          res.data as import('~/types').IOrder,
          String(authStore.user?.userId || ''),
        )
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

  const primeInstantOrderUi = () => {
    applyInstantSupportUiFromQuery()
    applyInstantOrderUiFromQuery()
    const orderId = String(route.query.orderId || '').trim()
    if (orderId && isFromGroupTakeClient(route.query as Record<string, unknown>)) {
      enrichOrderUiFromApi(orderId)
    }
  }

  const startPresenceLoop = (id: string) => {
    clearPresenceTimer()
    presenceTimer = setInterval(() => {
      void chatStore.fetchPresence(id)
    }, 90_000)
  }

  const preconnectChatOpen = (id: string, chat?: import('~/types').IChat | null) => {
    if (!id) return
    if (chat) chatStore.primeFromChat(chat)
    void chatStore.connect(id, { silent: true })
  }

  /** API dan kelgan chat — sahifada qolish, qayta navigatsiya yo'q */
  const adoptOpenChatInPlace = (chat: import('~/types').IChat): boolean => {
    const newId = String(chat._id || '')
    if (!newId) return false

    const q = route.query as Record<string, unknown>
    const queryStub = buildChatStubFromOrderQuery(q)
    const merged = mergeOrderChatContext(
      queryStub,
      chatStore.currentChat,
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
      chatStore.primeOrderChatConnecting(merged)
    }

    const idx = chatStore.chats.findIndex((c) => c._id === newId)
    if (idx >= 0) {
      chatStore.chats[idx] = mergeOrderChatContext(chatStore.chats[idx], merged) as import('~/types').IChat
    } else {
      chatStore.chats.unshift(merged)
    }

    chatStore.hydrateMessagesFromCache(newId)
    preconnectChatOpen(newId, merged)
    void chatStore.fetchMessages(newId)
    clearTelegramStartParamStorage()

    const openedOrderId = String(merged.orderId || '').trim()
    if (openedOrderId) {
      void useOrderStore().markInterest(openedOrderId)
    }

    return true
  }

  const canSkipOrderTakeAccessCheck = (): boolean =>
    !resolveOrderTakeAccessRedirect({
      user: authStore.user,
      fullPath: route.fullPath,
    })

  /** Order tugmasidan kelgan ochilish — API, keyin real chatId */
  const bootstrapOpenChat = async (seq: number) => {
    const q = route.query as Record<string, unknown>
    const mode = String(q.open || '')
    const orderId = String(q.orderId || '')
    const userId = String(q.userId || '')

    const fail = async (message?: string) => {
      if (seq !== loadSeq) return
      chatStore.isLoadingMessages = false
      openFailed.value = true
      const raw = message || "Chat ochib bo'lmadi"
      if (/order topilmadi/i.test(raw)) {
        openError.value = "Buyurtma muddati tugagan yoki o'chirilgan. Telegram orqali bog'laning."
      } else {
        openError.value = raw
      }
    }

    const handleStartChatResponse = async (res: {
      code?: string
      message?: string
      success?: boolean
      data?: { _id?: string }
    }) => {
      if (seq !== loadSeq) return true

      if (
        mode !== 'order' &&
        (res?.code === 'TARIFF_INACTIVE' ||
          res?.code === 'NOT_VERIFIED' ||
          /tarif faol emas/i.test(String(res?.message || '')))
      ) {
        chatStore.isLoadingMessages = false
        if ((await redirectOrderTakeBlocked(route.fullPath)) || seq !== loadSeq) return true
      }

      if (res?.success && res.data?._id) {
        const chat = res.data as import('~/types').IChat
        if (!adoptOpenChatInPlace(chat)) {
          await fail('Chat identifikatori topilmadi')
        }
        return true
      }

      await fail(res?.message || "Chat ochib bo'lmadi")
      return true
    }

    const startChatApi = () => {
      if (mode === 'order' && orderId) return chatStore.startChatFromOrder(orderId)
      if (mode === 'booked' && orderId) return chatStore.startChatWithBookedDriver(orderId)
      if (mode === 'agent' && orderId) return chatStore.startChatWithOrderOwner(orderId)
      if (mode === 'user' && userId) {
        return chatStore.startChatWithUser(userId, orderId || undefined)
      }
      if (mode === 'support') {
        const adminCaller = isAdminUser(authStore.user)
        if (adminCaller && userId) return chatStore.startSupportChat(userId)
        if (!adminCaller) return chatStore.startSupportChat()
        return null
      }
      return null
    }

    const alreadyHasChat =
      !!String(chatStore.currentChat?._id || '').trim() &&
      (!orderId || String(chatStore.currentChat?.orderId || '') === orderId)
    if (!alreadyHasChat) {
      primeInstantOrderUi()
    }

    const needsAccess = !!(mode === 'user' && userId)
    const skipAccessCheck = needsAccess && canSkipOrderTakeAccessCheck()

    const localChat = resolveChatFromOpenQuery(q, chatStore.chats)
    if (localChat?._id) {
      const stub = buildChatStubFromOrderQuery(q)
      chatStore.currentChat = {
        ...localChat,
        ...(stub || {}),
        peer: { ...localChat.peer, ...(stub?.peer || {}) },
      } as import('~/types').IChat
      if (seq !== loadSeq) return
      adoptOpenChatInPlace(chatStore.currentChat)
      return
    }

    const chatApi = startChatApi()
    if (!chatApi) {
      await fail()
      return
    }

    try {
      if (needsAccess && !skipAccessCheck) {
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

      if (mode === 'order' && orderId) {
        const res = await chatApi
        await handleStartChatResponse(res)
        return
      }

      const res = await chatApi
      await handleStartChatResponse(res)
    } catch (err) {
      console.error('bootstrapOpenChat error:', err)
      await fail(getApiErrorMessage(err, "Chat ochib bo'lmadi"))
    }
  }

  const loadChat = async (id: string) => {
    const seq = ++loadSeq
    const listedEarly = chatStore.chats.find((c) => c._id === id)
    const preserveConnection = !!(listedEarly && hasTelegramPeerLink(listedEarly))
    const queryStub = buildChatStubFromOrderQuery(route.query as Record<string, unknown>)
    const prevChat = chatStore.currentChat
    const keepChat =
      prevChat?.orderId || queryStub?.orderId
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
        const stub = buildChatStubFromOrderQuery(route.query as Record<string, unknown>)
        const merged = mergeOrderChatContext(
          early,
          stub,
          chatStore.currentChat,
        ) as import('~/types').IChat
        adoptOpenChatInPlace(merged)
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
        const chatRef = listed || chatStore.currentChat
        const linked = hasTelegramPeerLink(chatRef)
        if (orderChat && !linked) {
          chatStore.primeOrderChatConnecting(chatRef)
        }
        const connStatus = chatStore.connectionStatus
        const skipRepeatOwnConnect = !!orderChat && connStatus === 'connecting'
        if (linked) {
          chatStore.connectionStatus = 'ready'
        } else if (!skipRepeatOwnConnect) {
          void chatStore.connect(id, { silent: wasLinked || !!orderChat })
        }
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

  const bindChatIdWatch = () => {
    watch(chatId, (id) => {
      if (!id) return
      void loadChat(id)
    }, { immediate: true })

    watch(
      () => chatStore.chats.map((c) => `${c._id}:${c.orderId}`).join('|'),
      () => {
        if (chatId.value !== 'open') return
        const id = resolveActiveChatId()
        if (id && id !== 'open') ensureCurrentChatForId(id)
      },
    )
  }

  const disposeLoader = () => {
    loadSeq += 1
    clearPresenceTimer()
  }

  return {
    loadChat,
    bindChatIdWatch,
    clearPresenceTimer,
    disposeLoader,
  }
}
