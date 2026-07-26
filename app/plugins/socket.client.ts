import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'
import { useAuthStore } from '~/stores/auth.store'
import { playChatSound, playOrderSound, unlockNotifySound } from '~/composables/useNotifySound'
import { resolveAuthToken } from '~/utils/activeAccount'
import { getAuthCookieOptions } from '~/utils/authCookie'

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

  /** Socket uzilganda yoki tab qaytganda Mongo'dan catch-up */
  const catchUpOrders = () => {
    if (!currentToken()) return
    void orderStore.syncLatest()
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
    // Account switch: eski socketni yopib qayta ulash
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
    socket.on('peer:presence', (data) => chatStore.onPeerPresence(data))
    socket.on('peer:typing', (data) => chatStore.onPeerTyping(data))
    socket.on('tariff:expired', () => {
      const authStore = useAuthStore()
      authStore.markTariffExpired()
      void authStore.getMe().catch(() => {})
    })
    socket.on('order:new', (order) => {
      const added = orderStore.prependOrder(order)
      if (added) playOrderSound()
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
