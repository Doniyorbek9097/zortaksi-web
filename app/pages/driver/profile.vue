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
      <p
        v-if="switchError"
        class="mx-3 mb-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[12px] font-bold text-center"
      >
        {{ switchError }}
      </p>
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
    <ProfileSectionCard title="Yozuv" subtitle="Lotin yoki Kirill">
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

        <!-- Media kesh (IndexedDB) -->
        <ProfileSettingRow
          icon="fa-solid fa-image"
          title="Media kesh"
          :subtitle="cacheSubtitle"
          color="slate"
          clickable
          :disabled="clearingCache"
          @click="onClearMediaCache"
        >
          <template #action>
            <span
              class="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500"
              :class="clearingCache ? 'opacity-50' : ''"
              title="Keshni tozalash"
            >
              <font-awesome-icon
                :icon="clearingCache ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'"
                :class="clearingCache ? 'animate-spin' : ''"
              />
            </span>
          </template>
        </ProfileSettingRow>
        <p class="px-4 pb-1 text-[11px] leading-snug text-slate-400 dark:text-slate-500">
          Ovoz va rasm qurilmada saqlanadi — keyingi ochish tezroq. Login saqlanadi; brauzer «barcha ma'lumotlar» tozalasa qayta kirish kerak.
        </p>

        <!-- Contact admin -->
        <ProfileSettingRow
          icon="fa-solid fa-comments"
          title="Admin bilan bog'lanish"
          :subtitle="`@${adminUsername}`"
          color="sky"
          clickable
          @click="onContactAdmin"
        />

        <ProfileSettingRow
          icon="fa-solid fa-clipboard-list"
          title="Foydalanish shartlari"
          subtitle="Xizmatdan foydalanish qoidalari"
          color="amber"
          clickable
          @click="navigateTo('/terms')"
        />

        <ProfileSettingRow
          icon="fa-solid fa-shield-alt"
          title="Maxfiylik siyosati"
          subtitle="Ma'lumotlaringiz qanday ishlatiladi"
          color="violet"
          clickable
          @click="navigateTo('/privacy')"
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
import { resolveHomePath } from '~/utils/userRole'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()
const accountStore = useAccountStore()
const { theme, toggleTheme } = useTheme()
const { script } = useAppScript()

const isDark = computed(() => theme.value === 'dark')

// --- Current user (profile info) ---
const user = computed(() => ({
  name: authStore.user?.firstName || 'Foydalanuvchi',
  phone: authStore.user?.phoneNumber || '',
  avatar: authStore.user?.avatar,
  userId: authStore.user?.userId,
  active: authStore.tariffActive,
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
const { soundOn } = useNotifySound()
const config = useRuntimeConfig()
const adminUsername = computed(() =>
  String(config.public.adminTelegram || 'zortaksi_admin').replace(/^@/, '')
)

// --- Actions ---
const onBonus = () => navigateTo('/driver/bonus')
const onTopup = () => navigateTo('/driver/payment?tab=topup')
const onBuyTariff = () => navigateTo('/driver/payment')

const switchError = ref('')

// Accountni almashtirish
const onSelectAccount = async (acc: ILocalAccount) => {
  if (accountStore.switching) return
  switchError.value = ''
  const target = String(acc.userId)
  const active = String(accountStore.activeUserId || '')
  if (target === active && String(authStore.user?.userId || '') === target) {
    await navigateTo(resolveHomePath(authStore.user))
    return
  }
  if (!acc.token) {
    switchError.value = 'Bu hisob sessiyasi eskirgan. Qayta login qiling (hisob qo\'shish).'
    return
  }
  const ok = await accountStore.switchAccount(target)
  if (!ok) {
    switchError.value =
      'Hisobga o\'tib bo\'lmadi. Token eskirgan bo\'lishi mumkin — «Yangi hisob qo\'shish» orqali qayta kiring.'
  }
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

const onContactAdmin = () => {
  if (import.meta.client) window.open(`https://t.me/${adminUsername.value}`, '_blank')
}

// --- Media IndexedDB kesh ---
const { clearDeviceCache, getCacheStats } = useChatMedia()
const clearingCache = ref(false)
const cacheInfo = ref({ count: 0, bytes: 0 })

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const cacheSubtitle = computed(() => {
  if (clearingCache.value) return 'Tozalanmoqda...'
  if (!cacheInfo.value.count) return 'Ovoz va rasmlar IndexedDB da'
  return `${cacheInfo.value.count} ta fayl · ${formatBytes(cacheInfo.value.bytes)}`
})

const refreshCacheStats = async () => {
  if (!import.meta.client) return
  cacheInfo.value = await getCacheStats()
}

const onClearMediaCache = async () => {
  if (clearingCache.value) return
  clearingCache.value = true
  try {
    await clearDeviceCache()
    cacheInfo.value = { count: 0, bytes: 0 }
    await refreshCacheStats()
  } catch (e) {
    console.error('Kesh tozalash xato:', e)
  } finally {
    clearingCache.value = false
  }
}

onMounted(async () => {
  accountStore.load()
  await accountStore.syncFromStorage()
  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* */ }
  }
  // Faqat joriy user — boshqa hisob tokenlarini buzmasin
  if (authStore.user) accountStore.ensureCurrent(authStore.user)
  void refreshCacheStats()
})

usePullToRefresh(async () => {
  await authStore.getMe().catch(() => {})
  accountStore.load()
  await accountStore.syncFromStorage()
  if (authStore.user) accountStore.ensureCurrent(authStore.user)
  await refreshCacheStats()
})
</script>
