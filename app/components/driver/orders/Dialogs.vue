<template>
  <!-- Band / blok / xato / qiziqish dialoglari -->
  <div>
    <!-- Band qilish tasdiqlash -->
    <BaseConfirmDialog
      v-model="showBookDialog"
      title="Band qilish"
      :description="isAdmin ? 'Admin uchun bepul' : 'Hisobdan pul yechiladi'"
      :message="bookConfirmMessage"
      confirm-text="Band qilish"
      cancel-text="Bekor"
      variant="success"
      :loading="booking"
      :close-on-confirm="false"
      @confirm="$emit('confirm-book')"
      @cancel="$emit('cancel-book')"
    />

    <!-- Band bekor qilish (pul qaytarilmaydi) -->
    <BaseConfirmDialog
      v-model="showUnbookDialog"
      title="Band bekor qilish"
      description="Yechilgan pul qaytarilmaydi"
      message="Bandni bekor qilasizmi? Buyurtma yana ochiladi, lekin hisobdan olingan pul qaytmaydi."
      confirm-text="Bekor qilish"
      cancel-text="Yo'q"
      variant="warning"
      :loading="unbooking"
      :close-on-confirm="false"
      @confirm="$emit('confirm-unbook')"
      @cancel="$emit('cancel-unbook')"
    />

    <!-- Pul yo'q / xato -->
    <BaseConfirmDialog
      v-model="showNoMoneyDialog"
      :title="noMoneyIsBalance ? 'Pul yo\'q' : 'Xatolik'"
      :description="noMoneyIsBalance ? 'Balans yetarli emas' : undefined"
      :message="noMoneyMessage"
      :confirm-text="noMoneyIsBalance ? 'Hisob to\'ldirish' : 'OK'"
      :cancel-text="noMoneyIsBalance ? 'Yopish' : 'Yopish'"
      variant="warning"
      @confirm="$emit('no-money-confirm')"
    />

    <!-- Guruhni bloklash -->
    <BaseConfirmDialog
      v-model="showBlockGroupDialog"
      title="Guruhni bloklash"
      description="Bu guruhdan boshqa buyurtma olinmaydi"
      :message="blockGroupMessage"
      confirm-text="Bloklash"
      cancel-text="Bekor"
      variant="danger"
      :loading="blocking"
      :close-on-confirm="false"
      @confirm="$emit('confirm-block-group')"
      @cancel="$emit('cancel-block-group')"
    />

    <!-- Senderni bloklash -->
    <BaseConfirmDialog
      v-model="showBlockUserDialog"
      title="Foydalanuvchini bloklash"
      description="Bu userdan boshqa buyurtma olinmaydi"
      :message="blockUserMessage"
      confirm-text="Bloklash"
      cancel-text="Bekor"
      variant="danger"
      :loading="blocking"
      :close-on-confirm="false"
      @confirm="$emit('confirm-block-user')"
      @cancel="$emit('cancel-block-user')"
    />

    <!-- Ban qilish (guruhdan chiqarish) -->
    <BaseConfirmDialog
      v-model="showRestrictUserDialog"
      title="Ban qilish"
      description="Guruhdan chiqariladi va buyurtmalar bloklanadi"
      :message="restrictUserMessage"
      confirm-text="Ban qilish"
      cancel-text="Bekor"
      variant="danger"
      :loading="blocking"
      :close-on-confirm="false"
      @confirm="$emit('confirm-restrict-user')"
      @cancel="$emit('cancel-restrict-user')"
    />

    <!-- Amal xatosi -->
    <BaseConfirmDialog
      v-model="showActionError"
      title="Xatolik"
      :message="actionError"
      confirm-text="OK"
      cancel-text="Yopish"
      variant="warning"
      @confirm="showActionError = false"
    />

    <!-- Qiziqqanlar ro'yxati -->
    <OrdersInterestListDialog
      ref="interestDialogEl"
      v-model="showInterestDialog"
      :users="interestUsers"
      :count="interestCount"
      :loading="interestLoading"
      :current-user-id="currentUserId"
      @chat="$emit('interest-chat', $event)"
      @view="$emit('interest-view', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { IInterestedUser } from '~/types'

/**
 * Buyurtmalar sahifasidagi barcha tasdiqlash/xato dialoglari.
 * Holat parent (composable) dan v-model orqali keladi.
 */
defineProps<{
  isAdmin: boolean
  bookConfirmMessage: string
  booking: boolean
  unbooking: boolean
  noMoneyIsBalance: boolean
  noMoneyMessage: string
  blockGroupMessage: string
  blockUserMessage: string
  restrictUserMessage: string
  blocking: boolean
  actionError: string
  interestUsers: IInterestedUser[]
  interestCount: number
  interestLoading: boolean
  currentUserId?: string
}>()

defineEmits<{
  'confirm-book': []
  'cancel-book': []
  'confirm-unbook': []
  'cancel-unbook': []
  'no-money-confirm': []
  'confirm-block-group': []
  'cancel-block-group': []
  'confirm-block-user': []
  'cancel-block-user': []
  'confirm-restrict-user': []
  'cancel-restrict-user': []
  'interest-chat': [user: IInterestedUser]
  'interest-view': [user: IInterestedUser]
}>()

const showBookDialog = defineModel<boolean>('showBookDialog', { required: true })
const showUnbookDialog = defineModel<boolean>('showUnbookDialog', { required: true })
const showNoMoneyDialog = defineModel<boolean>('showNoMoneyDialog', { required: true })
const showBlockGroupDialog = defineModel<boolean>('showBlockGroupDialog', { required: true })
const showBlockUserDialog = defineModel<boolean>('showBlockUserDialog', { required: true })
const showRestrictUserDialog = defineModel<boolean>('showRestrictUserDialog', { required: true })
const showActionError = defineModel<boolean>('showActionError', { required: true })
const showInterestDialog = defineModel<boolean>('showInterestDialog', { required: true })

/** Qiziqish dialogi — parent composable close/resetOpening chaqiradi */
const interestDialog = defineModel<{
  resetOpening: (err?: string) => void
  close: () => void
  closeForNavigate?: () => void
} | null>('interestDialog', {
  default: null,
})

const interestDialogEl = ref<{
  resetOpening: (err?: string) => void
  close: () => void
  closeForNavigate?: () => void
} | null>(null)

watch(interestDialogEl, (v) => {
  interestDialog.value = v
}, { immediate: true })
</script>
