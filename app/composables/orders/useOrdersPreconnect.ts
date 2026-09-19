import type { Ref } from 'vue'
import type { IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'
import { useAuthStore } from '~/stores/auth.store'

const MAX_VISIBLE_WARM = 4
const WARM_DEBOUNCE_MS = 350

/**
 * Buyurtmalar ro'yxatida ko'rinadigan senderlarni oldindan warm qilish.
 * Faqat /orders/warm-peers — ruxsatsiz proxy ulanmaydi.
 */
export function useOrdersPreconnect(_options: {
  chatStore: ReturnType<typeof useChatStore>
  displayOrders: Ref<IOrder[]>
}) {
  const orderStore = useOrderStore()
  const authStore = useAuthStore()
  const { displayOrders } = _options

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const queued = new Set<string>()

  const driverHasHash = (order: IOrder, driverId: string) => {
    const hashes = order.sender?.accessHashes || []
    return hashes.some(
      (h) => String(h.ownerId) === driverId && String(h.accessHash || '').trim(),
    )
  }

  const warmTopVisible = () => {
    if (!import.meta.client) return
    const driverId = String(authStore.user?.userId || '')
    if (!driverId) return

    for (const order of displayOrders.value.slice(0, MAX_VISIBLE_WARM)) {
      const id = String(order._id || '')
      if (!id || order.sender?.isBot || queued.has(id)) continue
      if (driverHasHash(order, driverId)) continue
      queued.add(id)
      void orderStore.warmOrderPeerAsync(id)
    }
  }

  watch(
    () => displayOrders.value.map((o) => o._id).join(','),
    () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        warmTopVisible()
      }, WARM_DEBOUNCE_MS)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })
}
