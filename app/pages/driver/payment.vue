<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="navigateTo('/driver/dashboard')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none flex-1 min-w-0">
        <h1 class="text-base font-black text-slate-900 dark:text-white">To'lov</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Tarif yoki balans to'ldirish
        </p>
      </div>
    </header>

    <section
      v-if="returnPath"
      class="rounded-2xl px-4 py-3 border border-amber-200/80 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30"
    >
      <p class="text-[12px] font-bold text-amber-800 dark:text-amber-200 leading-snug">
        Mijozni olish uchun avval tarifga ulaning. To'lovdan keyin avtomatik qaytasiz.
      </p>
    </section>

    <!-- Rejim tanlash -->
    <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <button
        type="button"
        class="py-2.5 rounded-lg text-[11px] font-black transition-all"
        :class="mode === 'tariff'
          ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm'
          : 'text-slate-500 dark:text-slate-400'"
        @click="mode = 'tariff'"
      >
        Tarif tanlash
      </button>
      <button
        type="button"
        class="py-2.5 rounded-lg text-[11px] font-black transition-all"
        :class="mode === 'topup'
          ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
          : 'text-slate-500 dark:text-slate-400'"
        @click="mode = 'topup'"
      >
        Balans to'ldirish
      </button>
    </div>

    <!-- Balans -->
    <section
      class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
    >
      <div>
        <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500">Sizning balansingiz</p>
        <p class="text-2xl font-black text-sky-500 mt-0.5">
          {{ formatMoney(balance) }}
          <span class="text-base font-bold text-sky-500/80">so'm</span>
        </p>
      </div>
      <span
        class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-black border"
        :class="tariffActive
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
          : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50'"
      >
        {{ tariffActive ? 'Tarif faol' : 'Tarif yo\'q' }}
      </span>
    </section>

    <!-- TARIF -->
    <template v-if="mode === 'tariff'">
      <section class="space-y-3">
        <div class="px-0.5">
          <h2 class="text-sm font-black text-slate-900 dark:text-white">Tarifni tanlang</h2>
          <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Balans yetarli bo'lsa darhol ulanadi, yetmasa Admin Telegram orqali to'lov
          </p>
        </div>

        <div v-if="tariffStore.isLoading" class="space-y-2">
          <div v-for="n in 4" :key="n" class="h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="t in tariffStore.tariffs"
            :key="t.id"
            type="button"
            class="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border text-left transition-all"
            :class="selectedId === t.id
              ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-sm shadow-violet-500/10'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
            @click="selectedId = t.id"
          >
            <span
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedId === t.id ? 'border-violet-500' : 'border-slate-300 dark:border-slate-600'"
            >
              <span v-if="selectedId === t.id" class="w-2.5 h-2.5 rounded-full bg-violet-500" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-black text-slate-900 dark:text-white">{{ t.name }}</span>
              <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {{ tariffMeta(t) }}
              </span>
            </span>
            <span class="text-sm font-black text-violet-500 shrink-0">
              {{ formatMoney(t.price) }}
            </span>
          </button>
        </div>
      </section>

      <section
        v-if="selected"
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-[11px] font-bold text-slate-400">Tanlangan tarif</p>
            <p class="text-sm font-black text-slate-900 dark:text-white">{{ selected.name }}</p>
          </div>
          <p class="text-lg font-black text-violet-500">{{ formatMoney(selected.price) }} <span class="text-sm">so'm</span></p>
        </div>

        <template v-if="shortage <= 0">
          <p class="text-center text-[13px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl py-2">
            Balans yetarli — darhol ulash mumkin
          </p>
          <button
            type="button"
            :disabled="savingBuy || !selectedId || !!payingProvider"
            class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            @click="buyTariff"
          >
            <font-awesome-icon v-if="savingBuy" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
            Tarifga ulanish — {{ formatMoney(selected.price) }} so'm
          </button>
        </template>

        <template v-else>
          <p class="text-center text-[13px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-xl py-2">
            Yetishmaydi: {{ formatMoney(shortage) }} so'm
          </p>

          <DriverPaymentProviderButtons
            :amount="shortage"
            :click-enabled="methods.click"
            :payme-enabled="methods.payme"
            :show-admin="true"
            :admin-label="'Admin Telegram — to\'lov so\'rovi'"
            online-hint="Faqat yetishmayotgan summa to'lanadi. To'lovdan so'ng tarif darhol faol bo'ladi."
            :loading="payingProvider"
            :admin-loading="savingRequest"
            :disabled="!selectedId || savingBuy"
            @pay-click="payOnline('click')"
            @pay-payme="payOnline('payme')"
            @pay-admin="sendTariffRequest"
          />

          <button
            type="button"
            class="w-full py-2.5 text-[12px] font-bold text-sky-500 hover:underline"
            @click="switchToTopup(shortage)"
          >
            Faqat balans to'ldirish ({{ formatMoney(shortage) }} so'm)
          </button>
        </template>
      </section>
    </template>

    <!-- TOPUP -->
    <template v-else>
      <section
        class="rounded-2xl px-4 py-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 space-y-2"
      >
        <p class="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Balans to'ldirish
        </p>
        <p class="text-[13px] font-medium text-slate-600 dark:text-slate-300 leading-snug">
          Click yoki Payme orqali to'lov — balans darhol qo'shiladi. Admin orqali — Telegram lichkasiga tayyor xabar bilan.
        </p>
      </section>

      <section
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
      >
        <div class="space-y-1">
          <label class="px-1 text-[11px] font-bold text-slate-400">Summa (so'm)</label>
          <input
            v-model="topupText"
            type="text"
            inputmode="numeric"
            placeholder="Masalan: 150000"
            class="w-full px-3.5 py-3 rounded-xl text-base font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in amountPresets"
            :key="preset"
            type="button"
            class="px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all"
            :class="topupAmount === preset
              ? 'border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'"
            @click="topupText = formatMoney(preset)"
          >
            {{ formatMoney(preset) }}
          </button>
        </div>

        <DriverPaymentProviderButtons
          :amount="topupAmount > 0 ? topupAmount : 0"
          :click-enabled="methods.click"
          :payme-enabled="methods.payme"
          :show-admin="true"
          admin-label="Admin Telegram — balans so'rovi"
          online-hint="Click yoki Payme orqali to'lovdan so'ng balans darhol qo'shiladi."
          :loading="payingProvider"
          :admin-loading="savingRequest"
          :disabled="topupAmount <= 0"
          @pay-click="payTopupOnline('click')"
          @pay-payme="payTopupOnline('payme')"
          @pay-admin="sendTopupRequest"
        />
      </section>
    </template>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <DriverPaymentHistoryList ref="historyList" :max-items="30" />
  </div>
</template>

<script setup lang="ts">
import type { TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'
import { useAuthStore } from '~/stores/auth.store'
import {
  buildAdminTelegramDmUrl,
  formatAdminTariffPaymentMessage,
  formatAdminTopupPaymentMessage,
  openTelegramExternalUrl,
} from '~/utils/telegramLinks'

definePageMeta({ layout: 'driver' })

const config = useRuntimeConfig()
const route = useRoute()
const authStore = useAuthStore()
const tariffStore = useTariffStore()

type PayMode = 'tariff' | 'topup'
const mode = ref<PayMode>('tariff')

const selectedId = ref<string | null>(null)
const topupText = ref('')
const savingBuy = ref(false)
const savingRequest = ref(false)
const payingProvider = ref<'click' | 'payme' | null>(null)
const error = ref('')
const amountPresets = [50000, 100000, 150000, 200000]
const methods = ref<{ click: boolean; payme: boolean }>({ click: false, payme: false })

const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => authStore.tariffActive)

const returnPath = computed(() => resolveSafeNextPath(route.query.next, authStore.user))

const selected = computed(() =>
  tariffStore.tariffs.find(t => t.id === selectedId.value) || null
)

const shortage = computed(() => {
  if (!selected.value) return 0
  return Math.max(0, selected.value.price - balance.value)
})

const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}

const topupAmount = computed(() => parseAmount(topupText.value))

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const tariffMeta = (t: TariffRow) => {
  const days = `${t.expireDays} kun`
  if (t.info) return `${days} • ${t.info}`
  return `${days} • ${t.expireDays * 24} soat faol`
}

const adminUsername = computed(() =>
  String(config.public.adminTelegram || 'zortaksi_admin').replace(/^@/, '')
)

const openAdminTelegramPayment = (text: string) => {
  const url = buildAdminTelegramDmUrl(adminUsername.value, text)
  if (!url) {
    error.value = 'Admin Telegram topilmadi'
    return false
  }
  openTelegramExternalUrl(url)
  return true
}

const sendTariffRequest = async () => {
  if (!selected.value) return
  const amount = shortage.value > 0 ? shortage.value : selected.value.price
  savingRequest.value = true
  error.value = ''
  try {
    const msg = formatAdminTariffPaymentMessage(selected.value.name, amount)
    if (!openAdminTelegramPayment(msg)) return
  } finally {
    savingRequest.value = false
  }
}

const sendTopupRequest = async () => {
  const amount = topupAmount.value
  if (amount <= 0) {
    error.value = 'Summani kiriting'
    return
  }
  savingRequest.value = true
  error.value = ''
  try {
    if (!openAdminTelegramPayment(formatAdminTopupPaymentMessage(amount))) return
  } finally {
    savingRequest.value = false
  }
}

const switchToTopup = (amount: number) => {
  mode.value = 'topup'
  topupText.value = formatMoney(amount)
}

const fetchPaymentMethods = async () => {
  try {
    const res = await useApi('/me/tariff/payment-methods')
    if (res.success && res.data) {
      methods.value = {
        click: !!res.data.click,
        payme: !!res.data.payme,
      }
    }
  } catch {
    methods.value = { click: false, payme: false }
  }
}

const openPayUrl = (res: { success?: boolean; data?: { payUrl?: string }; message?: string }) => {
  const payUrl = String(res?.data?.payUrl || '').trim()
  if (!res.success || !payUrl) {
    error.value = res.message || 'To\'lov havolasi olinmadi'
    return false
  }
  if (import.meta.client) {
    window.location.assign(payUrl)
  }
  return true
}

const payOnline = async (provider: 'click' | 'payme') => {
  if (!selected.value) return
  payingProvider.value = provider
  error.value = ''
  try {
    const path = provider === 'click' ? '/me/tariff/pay-click' : '/me/tariff/pay-payme'
    const res = await useApi(path, {
      method: 'POST',
      body: { tariffId: selected.value.id },
      timeout: 30000,
    })
    openPayUrl(res)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'To\'lov boshlanmadi'
  } finally {
    payingProvider.value = null
  }
}

const payTopupOnline = async (provider: 'click' | 'payme') => {
  const amount = topupAmount.value
  if (amount <= 0) {
    error.value = 'Summani kiriting'
    return
  }
  payingProvider.value = provider
  error.value = ''
  try {
    const path = provider === 'click' ? '/me/balance/pay-click' : '/me/balance/pay-payme'
    const res = await useApi(path, {
      method: 'POST',
      body: { amount },
      timeout: 30000,
    })
    openPayUrl(res)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'To\'lov boshlanmadi'
  } finally {
    payingProvider.value = null
  }
}

const buyTariff = async () => {
  if (!selected.value) return
  if (shortage.value > 0) {
    await sendTariffRequest()
    return
  }

  savingBuy.value = true
  error.value = ''
  try {
    const res = await useApi('/me/tariff/buy', {
      method: 'POST',
      body: { tariffId: selected.value.id },
    })
    if (res.success) {
      await authStore.getMe()
      if (returnPath.value && authStore.tariffActive) {
        await navigateTo(returnPath.value)
      } else {
        await navigateTo('/driver/dashboard')
      }
    } else {
      error.value = res.message || 'Tarif ulanmadi'
    }
  } catch (e: any) {
    const status = e?.response?.status
    const msg = e?.response?.data?.message
    if (status === 402) {
      const need = Number(e?.response?.data?.data?.shortage || shortage.value || 0)
      error.value = msg || 'Balans yetarli emas'
      switchToTopup(need)
    } else {
      error.value = msg || e?.message || 'Tarif ulanmadi'
    }
  } finally {
    savingBuy.value = false
  }
}

onMounted(async () => {
  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* ignore */ }
  }

  const tab = String(route.query.tab || '')
  if (tab === 'topup') mode.value = 'topup'
  if (tab === 'tariff') mode.value = 'tariff'

  const paid = String(route.query.paid || '')
  if (paid === '1') {
    try { await authStore.getMe() } catch { /* ignore */ }
    if (returnPath.value && authStore.tariffActive) {
      await navigateTo(returnPath.value)
      return
    }
    await navigateTo('/driver/dashboard')
    return
  }

  const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN
  if (Number.isFinite(qAmount) && qAmount > 0) {
    topupText.value = formatMoney(qAmount)
    if (tab !== 'tariff') mode.value = 'topup'
  }

  try {
    await Promise.all([tariffStore.fetchTariffs(), fetchPaymentMethods()])
    const qTariffId = String(route.query.tariffId || '').trim()
    if (qTariffId && tariffStore.tariffs.some(t => t.id === qTariffId)) {
      selectedId.value = qTariffId
    } else if (!selectedId.value && tariffStore.tariffs.length) {
      selectedId.value = tariffStore.tariffs[0]!.id
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Tariflar yuklanmadi'
  }
})

usePullToRefresh(async () => {
  await authStore.getMe().catch(() => {})
  await tariffStore.fetchTariffs().catch(() => {})
})
</script>
