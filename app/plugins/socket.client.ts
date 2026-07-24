import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'
import { playChatSound, playOrderSound, unlockNotifySound } from '~/composables/useNotifySound'
import { resolveAuthToken } from '~/utils/activeAccount'
import { authCookieOptions } from '~/utils/authCookie'
import { orderContentKey } from '~/utils/orderDedupe'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const cookie = useCookie('auth_token', { ...authCookieOptions })
  const chatStore = useChatStore()
  const orderStore = useOrderStore()

  let socket: Socket | null = null

  if (import.meta.client) {
    const unlock = () => unlockNotifySound()
    window.addEventListener('pointerdown', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  const currentToken = () => resolveAuthToken(cookie.value)

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
    socket.on('order:new', (order) => {
      const list = orderStore.orders
      const incomingKey = orderContentKey(order)
      const isDup = list.some((o) => {
        if (o._id && order?._id && String(o._id) === String(order._id)) return true
        const existingKey = orderContentKey(o)
        return !!incomingKey && !!existingKey && incomingKey === existingKey
      })
      if (!isDup) {
        orderStore.orders = [order, ...list]
        orderStore.total = (orderStore.total || 0) + 1
        if ((order?.status || 'new') === 'new') orderStore.bumpNewCount(1)
        playOrderSound()
      }
    })
    socket.on('connect_error', (err) => console.warn('[socket] connect_error:', err.message))
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
