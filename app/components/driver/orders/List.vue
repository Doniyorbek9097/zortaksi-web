<template>
  <!-- Buyurtmalar ro'yxati + infinite scroll sentinel -->
  <div ref="listRootEl" class="relative space-y-6 pt-2">
    <template v-if="showReadDivider">
      <template v-for="order in unreadOrders" :key="`u-${order._id}`">
        <div
          class="order-seen-anchor"
          :data-order-id="order._id"
        >
          <OrdersOrderCard
            :order="order"
            :role="role"
            :active="active"
            :current-user-id="currentUserId"
            :is-member="isMember?.(order) ?? false"
            unread
            @unlock="$emit('unlock')"
            @book="$emit('book', order)"
            @unbook="$emit('unbook', order)"
            @message="$emit('message', order)"
            @call="$emit('call', order)"
            @interest="$emit('interest', order)"
            @booked-chat="$emit('booked-chat', order)"
            @agent="$emit('agent', order)"
            @stop-group="$emit('stop-group', order)"
            @stop-user="$emit('stop-user', order)"
            @delete="$emit('delete', order)"
            @join-group="$emit('join-group', order)"
            @leave-group="$emit('leave-group', order)"
          />
        </div>
      </template>

      <div
        v-if="unreadOrders.length && readOrders.length"
        class="relative py-2"
      >
        <div class="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-700" />
        <p class="relative mx-auto w-fit px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950">
          Pastkilari o'qilganlar
        </p>
      </div>

      <template v-for="order in readOrders" :key="`r-${order._id}`">
        <div
          class="order-seen-anchor"
          :data-order-id="order._id"
        >
          <OrdersOrderCard
            :order="order"
            :role="role"
            :active="active"
            :current-user-id="currentUserId"
            :is-member="isMember?.(order) ?? false"
            :unread="false"
            @unlock="$emit('unlock')"
            @book="$emit('book', order)"
            @unbook="$emit('unbook', order)"
            @message="$emit('message', order)"
            @call="$emit('call', order)"
            @interest="$emit('interest', order)"
            @booked-chat="$emit('booked-chat', order)"
            @agent="$emit('agent', order)"
            @stop-group="$emit('stop-group', order)"
            @stop-user="$emit('stop-user', order)"
            @delete="$emit('delete', order)"
            @join-group="$emit('join-group', order)"
            @leave-group="$emit('leave-group', order)"
          />
        </div>
      </template>
    </template>

    <template v-else>
      <div
        v-for="order in orders"
        :key="order._id"
        class="order-seen-anchor"
        :data-order-id="order._id"
      >
        <OrdersOrderCard
          :order="order"
          :role="role"
          :active="active"
          :current-user-id="currentUserId"
          :is-member="isMember?.(order) ?? false"
          @unlock="$emit('unlock')"
          @book="$emit('book', order)"
          @unbook="$emit('unbook', order)"
          @message="$emit('message', order)"
          @call="$emit('call', order)"
          @interest="$emit('interest', order)"
          @booked-chat="$emit('booked-chat', order)"
          @agent="$emit('agent', order)"
          @stop-group="$emit('stop-group', order)"
          @stop-user="$emit('stop-user', order)"
          @delete="$emit('delete', order)"
          @join-group="$emit('join-group', order)"
          @leave-group="$emit('leave-group', order)"
        />
      </div>
    </template>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinelEl" class="h-1" />

    <!-- Yuklanmoqda (keyingi sahifa) — bitta OrderCard skeleton -->
    <OrdersOrderCardSkeleton v-if="loadingMore" />

    <!-- Oxiri -->
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

/**
 * Haydovchi buyurtmalar ro'yxati.
 * O'qilmaganlar yuqorida, «Pastkilari o'qilganlar» chizigidan keyin o'qilganlar.
 */
const props = defineProps<{
  orders: IOrder[]
  role: string | undefined
  active: boolean
  currentUserId?: string
  loadingMore: boolean
  hasMore: boolean
  isMember?: (order: IOrder) => boolean
  isOrderSeen?: (order: IOrder) => boolean
  /** Haydovchi: o'qilgan/o'qilmagan bo'linishi */
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
  'join-group': [order: IOrder]
  'leave-group': [order: IOrder]
}>()

const seen = (order: IOrder) => props.isOrderSeen?.(order) ?? false

const unreadOrders = computed(() =>
  props.orders.filter((o) => !seen(o)),
)

const readOrders = computed(() =>
  props.orders.filter((o) => seen(o)),
)

/** Parent (useOrdersListSync) observerlari uchun — DOM ni v-model ga uzatamiz */
const listRoot = defineModel<HTMLElement | null>('listRoot', { default: null })
const sentinel = defineModel<HTMLElement | null>('sentinel', { default: null })

const listRootEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)

watch(listRootEl, (el) => { listRoot.value = el }, { immediate: true })
watch(sentinelEl, (el) => { sentinel.value = el }, { immediate: true })
</script>
