import type { Ref } from 'vue'
import type { IOrder } from '~/types'
import type { useChatStore } from '~/stores/chat.store'

/**
 * Avval top-N order uchun silent startChat+connect CPU/RAM ni to'ldirardi.
 * Endi faqat no-op — chat ochilganda connect qilinadi.
 */
export function useOrdersPreconnect(_options: {
  chatStore: ReturnType<typeof useChatStore>
  displayOrders: Ref<IOrder[]>
}) {
  // intentionally empty — preconnect o'chirilgan
}
