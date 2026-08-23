<template>
  <!-- Buyurtmalar ro'yxati — virtual scroll + infinite scroll -->
  <div ref="listRootEl" class="relative pt-2">
    <div :style="{ height: `${virtual.range.paddingTop}px` }" aria-hidden="true" />

    <template v-for="{ row } in virtual.range.visible" :key="row.key">
      <div
        v-if="row.data.type === 'divider'"
        class="relative py-2"
        :style="{ height: `${ORDER_DIVIDER_HEIGHT}px` }"
      >
        <div class="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-700" />
        <p class="relative mx-auto w-fit px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
          Pastkilari o'qilganlar
        </p>
      </div>

      <div
        v-else
        class="order-seen-anchor"
        :data-order-id="row.data.order._id"
        :style="{ height: `${ORDER_ROW_HEIGHT}px` }"
      >
        <OrdersOrderCard
          :order="row.data.order"
          :role="role"
          :active="active"
          :current-user-id="currentUserId"
          :unread="row.data.unread"
          @unlock="$emit('unlock')"
          @book="$emit('book', row.data.order)"
          @unbook="$emit('unbook', row.data.order)"
          @message="$emit('message', row.data.order)"
          @call="$emit('call', row.data.order)"
          @interest="$emit('interest', row.data.order)"
          @booked-chat="$emit('booked-chat', row.data.order)"
          @agent="$emit('agent', row.data.order)"
          @stop-group="$emit('stop-group', row.data.order)"
          @stop-user="$emit('stop-user', row.data.order)"
          @delete="$emit('delete', row.data.order)"
          @add-to-bot="$emit('add-to-bot', row.data.order)"
        />
      </div>
    </template>

    <div :style="{ height: `${virtual.range.paddingBottom}px` }" aria-hidden="true" />

  <div ref="sentinelEl" class="h-1" />

    <OrdersOrderCardSkeleton v-if="loadingMore" />

    <p
      v-else-if="!hasMore && orders.length"
      class="py-4 text-center text-[12px] font-medium text-slate-400 dark:text-slate-600"
    >
      Barcha buyurtmalar ko'rsatildi
    </p>
  </div>
</template>

<script setup lang="ts">
import type { IOrder } from '~/types'
import { ORDER_DIVIDER_HEIGHT, ORDER_ROW_HEIGHT } from '~/utils/memoryBudget'
import { useWindowVirtualRows, type VirtualRow } from '~/composables/useWindowVirtualRows'

type OrderRowData =
  | { type: 'order'; order: IOrder; unread?: boolean }
  | { type: 'divider' }

/**
 * Haydovchi buyurtmalar ro'yxati.
 * Virtual scroll — faqat ko'rinadigan kartalar DOM da (RAM tejash).
 */
const props = defineProps<{
  orders: IOrder[]
  role: string | undefined
  active: boolean
  currentUserId?: string
  loadingMore: boolean
  hasMore: boolean
  isOrderSeen?: (order: IOrder) => boolean
  showReadDivider?: boolean
}>()

defineEmits<{
  unlock: []
  book: [order: IOrder]
  unbook: [order: IOrder]
  message: [order: IOrder]
  call: [order: IOrder]
  interest: [order: IOrder]
  'booked-chat': [order: IOrder]
  agent: [order: IOrder]
  'stop-group': [order: IOrder]
  'stop-user': [order: IOrder]
  delete: [order: IOrder]
  'add-to-bot': [order: IOrder]
}>()

const seen = (order: IOrder) => props.isOrderSeen?.(order) ?? false

const unreadOrders = computed(() => props.orders.filter((o) => !seen(o)))
const readOrders = computed(() => props.orders.filter((o) => seen(o)))

const virtualRows = computed<VirtualRow<OrderRowData>[]>(() => {
  const rows: VirtualRow<OrderRowData>[] = []

  if (props.showReadDivider) {
    for (const order of unreadOrders.value) {
      rows.push({
        key: `u-${order._id}`,
        height: ORDER_ROW_HEIGHT,
        data: { type: 'order', order, unread: true },
      })
    }
    if (unreadOrders.value.length && readOrders.value.length) {
      rows.push({
        key: 'read-divider',
        height: ORDER_DIVIDER_HEIGHT,
        data: { type: 'divider' },
      })
    }
    for (const order of readOrders.value) {
      rows.push({
        key: `r-${order._id}`,
        height: ORDER_ROW_HEIGHT,
        data: { type: 'order', order, unread: false },
      })
    }
  } else {
    for (const order of props.orders) {
      rows.push({
        key: String(order._id),
        height: ORDER_ROW_HEIGHT,
        data: { type: 'order', order, unread: false },
      })
    }
  }

  return rows
})

const virtual = useWindowVirtualRows(virtualRows, 4)

const listRoot = defineModel<HTMLElement | null>('listRoot', { default: null })
const sentinel = defineModel<HTMLElement | null>('sentinel', { default: null })

const listRootEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)

watch(listRootEl, (el) => { listRoot.value = el }, { immediate: true })
watch(sentinelEl, (el) => { sentinel.value = el }, { immediate: true })
</script>
