<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <!-- Header -->
    <OrdersHeader
      :count="orderStore.total"
      :active="showFilter || filterActive"
      @toggle="showFilter = !showFilter"
    />

    <!-- Tabs: Barchasi / Meniki / Boshqalar -->
    <div class="grid grid-cols-3 gap-1.5">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-black border transition-all whitespace-nowrap"
        :class="scope === 'all'
          ? 'border-indigo-400 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        :disabled="scopeLoading || filterLoading"
        @click="setScope('all')"
      >
        <font-awesome-icon icon="fa-solid fa-layer-group" class="text-[10px] shrink-0" />
        Barchasi
        <span
          v-if="allNewCount > 0"
          class="min-w-[1.1rem] h-4 px-1 inline-flex items-center justify-center rounded-full text-[9px] font-black"
          :class="scope === 'all'
            ? 'bg-indigo-500 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
        >
          {{ allNewCount > 99 ? '99+' : allNewCount }}
        </span>
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-black border transition-all whitespace-nowrap"
        :class="scope === 'mine'
          ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        :disabled="scopeLoading || filterLoading"
        @click="setScope('mine')"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px] shrink-0" />
        Meniki
        <span
          v-if="scopeNewCounts.mine > 0"
          class="min-w-[1.1rem] h-4 px-1 inline-flex items-center justify-center rounded-full text-[9px] font-black"
          :class="scope === 'mine'
            ? 'bg-sky-500 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
        >
          {{ scopeNewCounts.mine > 99 ? '99+' : scopeNewCounts.mine }}
        </span>
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-black border transition-all whitespace-nowrap"
        :class="scope === 'others'
          ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        :disabled="scopeLoading || filterLoading"
        @click="setScope('others')"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[10px] shrink-0" />
        Boshqalar
        <span
          v-if="scopeNewCounts.others > 0"
          class="min-w-[1.1rem] h-4 px-1 inline-flex items-center justify-center rounded-full text-[9px] font-black"
          :class="scope === 'others'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
        >
          {{ scopeNewCounts.others > 99 ? '99+' : scopeNewCounts.others }}
        </span>
      </button>
    </div>

    <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug -mt-1">
      {{ scope === 'mine'
        ? "Faqat o'zingiz a'zo bo'lgan guruhlardan buyurtmalar"
        : scope === 'others'
          ? "A'zo bo'lmagan guruhlardan kelgan buyurtmalar"
          : "Meniki va Boshqalar — barcha yangi buyurtmalar" }}
    </p>

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

    <!-- Filter panel -->
    <OrdersFilterPanel
      v-if="showFilter"
      v-model="draftKeywords"
      v-model:bot-group-id="draftBotGroupId"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <!-- Loading (birinchi yuklash, tab yoki filter almashish) -->
    <div v-if="scopeLoading || filterLoading || (orderStore.isLoading && !displayOrders.length)" class="pt-2">
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
      :is-member="isMemberOfOrder"
      :is-order-seen="isOrderSeen"
      :show-read-divider="!isAdmin"
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
      @join-group="onJoinGroup"
      @leave-group="onLeaveGroup"
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
      v-model:show-action-error="showActionError"
      v-model:show-interest-dialog="showInterestDialog"
      v-model:interest-dialog="interestDialog"
      v-model:show-join-dialog="showJoinDialog"
      v-model:show-leave-dialog="showLeaveDialog"
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
      :group-title="groupTitle"
      :membership-group="membershipGroup"
      :join-message="joinMessage"
      :leave-message="leaveMessage"
      :membership-loading="membershipLoading"
      @confirm-book="confirmBook"
      @cancel-book="bookTarget = null"
      @confirm-unbook="confirmUnbook"
      @cancel-unbook="unbookTarget = null"
      @no-money-confirm="onNoMoneyConfirm"
      @confirm-block-group="confirmBlockGroup"
      @cancel-block-group="blockGroupTarget = null"
      @confirm-block-user="confirmBlockUser"
      @cancel-block-user="blockUserTarget = null"
      @interest-chat="onInterestChat"
      @interest-view="onInterestView"
      @confirm-join="confirmJoin"
      @confirm-leave="confirmLeave"
      @cancel-membership="cancelMembership"
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
  draftBotGroupId,
  appliedKeywords,
  filterActive,
  scope,
  scopeLoading,
  filterLoading,
  scopeNewCounts,
  allNewCount,
  setScope,
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
  onCall,
  onInterest,
  onInterestChat,
  onInterestView,
  onBookedChat,
  onAgent,
  showBlockGroupDialog,
  showBlockUserDialog,
  blockGroupTarget,
  blockUserTarget,
  blocking,
  actionError,
  showActionError,
  actionSuccess,
  showActionSuccess,
  senderLabel,
  onStopGroup,
  onStopUser,
  confirmBlockGroup,
  confirmBlockUser,
  onDelete,
  onUnlock,
  showJoinDialog,
  showLeaveDialog,
  membershipLoading,
  joinMessage,
  leaveMessage,
  groupTitle,
  membershipGroup,
  isMemberOfOrder,
  onJoinGroup,
  onLeaveGroup,
  confirmJoin,
  confirmLeave,
  cancelMembership,
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
