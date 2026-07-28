<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header
      class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
    >
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
        aria-label="Orqaga"
        @click="goBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none min-w-0">
        <h1 class="text-base font-black text-slate-900 dark:text-white truncate">Haydovchi</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Profil va boshqaruv
        </p>
      </div>
    </header>

    <div v-if="loading" class="space-y-3">
      <div class="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <template v-else-if="driver">
      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3"
      >
        <div
          class="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-500/15 flex items-center justify-center shrink-0"
        >
          <img
            v-if="avatarSrc"
            :src="avatarSrc"
            :alt="driver.name"
            class="w-full h-full object-cover"
            @error="avatarBroken = true"
          >
          <font-awesome-icon v-else icon="fa-solid fa-car" class="text-emerald-500 text-xl" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-base font-black text-slate-900 dark:text-white truncate">
                {{ driver.name }}
              </p>
              <p class="text-[12px] font-medium text-slate-400">
                {{ driver.phone || '—' }}
              </p>
              <p
                v-if="driver.username"
                class="text-[11px] font-semibold text-sky-500 truncate"
              >
                @{{ driver.username }}
              </p>
            </div>
            <span
              class="shrink-0 inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border"
              :class="driver.active
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50'"
            >
              {{ driver.active ? 'Faol' : 'Faol emas' }}
            </span>
          </div>
          <p class="mt-2 text-lg font-black text-sky-500">
            {{ formatMoney(driver.balance) }} so'm
          </p>
          <p class="text-[11px] font-semibold text-slate-400">
            {{ tariffLine }}
          </p>
        </div>
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
          :disabled="!driver.phone"
          @click="onCall"
        >
          <font-awesome-icon icon="fa-solid fa-phone" />
          Qo'ng'iroq
        </button>
      </section>

      <section class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 active:scale-95 transition-all"
          @click="balanceOpen = true"
        >
          <font-awesome-icon icon="fa-solid fa-wallet" />
          Balans
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 active:scale-95 transition-all"
          @click="openTariff"
        >
          <font-awesome-icon icon="fa-solid fa-key" />
          Tarif
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 active:scale-95 transition-all"
          @click="navigateTo(`/admin/pay/${encodeURIComponent(driver.id)}`)"
        >
          <font-awesome-icon icon="fa-solid fa-credit-card" />
          To'lov
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
      </section>

      <DriverPaymentHistoryList
        v-if="paymentsApiPath"
        :api-path="paymentsApiPath"
        :max-items="20"
        subtitle="Shu haydovchi bo'yicha"
      />
    </template>

    <BaseEmptyState
      v-else-if="!loading"
      icon="fa-solid fa-user-slash"
      title="Haydovchi topilmadi"
    />

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>

    <AdminDriversBalanceDialog
      v-model="balanceOpen"
      :name="driver?.name || ''"
      :balance="driver?.balance ?? 0"
      :loading="store.isSaving"
      @confirm="saveBalance"
      @payment="onPaymentPage"
    />

    <AdminDriversTariffDialog
      v-model="tariffOpen"
      :balance="driver?.balance ?? 0"
      :tariffs="tariffStore.tariffs"
      :loading="store.isSaving"
      @confirm="saveTariff"
    />
    <BaseConfirmDialog
      v-model="blockOpen"
      :title="driver?.active ? 'Bloklash' : 'Blokdan chiqarish'"
      :message="driver
        ? driver.active
          ? `«${driver.name}» ni bloklamoqchimisiz?`
          : `«${driver.name}» ni faollashtirmoqchimisiz?`
        : ''"
      :confirm-text="driver?.active ? 'Blokla' : 'Faollashtir'"
      cancel-text="Bekor"
      :variant="driver?.active ? 'danger' : 'success'"
      :loading="store.isSaving"
      @confirm="confirmBlock"
    />
  </div>
</template>

<script setup lang="ts">
import type { DriverRow } from '~/stores/driver.store'
import { useDriverStore } from '~/stores/driver.store'
import { useTariffStore } from '~/stores/tariff.store'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const store = useDriverStore()
const tariffStore = useTariffStore()

const userId = computed(() => decodeURIComponent(String(route.params.userId || '')).trim())
const payApiPath = computed(() =>
  userId.value ? `/drivers/pay/${encodeURIComponent(userId.value)}` : ''
)
const paymentsApiPath = computed(() =>
  userId.value ? `/drivers/${encodeURIComponent(userId.value)}/payments` : ''
)

const driver = ref<(DriverRow & { _id?: string }) | null>(null)
const loading = ref(true)
const error = ref('')
const success = ref('')
const balanceOpen = ref(false)
const tariffOpen = ref(false)
const blockOpen = ref(false)

const { avatarUrl } = useMediaUrl()
const avatarBroken = ref(false)
watch(driver, () => { avatarBroken.value = false })
const avatarSrc = computed(() =>
  avatarBroken.value
    ? undefined
    : avatarUrl(driver.value?.avatar, driver.value?.id || userId.value)
)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const tariffLine = computed(() => {
  const d = driver.value
  if (!d?.tariffName) return 'Tarif ulanmagan'
  const days =
    d.daysLeft == null
      ? ''
      : d.daysLeft < 0
        ? '(muddati o\'tgan)'
        : `(${d.daysLeft} kun)`
  return `${d.tariffName}${d.expireAt ? ` · ${d.expireAt}` : ''} ${days}`.trim()
})

const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else navigateTo('/admin/drivers')
}

const load = async () => {
  loading.value = true
  error.value = ''
  driver.value = null
  if (!payApiPath.value) {
    error.value = 'Haydovchi ID yo\'q'
    loading.value = false
    return
  }
  try {
    const res = await useApi(payApiPath.value)
    if (res?.success) driver.value = res.data
    else error.value = res?.message || 'Haydovchi topilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ma\'lumot yuklanmadi'
  } finally {
    loading.value = false
  }
}

const openChat = async () => {
  if (!driver.value) return
  error.value = ''
  try {
    const res = await useApi('/chats/support', {
      method: 'POST',
      body: { driverUserId: driver.value.id },
    })
    if (res.success && res.data?._id) {
      await navigateTo({
        path: `/driver/chat/${res.data._id}`,
        query: { name: driver.value.name || 'Haydovchi', support: '1' },
      })
      return
    }
    error.value = res.message || 'Chat ochilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Chat ochilmadi'
  }
}

const onCall = () => {
  const phone = driver.value?.phone
  if (import.meta.client && phone) {
    window.location.href = `tel:+${phone.replace(/\D/g, '')}`
  }
}

const saveBalance = async (amount: number) => {
  if (!driver.value) return
  error.value = ''
  success.value = ''
  try {
    await store.adjustBalance(driver.value.id, amount)
    balanceOpen.value = false
    success.value = 'Balans yangilandi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Balans saqlanmadi'
  }
}

const onPaymentPage = () => {
  if (driver.value?.id) navigateTo(`/admin/pay/${encodeURIComponent(driver.value.id)}`)
}

const openTariff = async () => {
  tariffOpen.value = true
  if (!tariffStore.tariffs.length) {
    try {
      await tariffStore.fetchTariffs()
    } catch { /* */ }
  }
}

const saveTariff = async (payload: { tariffId: string; deductFromBalance: boolean }) => {
  if (!driver.value) return
  error.value = ''
  success.value = ''
  try {
    await store.assignTariff(driver.value.id, payload.tariffId, {
      deductFromBalance: payload.deductFromBalance,
    })
    tariffOpen.value = false
    success.value = 'Tarif yangilandi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Tarif biriktirilmadi'
  }
}

const confirmBlock = async () => {
  if (!driver.value) return
  error.value = ''
  success.value = ''
  try {
    await store.setActive(driver.value.id, !driver.value.active)
    blockOpen.value = false
    success.value = driver.value.active ? 'Bloklandi' : 'Faollashtirildi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Saqlanmadi'
  }
}

watch(userId, () => { void load() }, { immediate: true })
</script>
