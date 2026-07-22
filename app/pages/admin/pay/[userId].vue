<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28 space-y-4">
    <!-- Header -->
    <header class="flex items-center gap-3">
      <button
        type="button"
        class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
        aria-label="Orqaga"
        @click="navigateTo('/admin/dashboard')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div>
        <h1 class="text-xl font-black text-slate-900 dark:text-white">To'lov qilish</h1>
        <p class="text-[13px] font-semibold text-slate-400 dark:text-slate-500">Haydovchi hisobi</p>
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
            v-if="driver.avatar"
            :src="driver.avatar"
            :alt="driver.name"
            class="w-full h-full object-cover"
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
          Foydalanuvchi yuborgan summani qo'lda kiriting. Tarif tanlash shart emas.
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

      <!-- Tarif tanlash -->
      <section class="space-y-3">
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 px-1">Tarif</p>

        <div class="space-y-2">
          <button
            v-for="t in tariffStore.tariffs"
            :key="t.id"
            type="button"
            class="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border text-left transition-all bg-white dark:bg-slate-900"
            :class="selectedTariffId === t.id
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40'
              : 'border-slate-200 dark:border-slate-800'"
            @click="selectedTariffId = t.id"
          >
            <span
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedTariffId === t.id ? 'border-violet-500' : 'border-slate-300 dark:border-slate-600'"
            >
              <span v-if="selectedTariffId === t.id" class="w-2.5 h-2.5 rounded-full bg-violet-500" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-black text-slate-900 dark:text-white">{{ t.name }}</span>
              <span class="text-[11px] font-medium text-slate-400">
                {{ t.info || `${t.expireDays} kun` }}
                <template v-if="t.info"> · {{ t.expireDays }} kun</template>
              </span>
            </span>
            <span class="text-sm font-black text-sky-500 shrink-0">{{ formatMoney(t.price) }}</span>
          </button>

          <p v-if="!tariffStore.tariffs.length" class="py-4 text-center text-[12px] text-slate-400">
            Tariflar topilmadi
          </p>
        </div>
      </section>

      <!-- Tarif bilan birga -->
      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
      >
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          Tarif bilan birga
        </p>

        <label class="flex items-start gap-3 cursor-pointer select-none">
          <input
            v-model="attachTariff"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          >
          <span>
            <span class="block text-sm font-black text-slate-900 dark:text-white">Tarifni ulash</span>
            <span class="text-[11px] font-medium text-slate-400">
              {{ selectedTariff ? `${selectedTariff.name} — ${formatMoney(selectedTariff.price)} so'm` : 'Tarif tanlang' }}
            </span>
          </span>
        </label>

        <label class="flex items-start gap-3 cursor-pointer select-none">
          <input
            v-model="deductTariff"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          >
          <span class="block text-sm font-black text-slate-900 dark:text-white">
            Balansdan tarif narxini yechish
          </span>
        </label>

        <div class="space-y-1.5 pt-1 text-[12px] font-bold">
          <div class="flex justify-between">
            <span class="text-slate-400">To'lovdan keyin balans</span>
            <span class="text-sky-500">{{ formatMoney(balanceAfterCredit) }} so'm</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Tarifdan keyin</span>
            <span class="text-emerald-500">{{ formatMoney(balanceAfterTariff) }} so'm</span>
          </div>
        </div>

        <button
          type="button"
          :disabled="saving || creditAmount <= 0 || !attachTariff || !selectedTariff"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="payAndAttach"
        >
          <font-awesome-icon :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-wallet'" :class="saving ? 'animate-spin' : ''" />
          To'lov + ulash
        </button>

        <button
          type="button"
          :disabled="saving || !selectedTariff"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-violet-600 dark:text-violet-400 border-2 border-violet-400/60 bg-white dark:bg-slate-950 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="attachOnly"
        >
          <font-awesome-icon :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-key'" :class="saving ? 'animate-spin' : ''" />
          Faqat tarifni ulash
        </button>
      </section>
    </template>

    <p v-else-if="!loading" class="py-10 text-center text-sm font-bold text-slate-400">
      Haydovchi topilmadi
    </p>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import type { TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'
import type { DriverRow } from '~/stores/driver.store'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const tariffStore = useTariffStore()

const userId = computed(() => String(route.params.userId || ''))

const driver = ref<(DriverRow & { _id?: string }) | null>(null)
const selectedTariffId = ref<string | null>(null)
const amountText = ref('')
const attachTariff = ref(true)
const deductTariff = ref(true)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

const creditAmount = computed(() => parseAmount(amountText.value))

const selectedTariff = computed(() =>
  tariffStore.tariffs.find(t => t.id === selectedTariffId.value) || null
)

const balanceAfterCredit = computed(() => (driver.value?.balance ?? 0) + creditAmount.value)

const balanceAfterTariff = computed(() => {
  let bal = balanceAfterCredit.value
  if (attachTariff.value && deductTariff.value && selectedTariff.value) {
    bal -= selectedTariff.value.price
  }
  return bal
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [driverRes] = await Promise.all([
      useApi(`/drivers/pay/${userId.value}`),
      tariffStore.tariffs.length ? Promise.resolve(null) : tariffStore.fetchTariffs(),
    ])
    if (driverRes.success) driver.value = driverRes.data

    const qTariff = String(route.query.tariffId || '')
    const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN

    if (qTariff && tariffStore.tariffs.some(t => t.id === qTariff)) {
      selectedTariffId.value = qTariff
    } else if (tariffStore.tariffs[0]) {
      selectedTariffId.value = tariffStore.tariffs[0].id
    }

    if (Number.isFinite(qAmount) && qAmount > 0) {
      amountText.value = formatMoney(qAmount)
    } else if (selectedTariff.value) {
      amountText.value = formatMoney(selectedTariff.value.price)
    }

    attachTariff.value = true
    deductTariff.value = true
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ma\'lumot yuklanmadi'
  } finally {
    loading.value = false
  }
}

const refreshDriver = async () => {
  const res = await useApi(`/drivers/pay/${userId.value}`)
  if (res.success) driver.value = res.data
}

const run = async (body: Record<string, unknown>, okMsg: string) => {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await useApi(`/drivers/pay/${userId.value}`, {
      method: 'POST',
      body,
    })
    if (res.success) {
      driver.value = res.data
      success.value = okMsg
      await refreshDriver()
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Amal bajarilmadi'
  } finally {
    saving.value = false
  }
}

/** Faqat balansga qo'shish */
const addBalanceOnly = () => {
  if (creditAmount.value <= 0) return
  run(
    { creditAmount: creditAmount.value, attachTariff: false },
    `Balansga ${formatMoney(creditAmount.value)} so'm qo'shildi`
  )
}

/** To'lov + tarif ulash */
const payAndAttach = () => {
  if (!selectedTariff.value || creditAmount.value <= 0) return
  run(
    {
      creditAmount: creditAmount.value,
      tariffId: selectedTariff.value.id,
      attachTariff: true,
      deductTariff: deductTariff.value,
    },
    'To\'lov qabul qilindi va tarif ulandi'
  )
}

/** Faqat tarifni ulash (to'lovsiz) */
const attachOnly = () => {
  if (!selectedTariff.value) return
  run(
    {
      tariffId: selectedTariff.value.id,
      attachTariff: true,
      deductTariff: deductTariff.value,
      creditAmount: 0,
    },
    'Tarif ulandi'
  )
}

watch(selectedTariffId, (id) => {
  const t = tariffStore.tariffs.find(x => x.id === id)
  if (t && !route.query.amount) {
    // query amount yo'q bo'lsa — tanlangan tarif narxini to'ldirish
    amountText.value = formatMoney(t.price)
  }
})

onMounted(load)
</script>
