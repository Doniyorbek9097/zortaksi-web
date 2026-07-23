<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <!-- Header -->
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
        aria-label="Orqaga"
        @click="navigateTo('/admin/dashboard')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">Hisobni to'ldirish</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Haydovchi balansiga qo'shish</p>
      </div>
    </header>

    <div v-if="loading" class="space-y-3">
      <div class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <template v-else-if="driver">
      <!-- Haydovchi info -->
      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3"
      >
        <div
          class="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-500/15 flex items-center justify-center shrink-0"
        >
          <img
            v-if="payAvatarSrc"
            :src="payAvatarSrc"
            :alt="driver.name"
            class="w-full h-full object-cover"
            @error="payAvatarBroken = true"
          >
          <font-awesome-icon v-else icon="fa-solid fa-car" class="text-emerald-500 text-xl" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-base font-black text-slate-900 dark:text-white truncate">{{ driver.name }}</p>
              <p class="text-[12px] font-medium text-slate-400">{{ driver.phone || '—' }}</p>
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
          <p class="mt-2 text-lg font-black text-sky-500">{{ formatMoney(driver.balance) }} so'm</p>
          <p class="text-[11px] font-semibold text-slate-400">
            {{ driver.tariffName ? `${driver.tariffName} · ${driver.expireAt || ''}` : 'Tarif ulanmagan' }}
          </p>
        </div>
      </section>

      <!-- Balansga qo'shish -->
      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Balansga qo'shish
        </p>
        <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Haydovchi so'ragan summani kiriting. Tarifni haydovchi o'zi balansidan ulaydi.
        </p>

        <div class="space-y-1">
          <label class="px-1 text-[11px] font-bold text-slate-400">To'lov summasi (so'm)</label>
          <input
            v-model="amountText"
            type="text"
            inputmode="numeric"
            class="w-full px-3.5 py-3 rounded-xl text-base font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
        </div>

        <div class="flex items-center justify-between text-[12px] font-bold">
          <span class="text-slate-400">To'lovdan keyin balans</span>
          <span class="text-sky-500">{{ formatMoney(balanceAfterCredit) }} so'm</span>
        </div>

        <button
          type="button"
          :disabled="saving || creditAmount <= 0"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="addBalanceOnly"
        >
          <font-awesome-icon :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-wallet'" :class="saving ? 'animate-spin' : ''" />
          Balansga qo'shish — {{ formatMoney(creditAmount) }} so'm
        </button>
      </section>

      <p class="text-center text-[11px] font-medium text-slate-400 leading-relaxed px-2">
        Tarif ulash kerak bo'lsa — Haydovchilar sahifasidagi tarif dialogidan foydalaning.
        Oddiy holatda haydovchi o'zi ulaydi.
      </p>

      <DriverPaymentHistoryList
        v-if="paymentsApiPath"
        ref="historyList"
        :api-path="paymentsApiPath"
        :max-items="30"
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
  </div>
</template>

<script setup lang="ts">
import type { DriverRow } from '~/stores/driver.store'

definePageMeta({ layout: 'admin' })

const route = useRoute()

const userId = computed(() => decodeURIComponent(String(route.params.userId || '')).trim())

const payApiPath = computed(() =>
  userId.value ? `/drivers/pay/${encodeURIComponent(userId.value)}` : ''
)

const paymentsApiPath = computed(() =>
  userId.value ? `/drivers/${encodeURIComponent(userId.value)}/payments` : ''
)

const historyList = ref<{ load: () => Promise<void> } | null>(null)

const driver = ref<(DriverRow & { _id?: string }) | null>(null)
const amountText = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const { avatarUrl } = useMediaUrl()
const payAvatarBroken = ref(false)
watch(driver, () => { payAvatarBroken.value = false })
const payAvatarSrc = computed(() =>
  payAvatarBroken.value
    ? undefined
    : avatarUrl(driver.value?.avatar, driver.value?.id || userId.value)
)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

const creditAmount = computed(() => parseAmount(amountText.value))

const balanceAfterCredit = computed(() => (driver.value?.balance ?? 0) + creditAmount.value)

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
    const driverRes = await useApi(payApiPath.value)
    if (driverRes?.success) {
      driver.value = driverRes.data
    } else {
      error.value = driverRes?.message || 'Haydovchi topilmadi'
    }

    const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN
    if (Number.isFinite(qAmount) && qAmount > 0) {
      amountText.value = formatMoney(qAmount)
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ma\'lumot yuklanmadi'
  } finally {
    loading.value = false
  }
}

const refreshDriver = async () => {
  if (!payApiPath.value) return
  const res = await useApi(payApiPath.value)
  if (res.success) driver.value = res.data
}

const requestMessageId = computed(() => String(route.query.messageId || '').trim())

const addBalanceOnly = async () => {
  if (creditAmount.value <= 0 || !payApiPath.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const body: Record<string, unknown> = {
      creditAmount: creditAmount.value,
      attachTariff: false,
    }
    if (requestMessageId.value) body.messageId = requestMessageId.value

    const res = await useApi(payApiPath.value, {
      method: 'POST',
      body,
    })
    if (res.success) {
      driver.value = res.data
      success.value = `Balansga ${formatMoney(creditAmount.value)} so'm qo'shildi — To'lov muvaffaqiyatli`
      amountText.value = ''
      await refreshDriver()
      await historyList.value?.load()
    } else {
      error.value = res?.message || 'Amal bajarilmadi'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Amal bajarilmadi'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
