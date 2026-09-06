<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <OrdersHeader
      :count="orderStore.total"
      :active="showFilter || filterActive"
      @toggle="showFilter = !showFilter"
    />
    <div
      v-if="!isAdmin && unreadCount > 0"
      class="flex justify-end -mt-1"
    >
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 active:scale-95 transition-all"
        @click="markAllAsRead"
      >
        <font-awesome-icon icon="fa-solid fa-check-double" class="text-[10px]" />
        O'qilgan qilish
        <span class="min-w-[1.1rem] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] inline-flex items-center justify-center">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>
    </div>

    <OrdersFilterPanel
      v-if="showFilter"
      v-model="draftKeywords"
      v-model:bot-group-id="draftBotGroupId"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <!-- Buyurtma qidiruvi -->
    <div class="relative">
      <font-awesome-icon
        icon="fa-solid fa-magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none"
      />
      <input
        v-model="orderQuery"
        type="search"
        placeholder="Buyurtma matni qidirish…"
        class="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />
    </div>

    <p
      v-if="orderSearchActive"
      class="text-[12px] font-bold text-slate-400 -mt-2"
    >
      {{ displayOrders.length }}/{{ orderStore.total.toLocaleString('ru-RU') }} ko'rsatildi
    </p>

    <div v-if="filterLoading || (orderStore.isLoading && !orderStore.orders.length)" class="pt-2">
      <OrdersOrderCardSkeleton />
    </div>

    <BaseEmptyState
      v-else-if="!displayOrders.length"
      icon="fa-solid fa-clipboard-list"
      title="Buyurtma topilmadi"
    />

    <DriverOrdersList
      v-else
      v-model:list-root="listRoot"
      v-model:sentinel="sentinel"
      :orders="displayOrders"
      :role="role"
      :active="active"
      :current-user-id="authStore.user?.userId"
      :loading-more="orderStore.isLoadingMore"
      :has-more="orderStore.hasMore"
      :is-order-seen="isOrderSeen"
      :show-read-divider="!isAdmin"
      @unlock="onUnlock"
      @book="onBook"
      @unbook="onUnbook"
      @message="onMessage"
      @message-prefetch="prefetchOrderChat"
      @call="onCall"
      @interest="onInterest"
      @booked-chat="onBookedChat"
      @agent="onAgent"
      @stop-group="onStopGroup"
      @stop-user="onStopUser"
      @restrict-user="onRestrictUser"
      @delete="onDelete"
      @add-to-bot="onAddToBot"
    />

    <DriverOrdersAddToBotDialog
      v-model="showAddToBotDialog"
      :message="addToBotMessage"
      :source-username="sourceGroupUsername"
      :groups="botGroups"
      :loading="addToBotLoading"
      :saving="addToBotSaving"
      @select="selectBotGroup"
      @cancel="cancelAddToBot"
    />

    <BaseConfirmDialog
      v-model="showActionSuccess"
      title="Tayyor"
      :message="actionSuccess"
      confirm-text="OK"
      cancel-text="Yopish"
      variant="success"
      @confirm="showActionSuccess = false"
    />

    <DriverOrdersDialogs
      v-model:show-book-dialog="showBookDialog"
      v-model:show-unbook-dialog="showUnbookDialog"
      v-model:show-no-money-dialog="showNoMoneyDialog"
      v-model:show-block-group-dialog="showBlockGroupDialog"
      v-model:show-block-user-dialog="showBlockUserDialog"
      v-model:show-restrict-user-dialog="showRestrictUserDialog"
      v-model:show-action-error="showActionError"
      v-model:show-interest-dialog="showInterestDialog"
      v-model:interest-dialog="interestDialog"
      :is-admin="isAdmin"
      :book-confirm-message="bookConfirmMessage"
      :booking="booking"
      :unbooking="unbooking"
      :no-money-is-balance="noMoneyIsBalance"
      :no-money-message="noMoneyMessage"
      :block-group-message="blockGroupTarget
        ? `«${blockGroupTarget.group?.title || 'Guruh'}» bloklansinmi?`
        : ''"
      :block-user-message="blockUserTarget
        ? `«${senderLabel(blockUserTarget)}» bloklansinmi?`
        : ''"
      :restrict-user-message="restrictUserTarget
        ? `«${senderLabel(restrictUserTarget)}» guruhdan chiqariladi va buyurtmalari bloklanadi`
        : ''"
      :blocking="blocking"
      :action-error="actionError"
      :interest-users="interestUsers"
      :interest-count="interestCount"
      :interest-loading="interestLoading"
      :current-user-id="authStore.user?.userId"
      @confirm-book="confirmBook"
      @cancel-book="bookTarget = null"
      @confirm-unbook="confirmUnbook"
      @cancel-unbook="unbookTarget = null"
      @no-money-confirm="onNoMoneyConfirm"
      @confirm-block-group="confirmBlockGroup"
      @cancel-block-group="blockGroupTarget = null"
      @confirm-block-user="confirmBlockUser"
      @cancel-block-user="blockUserTarget = null"
      @confirm-restrict-user="confirmRestrictUser"
      @cancel-restrict-user="restrictUserTarget = null"
      @interest-chat="onInterestChat"
      @interest-view="onInterestView"
    />
  </div>
</template>

<script setup lang="ts">
import { useDriverOrdersPage } from '~/composables/orders/useDriverOrdersPage'

definePageMeta({
  layout: 'driver',
})

const {
  authStore,
  orderStore,
  role,
  active,
  isAdmin,
  showFilter,
  draftKeywords,
  draftBotGroupId,
  filterActive,
  filterLoading,
  orderQuery,
  orderSearchActive,
  displayOrders,
  onSaveFilter,
  onCancelFilter,
  sentinel,
  listRoot,
  showBookDialog,
  showUnbookDialog,
  showNoMoneyDialog,
  booking,
  unbooking,
  bookTarget,
  unbookTarget,
  noMoneyMessage,
  noMoneyIsBalance,
  bookConfirmMessage,
  onBook,
  onUnbook,
  confirmBook,
  confirmUnbook,
  onNoMoneyConfirm,
  showInterestDialog,
  interestLoading,
  interestUsers,
  interestCount,
  interestDialog,
  onMessage,
  prefetchOrderChat,
  onCall,
  onInterest,
  onInterestChat,
  onInterestView,
  onBookedChat,
  onAgent,
  showBlockGroupDialog,
  showBlockUserDialog,
  showRestrictUserDialog,
  blockGroupTarget,
  blockUserTarget,
  restrictUserTarget,
  blocking,
  actionError,
  showActionError,
  actionSuccess,
  showActionSuccess,
  senderLabel,
  onStopGroup,
  onStopUser,
  onRestrictUser,
  confirmBlockGroup,
  confirmBlockUser,
  confirmRestrictUser,
  onDelete,
  onUnlock,
  unreadCount,
  isOrderSeen,
  markAllAsRead,
  showAddToBotDialog,
  addToBotMessage,
  sourceGroupUsername,
  botGroups,
  addToBotLoading,
  addToBotSaving,
  onAddToBot,
  cancelAddToBot,
  selectBotGroup,
} = useDriverOrdersPage()
</script>
