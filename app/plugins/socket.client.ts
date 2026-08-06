import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'
import { useAuthStore } from '~/stores/auth.store'
import { playChatSound, playOrderSound, unlockNotifySound } from '~/composables/useNotifySound'
import { resolveAuthToken } from '~/utils/activeAccount'
import { getAuthCookieOptions } from '~/utils/authCookie'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  orderMatchesRegionFilter,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const cookie = useCookie('auth_token', { ...getAuthCookieOptions() })
  const chatStore = useChatStore()
  const orderStore = useOrderStore()

  let socket: Socket | null = null
  let visibilityBound = false

  if (import.meta.client) {
    const unlock = () => unlockNotifySound()
    window.addEventListener('pointerdown', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  const currentToken = () => resolveAuthToken(cookie.value)

  const orderSearchParams = () => {
    const botGroupId = loadOrderFilterBotGroupId().trim() || undefined
    const search = botGroupId ? undefined : loadOrderFilterKeywords().trim() || undefined
    const text = orderStore.listText.trim() || undefined
    return {
      limit: ORDERS_PAGE_LIMIT,
      ...(botGroupId ? { botGroupId } : search ? { search } : {}),
      ...(text ? { text } : {}),
      ...(orderStore.listScope === 'mine' ? { scope: 'mine' as const } : {}),
    }
  }

  const catchUpOrders = () => {
    if (!currentToken()) return
    void orderStore.syncLatest(orderSearchParams())
  }

  const catchUpChats = () => {
    if (!currentToken()) return
    void chatStore.fetchChats().catch(() => {})
    const openId = chatStore.currentChat?._id
    if (openId) void chatStore.fetchMessages(openId).catch(() => {})
  }

  const catchUpAll = () => {
    catchUpOrders()
    catchUpChats()
  }

  const connect = () => {
    const t = currentToken()
    if (!t) return
    if (socket) {
      socket.disconnect()
      socket = null
    }
    socket = io(config.public.socketUrl as string, {
      auth: { token: t },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    })

    socket.on('message:new', (msg) => {
      chatStore.onNewMessage(msg)
      if (msg?.direction === 'in') playChatSound()
    })
    socket.on('message:update', (msg) => chatStore.onMessageUpdate(msg))
    socket.on('chat:update', (chat) => chatStore.onChatUpdate(chat))
    socket.on('messages:read', (data) => chatStore.onMessagesRead(data))
    socket.on('messages:deleted', (data) => chatStore.onMessagesDeleted(data))
    socket.on('chat:connect', (data) => chatStore.onChatConnect(data))
    socket.on('peer:presence', (data) => chatStore.onPeerPresence(data))
    socket.on('peer:typing', (data) => chatStore.onPeerTyping(data))
    socket.on('tariff:expired', () => {
      const authStore = useAuthStore()
      authStore.markTariffExpired()
      void authStore.getMe().catch(() => {})
    })
    socket.on('order:new', (order) => {
      const botGroupId = loadOrderFilterBotGroupId().trim()
      const kw = loadOrderFilterKeywords().trim()
      const textQuery = orderStore.listText.trim()

      if (botGroupId || textQuery || orderStore.listScope === 'mine') {
        orderStore.scheduleSyncLatest(orderSearchParams())
        return
      }

      if (kw && !orderMatchesRegionFilter(order, kw)) return

      const added = orderStore.prependOrder(order)
      if (added) playOrderSound()
    })
    socket.on('order:update', (order) => {
      const botGroupId = loadOrderFilterBotGroupId().trim()
      const kw = loadOrderFilterKeywords().trim()
      const textQuery = orderStore.listText.trim()
      if (botGroupId || textQuery || orderStore.listScope === 'mine') {
        orderStore.scheduleSyncLatest(orderSearchParams())
        return
      }
      if (kw && !orderMatchesRegionFilter(order, kw)) {
        const inList = orderStore.orders.some(
          (o) => o._id && order?._id && String(o._id) === String(order._id),
        )
        if (inList) orderStore.removeOrderById(String(order._id))
        return
      }
      orderStore.applyOrderUpdate(order)
    })
    socket.on('order:cancelled', (data: { orderId?: string }) => {
      if (data?.orderId) orderStore.removeOrderById(String(data.orderId))
    })
    socket.on('connect', () => {
      catchUpAll()
    })
    socket.on('connect_error', (err) => console.warn('[socket] connect_error:', err.message))

    if (import.meta.client && !visibilityBound) {
      visibilityBound = true
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') catchUpAll()
      })
    }
  }

  const disconnect = () => {
    socket?.disconnect()
    socket = null
  }

  connect()
  watch(cookie, (val) => {
    if (val) connect()
    else disconnect()
  })

  return {
    provide: {
      socket: () => socket,
      reconnectSocket: () => connect(),
    },
  }
})
