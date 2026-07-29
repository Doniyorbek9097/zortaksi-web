<template>
  <!-- Buyurtmalar ro'yxati + infinite scroll sentinel -->
  <div ref="listRootEl" class="relative space-y-6 pt-2">
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
      />
    </div>

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
 * Oddiy ro'yxat + sentinel + skeleton (yuqoridan tushish animatsiyasisz).
 */
defineProps<{
  orders: IOrder[]
  role: string | undefined
  active: boolean
  currentUserId?: string
  loadingMore: boolean
  hasMore: boolean
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
}>()

/** Parent (useOrdersListSync) observerlari uchun — DOM ni v-model ga uzatamiz */
const listRoot = defineModel<HTMLElement | null>('listRoot', { default: null })
const sentinel = defineModel<HTMLElement | null>('sentinel', { default: null })

const listRootEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)

watch(listRootEl, (el) => { listRoot.value = el }, { immediate: true })
watch(sentinelEl, (el) => { sentinel.value = el }, { immediate: true })
</script>
