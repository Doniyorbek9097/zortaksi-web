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
        <h1 class="text-base font-black text-slate-900 dark:text-white">To'lov qilish</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Balans + tarif faollashtirish
        </p>
      </div>
    </header>

    <div v-if="loading" class="space-y-3">
      <div class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
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
          Haydovchi so'ragan summani kiriting (ixtiyoriy — faqat tarif ulash ham mumkin).
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
          Faqat balansga qo'shish — {{ formatMoney(creditAmount) }} so'm
        </button>
      </section>

      <!-- Tarif faollashtirish -->
      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Tarif faollashtirish
        </p>
        <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Kerakli tarifni tanlang. Istasangiz balansdan narxini yechib, yoki yuqoridagi summa bilan birga ulang.
        </p>

        <div class="space-y-2">
          <button
            v-for="t in tariffs"
            :key="t.id"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors"
            :class="selectedTariffId === t.id
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
            @click="selectedTariffId = t.id"
          >
            <span
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedTariffId === t.id ? 'border-violet-500' : 'border-slate-300 dark:border-slate-600'"
            >
              <span
                v-if="selectedTariffId === t.id"
                class="w-2.5 h-2.5 rounded-full bg-violet-500"
              />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-black text-slate-900 dark:text-white">{{ t.name }}</span>
              <span class="text-[11px] font-medium text-slate-400">
                {{ t.info || `${t.expireDays} kun` }}
                <template v-if="t.info"> · {{ t.expireDays }} kun</template>
              </span>
            </span>
            <span class="text-sm font-black text-sky-500 shrink-0">
              {{ formatMoney(t.price) }}
            </span>
          </button>

          <p v-if="!tariffs.length" class="py-3 text-center text-[12px] text-slate-400">
            Avval tarif yarating (Admin → Tariflar)
          </p>
        </div>

        <label class="flex items-start gap-3 cursor-pointer select-none">
          <input
            v-model="deductTariff"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          >
          <span>
            <span class="block text-sm font-black text-slate-900 dark:text-white">
              Balansdan tarif narxini yechish
            </span>
            <span class="text-[11px] font-medium text-slate-400">
              Yetarli bo'lmasa ham minusga tushadi
            </span>
          </span>
        </label>

        <div class="grid grid-cols-1 gap-2">
          <button
            type="button"
            :disabled="saving || !selectedTariffId"
            class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            @click="attachTariffOnly"
          >
            <font-awesome-icon :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-key'" :class="saving ? 'animate-spin' : ''" />
            Faqat tarifni ulash
            <template v-if="selectedTariff">
              — {{ selectedTariff.name }}
            </template>
          </button>

          <button
            type="button"
            :disabled="saving || !selectedTariffId || creditAmount <= 0"
            class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            @click="creditAndAttachTariff"
          >
            <font-awesome-icon :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-circle-check'" :class="saving ? 'animate-spin' : ''" />
            To'lov + tarif ulash
            <template v-if="creditAmount > 0">
              ({{ formatMoney(creditAmount) }})
            </template>
          </button>
        </div>
      </section>

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
import { useTariffStore } from '~/stores/tariff.store'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const tariffStore = useTariffStore()

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
const selectedTariffId = ref<string | null>(null)
const deductTariff = ref(true)
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

const tariffs = computed(() => tariffStore.tariffs)
const selectedTariff = computed(() =>
  tariffs.value.find((t) => t.id === selectedTariffId.value) || null
)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

const creditAmount = computed(() => parseAmount(amountText.value))

const balanceAfterCredit = computed(() => (driver.value?.balance ?? 0) + creditAmount.value)

const requestMessageId = computed(() => String(route.query.messageId || '').trim())

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
    const [driverRes] = await Promise.all([
      useApi(payApiPath.value),
      tariffStore.fetchTariffs().catch(() => null),
    ])
    if (driverRes?.success) {
      driver.value = driverRes.data
    } else {
      error.value = driverRes?.message || 'Haydovchi topilmadi'
    }

    if (!selectedTariffId.value && tariffs.value.length) {
      selectedTariffId.value = tariffs.value[0].id
    }

    const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN
    if (Number.isFinite(qAmount) && qAmount > 0) {
      amountText.value = formatMoney(qAmount)
    }

    const qTariff = String(route.query.tariffId || '').trim()
    if (qTariff) selectedTariffId.value = qTariff
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

const postPay = async (body: Record<string, unknown>, okMessage: string) => {
  if (!payApiPath.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    if (requestMessageId.value && Number(body.creditAmount || 0) > 0) {
      body.messageId = requestMessageId.value
    }
    const res = await useApi(payApiPath.value, { method: 'POST', body })
    if (res.success) {
      driver.value = res.data
      success.value = okMessage
      if (Number(body.creditAmount || 0) > 0) amountText.value = ''
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

const addBalanceOnly = async () => {
  if (creditAmount.value <= 0) return
  await postPay(
    { creditAmount: creditAmount.value, attachTariff: false },
    `Balansga ${formatMoney(creditAmount.value)} so'm qo'shildi — To'lov muvaffaqiyatli`
  )
}

const attachTariffOnly = async () => {
  if (!selectedTariffId.value) return
  const name = selectedTariff.value?.name || 'Tarif'
  await postPay(
    {
      attachTariff: true,
      tariffId: selectedTariffId.value,
      deductTariff: deductTariff.value,
    },
    `${name} faollashtirildi`
  )
}

const creditAndAttachTariff = async () => {
  if (!selectedTariffId.value || creditAmount.value <= 0) return
  const name = selectedTariff.value?.name || 'Tarif'
  await postPay(
    {
      creditAmount: creditAmount.value,
      attachTariff: true,
      tariffId: selectedTariffId.value,
      deductTariff: deductTariff.value,
    },
    `${formatMoney(creditAmount.value)} so'm qo'shildi va ${name} ulandi`
  )
}

onMounted(load)
</script>
