<template>
  <!-- Buyurtmalar ro'yxati + infinite scroll sentinel -->
  <div ref="listRootEl" class="relative space-y-6 pt-2">
    <TransitionGroup name="order-drop" tag="div" class="relative space-y-6">
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
    </TransitionGroup>

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
 * TransitionGroup + sentinel + skeleton — sahifadan ajratilgan.
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

<style scoped>
.order-drop-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
/* absolute leave — sahifa balandligini o'zgartirib tabbarni siljitardi; faqat fade */
.order-drop-leave-active {
  transition: opacity 0.2s ease;
  pointer-events: none;
}
.order-drop-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.order-drop-leave-to {
  opacity: 0;
}
.order-drop-move {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
