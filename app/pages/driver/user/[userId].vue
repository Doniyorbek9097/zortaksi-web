<template>
  <AuthSessionGate>
    <ProfileTelegramProfileShell
      :profile="displayProfile"
      :photo-urls="photoUrls"
      :loading="loading"
      :refreshing="refreshing"
      :error="error"
      :tel-href="telHref"
      @back="goBack"
      @message="openChat"
      @call="onCall"
    >
      <template v-if="driver" #extra>
        <section
          v-if="driver.active !== undefined"
          class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center"
        >
          <span
            class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border"
            :class="driver.active
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
              : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50'"
          >
            {{ driver.active ? 'Faol' : 'Faol emas' }}
          </span>
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border"
            :class="driver.listenGroups
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'"
          >
            {{ driver.listenGroups ? 'Guruh tinglovchi' : 'Guruh tinglamaydi' }}
          </span>
          <p v-if="isAdmin" class="ml-auto text-lg font-black text-sky-500">
            {{ formatMoney(driver.balance) }} so'm
          </p>
        </section>

        <DashboardTariffCard
          :name="tariffCard.name"
          :info="tariffCard.info"
          :price="tariffCard.price"
          :expire-days="tariffCard.expireDays"
          :start-date="tariffCard.startDate"
          :end-date="tariffCard.endDate"
          :started-at="tariffCard.startedAt"
          :expire-at="tariffCard.expireAt"
          :active="tariffCard.active"
          :show-buy="isAdmin"
          :inactive-hint="isAdmin"
          @buy="openTariff"
        />

        <DriverProfileInfoGrid
          :assigned-group-title="driver.assignedGroupTitle"
          :region-title="driver.regionTitle"
          :region-slug="driver.regionSlug"
          :registered-at="driver.registeredAt"
          :created-at="driver.createdAt"
          :group-invite-count="driver.groupInviteCount"
          :app-invite-count="driver.appInviteCount"
          :invite-groups="driver.inviteGroups"
        />

        <template v-if="isAdmin">
          <section class="grid grid-cols-1 gap-2">
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all"
              @click="navigateTo(`/admin/pay/${encodeURIComponent(driver.id)}`)"
            >
              <font-awesome-icon icon="fa-solid fa-wallet" />
              Hisobni to'ldirish
            </button>
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
              @click="openTariff"
            >
              <font-awesome-icon icon="fa-solid fa-key" />
              Tarifni yangilash
            </button>
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 active:scale-[0.98] transition-all"
              @click="deleteOpen = true"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
              Hisobni o'chirish
            </button>
          </section>

          <section class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 active:scale-95 transition-all"
              @click="openChat"
            >
              <font-awesome-icon icon="fa-solid fa-comments" />
              Xabar
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 active:scale-95 transition-all disabled:opacity-40"
              :disabled="!telHref"
              @click="onCall"
            >
              <font-awesome-icon icon="fa-solid fa-phone" />
              Qo'ng'iroq
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 active:scale-95 transition-all"
              @click="balanceOpen = true"
            >
              <font-awesome-icon icon="fa-solid fa-coins" />
              Balans
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black active:scale-95 transition-all border"
              :class="driver.active
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'"
              @click="blockOpen = true"
            >
              <font-awesome-icon :icon="driver.active ? 'fa-solid fa-ban' : 'fa-solid fa-circle-check'" />
              {{ driver.active ? 'Blok' : 'Faollashtir' }}
            </button>
            <button
              type="button"
              class="col-span-2 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black active:scale-95 transition-all border disabled:opacity-50"
              :class="driver.listenGroups
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20'"
              :disabled="store.isSaving"
              @click="toggleListenGroups"
            >
              <font-awesome-icon icon="fa-solid fa-headset" />
              {{ driver.listenGroups ? "Guruh tinglashni o'chirish" : 'Guruh tinglashni yoqish' }}
            </button>
          </section>

          <DriverPaymentHistoryList
            v-if="paymentsApiPath"
            :api-path="paymentsApiPath"
            deletable
            subtitle="Shu haydovchi bo'yicha"
          />
        </template>

        <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>
      </template>
    </ProfileTelegramProfileShell>

    <AdminDriversBalanceDialog
      v-if="isAdmin && driver"
      v-model="balanceOpen"
      :name="driver.name || ''"
      :balance="driver.balance ?? 0"
      :loading="store.isSaving"
      @confirm="saveBalance"
      @payment="onPaymentPage"
    />

    <AdminDriversTariffDialog
      v-if="isAdmin"
      v-model="tariffOpen"
      :balance="driver?.balance ?? 0"
      :tariffs="tariffStore.tariffs"
      :loading="store.isSaving"
      @confirm="saveTariff"
    />

    <BaseConfirmDialog
      v-if="isAdmin && driver"
      v-model="blockOpen"
      :title="driver.active ? 'Bloklash' : 'Blokdan chiqarish'"
      :message="driver.active
        ? `«${driver.name}» ni bloklamoqchimisiz?`
        : `«${driver.name}» ni faollashtirmoqchimisiz?`"
      :confirm-text="driver.active ? 'Blokla' : 'Faollashtir'"
      cancel-text="Bekor"
      :variant="driver.active ? 'danger' : 'success'"
      :loading="store.isSaving"
      @confirm="confirmBlock"
    />

    <BaseConfirmDialog
      v-if="isAdmin && driver"
      v-model="deleteOpen"
      title="Hisobni o'chirish"
      description="Qaytarib bo'lmaydi"
      :message="`«${driver.name}» hisobi, chatlar, to'lovlar va barcha bog'liq ma'lumotlar o'chiriladi. Davom etasizmi?`"
      confirm-text="O'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="deleting"
      :close-on-confirm="false"
      @confirm="confirmDelete"
    />
  </AuthSessionGate>
</template>

<script setup lang="ts">
import { useDriverStore } from '~/stores/driver.store'
import { useDriverProfilePage } from '~/composables/useDriverProfilePage'

definePageMeta({ layout: false })

const store = useDriverStore()

const {
  isAdmin,
  profile,
  displayProfile,
  photoUrls,
  loading,
  refreshing,
  error,
  success,
  driver,
  paymentsApiPath,
  telHref,
  tariffCard,
  balanceOpen,
  tariffOpen,
  blockOpen,
  deleteOpen,
  deleting,
  tariffStore,
  formatMoney,
  goBack,
  openChat,
  onCall,
  saveBalance,
  onPaymentPage,
  openTariff,
  saveTariff,
  confirmBlock,
  toggleListenGroups,
  confirmDelete,
} = useDriverProfilePage()
</script>
