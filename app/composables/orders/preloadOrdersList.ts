import type { useOrderStore } from '~/stores/order.store'
import { buildOrdersListBootstrapParams } from '~/utils/orderFilterKeywords'

/**
 * Buyurtmalar ro'yxatini fon rejimida yuklash — admin dashboard / layout boot.
 * Filter state ro'yxat sahifasi bilan bir xil bo'ladi (cache mosligi).
 */
export function preloadOrdersList(orderStore: ReturnType<typeof useOrderStore>) {
  if (!import.meta.client) return
  if (orderStore.orders.length > 0 || orderStore.isLoading || orderStore.isLoadingMore) {
    return
  }
  const params = buildOrdersListBootstrapParams()
  orderStore.applyListFilter(params)
  void orderStore.fetchOrders(params)
}
