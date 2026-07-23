<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-5">
    <!-- Header -->
    <ProfileHeader @bonus="onBonus" />

    <!-- Profile info -->
    <ProfileInfoCard
      :name="user.name"
      :phone="user.phone"
      :avatar="user.avatar"
      :user-id="user.userId"
      :active="user.active"
      :balance="user.balance"
      :tariff-name="user.tariffName"
      @topup="onTopup"
      @buy="onBuyTariff"
    />

    <!-- Accounts -->
    <ProfileSectionCard title="Hisoblar" :badge="`${accountStore.accounts.length}/10`" no-padding>
      <!-- Loading -->
      <div v-if="accountStore.isLoading && !accountStore.accounts.length" class="p-4 space-y-3">
        <div v-for="n in 3" :key="n" class="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!accountStore.accounts.length"
        class="flex flex-col items-center justify-center px-4 py-10 text-center text-slate-400 dark:text-slate-500"
      >
        <font-awesome-icon icon="fa-solid fa-user-plus" class="text-2xl mb-2 opacity-50" />
        <p class="text-[12px] font-medium">Hali qo'shimcha hisob yo'q</p>
      </div>

      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <ProfileAccountItem
          v-for="acc in accountStore.accounts"
          :key="acc.userId"
          :name="accName(acc)"
          :phone="`+${acc.phoneNumber}`"
          :avatar="acc.avatar"
          :user-id="acc.userId"
          :active="String(acc.userId) === String(accountStore.activeUserId || '')"
          :disabled="accountStore.switching"
          @select="onSelectAccount(acc)"
          @delete="requestDeleteAccount(acc)"
        />
      </div>
      <div class="p-3">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-indigo-600 dark:text-indigo-400 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-indigo-500/5 active:scale-[0.98] transition-all"
          @click="onAddAccount"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
          Yangi hisob qo'shish
        </button>
      </div>
    </ProfileSectionCard>

    <!-- Script (Yozuv) -->
    <ProfileSectionCard title="Yozuv" subtitle="Ilova tilini tanlang">
      <ProfileScriptToggle v-model="script" />
    </ProfileSectionCard>

    <!-- Settings -->
    <ProfileSectionCard title="Sozlamalar" no-padding>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <!-- Theme -->
        <ProfileSettingRow
          :icon="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"
          :title="isDark ? `Yorug' rejim` : `Qorong'i rejim`"
          subtitle="Mavzuni almashtirish"
          :color="isDark ? 'amber' : 'violet'"
          clickable
          @click="toggleTheme"
        />

        <!-- Notification sound -->
        <ProfileSettingRow
          icon="fa-solid fa-bell"
          title="Bildirishnoma ovozi"
          :subtitle="soundOn ? 'Ovoz yoqilgan' : `Ovoz o'chirilgan`"
          color="emerald"
        >
          <template #action>
            <BaseToggleSwitch v-model="soundOn" />
          </template>
        </ProfileSettingRow>

        <!-- Contact admin -->
        <ProfileSettingRow
          icon="fa-solid fa-comments"
          title="Admin bilan bog'lanish"
          :subtitle="`@${adminUsername}`"
          color="sky"
          clickable
          @click="onContactAdmin"
        />
      </div>
    </ProfileSectionCard>

    <!-- Hisobni o'chirish tasdig'i -->
    <BaseConfirmDialog
      v-model="showDeleteAccount"
      title="Hisobni o'chirish"
      description="Tinglash to'xtatiladi"
      :message="accountToDelete ? `${accName(accountToDelete)} hisobini o'chirasizmi?` : ''"
      confirm-text="O'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="deletingAccount"
      :close-on-confirm="false"
      @confirm="confirmDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import type { ILocalAccount } from '~/types'
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import type { ScriptType } from '~/components/profile/ScriptToggle.vue'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()
const accountStore = useAccountStore()
const { theme, toggleTheme } = useTheme()

const isDark = computed(() => theme.value === 'dark')

// --- Current user (profile info) ---
const user = computed(() => ({
  name: authStore.user?.firstName || 'Foydalanuvchi',
  phone: authStore.user?.phoneNumber || '',
  avatar: authStore.user?.avatar,
  userId: authStore.user?.userId,
  active: !!authStore.user?.active,
  balance: authStore.user?.balance ?? 0,
  tariffName: authStore.user?.tariff?.name || 'Kunlik sinov',
}))

// --- Accountlar (localStorage) ---
const accName = (acc: ILocalAccount) => {
  const full = [acc.firstName, acc.lastName].filter(Boolean).join(' ').trim()
  return full || acc.username || `+${acc.phoneNumber}`
}

const showDeleteAccount = ref(false)
const accountToDelete = ref<ILocalAccount | null>(null)
const deletingAccount = ref(false)

// --- Settings state ---
const script = ref<ScriptType>('latin')
const { soundOn } = useNotifySound()
const config = useRuntimeConfig()
const adminUsername = computed(() =>
  String(config.public.adminTelegram || 'doniyorbek_ergashev').replace(/^@/, '')
)

// --- Actions ---
const onBonus = () => navigateTo('/driver/bonus')
const onTopup = () => navigateTo('/driver/payment')
const onBuyTariff = () => navigateTo('/driver/payment')

// Accountni almashtirish — soft switch (reload yo'q)
const onSelectAccount = async (acc: ILocalAccount) => {
  if (accountStore.switching) return
  const target = String(acc.userId)
  const active = String(accountStore.activeUserId || '')
  if (target === active && String(authStore.user?.userId || '') === target) return
  await accountStore.switchAccount(target)
}

const requestDeleteAccount = (acc: ILocalAccount) => {
  accountToDelete.value = acc
  showDeleteAccount.value = true
}

const confirmDeleteAccount = async () => {
  if (!accountToDelete.value) return
  deletingAccount.value = true
  await accountStore.removeAccount(accountToDelete.value.userId)
  showDeleteAccount.value = false
  accountToDelete.value = null
  deletingAccount.value = false
}

const onAddAccount = () => navigateTo('/driver/accounts/add')

onMounted(async () => {
  accountStore.load()
  // Cookie/SSR noto'g'ri hisobni yuklagan bo'lsa — localStorage dan tuzatish
  await accountStore.syncFromStorage()
  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* */ }
  }
  accountStore.ensureCurrent(authStore.user)
})

const onContactAdmin = () => {
  if (import.meta.client) window.open(`https://t.me/${adminUsername.value}`, '_blank')
}
</script>
