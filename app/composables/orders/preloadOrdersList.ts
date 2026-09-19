import type { useOrderStore } from '~/stores/order.store'
import { buildOrdersListBootstrapParams } from '~/utils/orderFilterKeywords'

/**
 * Buyurtmalar ro'yxatini fon rejimida yuklash — admin dashboard / layout boot.
 * Filter state ro'yxat sahifasi bilan bir xil bo'ladi (cache mosligi).
 */
export function preloadOrdersList(orderStore: ReturnType<typeof useOrderStore>) {
  if (!import.meta.client) return
  const params = buildOrdersListBootstrapParams()
  // Bo'sh kesh — sahifada qayta urinish kerak (noto'g'ri filtr / iltimos)
  if (orderStore.isOrdersListFresh(params) && orderStore.orders.length > 0) return
  orderStore.applyListFilter(params)
  void orderStore.fetchOrders({ page: 1, ...params }, { silent: true })
}
