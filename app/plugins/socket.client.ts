import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'
import { playChatSound, playOrderSound, unlockNotifySound } from '~/composables/useNotifySound'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')
  const chatStore = useChatStore()
  const orderStore = useOrderStore()

  let socket: Socket | null = null

  // Brauzer autoplay — birinchi click/tap dan keyin ovoz ochiladi
  if (import.meta.client) {
    const unlock = () => unlockNotifySound()
    window.addEventListener('pointerdown', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  const connect = () => {
    if (socket || !token.value) return
    socket = io(config.public.socketUrl as string, {
      auth: { token: token.value },
      transports: ['websocket', 'polling'],
    })

    socket.on('message:new', (msg) => {
      chatStore.onNewMessage(msg)
      // Faqat kiruvchi xabar — ovoz
      if (msg?.direction === 'in') playChatSound()
    })
    socket.on('chat:update', (chat) => chatStore.onChatUpdate(chat))
    socket.on('messages:read', (data) => chatStore.onMessagesRead(data))
    socket.on('peer:presence', (data) => chatStore.onPeerPresence(data))
    socket.on('order:new', (order) => {
      const list = orderStore.orders
      const isNew = !list.some((o) => o._id === order._id)
      if (isNew) {
        orderStore.orders = [order, ...list]
        orderStore.total = (orderStore.total || 0) + 1
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
  watch(token, (val) => (val ? connect() : disconnect()))

  return {
    provide: {
      socket: () => socket,
    },
  }
})
