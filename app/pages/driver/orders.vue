<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <!-- Header -->
    <OrdersHeader
      :count="orderStore.total"
      :active="showFilter || filterActive"
      @toggle="showFilter = !showFilter"
    />

    <!-- Tanlangan hududlar -->
    <OrdersRegionChips
      :keywords="appliedKeywords"
      @remove="onRemoveRegion"
    />

    <!-- Tabs: Meniki / Boshqalar -->
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="scope === 'mine'
          ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="setScope('mine')"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
        Meniki
      </button>
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="scope === 'others'
          ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="setScope('others')"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[10px]" />
        Boshqalar
      </button>
    </div>

    <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug -mt-1">
      {{ scope === 'mine'
        ? "Faqat o'zingiz a'zo bo'lgan guruhlardan buyurtmalar"
        : "A'zo bo'lmagan guruhlardan kelgan buyurtmalar" }}
    </p>

    <!-- Filter panel -->
    <OrdersFilterPanel
      v-if="showFilter"
      v-model="draftKeywords"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <!-- Loading (birinchi yuklash) -->
    <div v-if="orderStore.isLoading && !displayOrders.length" class="pt-2">
      <OrdersOrderCardSkeleton />
    </div>

    <!-- Empty -->
    <BaseEmptyState
      v-else-if="!displayOrders.length"
      icon="fa-solid fa-clipboard-list"
      title="Buyurtma topilmadi"
    />

    <!-- Orders list -->
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
      @unlock="onUnlock"
      @book="onBook"
      @unbook="onUnbook"
      @message="onMessage"
      @call="onCall"
      @interest="onInterest"
      @booked-chat="onBookedChat"
      @agent="onAgent"
      @stop-group="onStopGroup"
      @stop-user="onStopUser"
      @delete="onDelete"
    />

    <DriverOrdersDialogs
      v-model:show-book-dialog="showBookDialog"
      v-model:show-unbook-dialog="showUnbookDialog"
      v-model:show-no-money-dialog="showNoMoneyDialog"
      v-model:show-block-group-dialog="showBlockGroupDialog"
      v-model:show-block-user-dialog="showBlockUserDialog"
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
      @interest-select="onInterestSelect"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Haydovchi buyurtmalar sahifasi.
 * Mantiq: composables/orders/* — UI bo'laklari: components/driver/orders/*
 */
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
  appliedKeywords,
  filterActive,
  scope,
  setScope,
  displayOrders,
  onSaveFilter,
  onCancelFilter,
  onRemoveRegion,
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
  onCall,
  onInterest,
  onInterestSelect,
  onBookedChat,
  onAgent,
  showBlockGroupDialog,
  showBlockUserDialog,
  blockGroupTarget,
  blockUserTarget,
  blocking,
  actionError,
  showActionError,
  senderLabel,
  onStopGroup,
  onStopUser,
  confirmBlockGroup,
  confirmBlockUser,
  onDelete,
  onUnlock,
} = useDriverOrdersPage()
</script>
