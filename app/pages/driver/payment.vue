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
            Balans yetarli bo'lsa darhol ulanadi, yetmasa adminga so'rov yuboriladi
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
            :disabled="savingBuy || !selectedId"
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
          <button
            type="button"
            :disabled="savingRequest"
            class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            @click="sendTariffRequest"
          >
            <font-awesome-icon v-if="savingRequest" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
            «{{ selected.name }}» uchun to'lov so'rovi
          </button>
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
          Summa adminga yuboriladi. To'lovdan keyin tarifni o'zingiz ulashingiz mumkin.
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

        <button
          type="button"
          :disabled="savingRequest || topupAmount <= 0"
          class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          @click="sendTopupRequest"
        >
          <font-awesome-icon v-if="savingRequest" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
          Balans to'ldirish so'rovi — {{ formatMoney(topupAmount) }} so'm
        </button>
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
const error = ref('')
const amountPresets = [50000, 100000, 150000, 200000]

const appURL = computed(() => String(config.public.appUrl || 'https://www.zortaksi.uz').replace(/\/$/, ''))
const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => authStore.tariffActive)

const payUserId = computed(() => {
  const u = authStore.user
  return String(u?.userId || u?._id || '')
})

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

const buildPaymentPayload = (payload: Record<string, unknown>) =>
  `[[ZT_PAYMENT_REQUEST]]\n${JSON.stringify(payload)}\n[[/ZT_PAYMENT_REQUEST]]`

const buildTariffRequestMessage = (tariff: TariffRow, amount: number) => {
  const u = authStore.user
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || 'Haydovchi'
  const phone = u?.phoneNumber || '—'
  const sum = formatMoney(amount)
  const payUrl =
    `${appURL.value}/admin/pay/${encodeURIComponent(payUserId.value)}` +
    `?amount=${amount}&tariffId=${encodeURIComponent(tariff.id)}`

  return buildPaymentPayload({
    type: 'tariff',
    name,
    phone,
    amount: sum,
    amountRaw: amount,
    tariff: tariff.name,
    tariffId: tariff.id,
    payUrl,
    userId: payUserId.value,
    paymentStatus: 'unpaid',
  })
}

const buildTopupMessage = (amount: number) => {
  const u = authStore.user
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || 'Haydovchi'
  const phone = u?.phoneNumber || '—'
  const sum = formatMoney(amount)
  const payUrl = `${appURL.value}/admin/pay/${encodeURIComponent(payUserId.value)}?amount=${amount}`

  return buildPaymentPayload({
    type: 'topup',
    name,
    phone,
    amount: sum,
    amountRaw: amount,
    payUrl,
    userId: payUserId.value,
    paymentStatus: 'unpaid',
  })
}

const openSupportChat = async (res: { success?: boolean; data?: { chatId?: string }; message?: string }) => {
  if (res.success && res.data?.chatId) {
    await navigateTo({
      path: `/driver/chat/${res.data.chatId}`,
      query: { name: 'Admin', support: '1' },
    })
    return true
  }
  error.value = res.message || 'So\'rov yuborilmadi'
  return false
}

const sendTariffRequest = async () => {
  if (!selected.value) return
  const amount = Math.max(shortage.value, selected.value.price)
  savingRequest.value = true
  error.value = ''
  try {
    const res = await useApi('/me/tariff/request-payment', {
      method: 'POST',
      body: { text: buildTariffRequestMessage(selected.value, amount) },
      timeout: 30000,
    })
    await openSupportChat(res)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'So\'rov yuborilmadi'
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
    const res = await useApi('/me/tariff/request-payment', {
      method: 'POST',
      body: { text: buildTopupMessage(amount) },
      timeout: 30000,
    })
    await openSupportChat(res)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'So\'rov yuborilmadi'
  } finally {
    savingRequest.value = false
  }
}

const switchToTopup = (amount: number) => {
  mode.value = 'topup'
  topupText.value = formatMoney(amount)
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
      await navigateTo('/driver/dashboard')
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

  const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN
  if (Number.isFinite(qAmount) && qAmount > 0) {
    topupText.value = formatMoney(qAmount)
    if (tab !== 'tariff') mode.value = 'topup'
  }

  try {
    await tariffStore.fetchTariffs()
    if (!selectedId.value && tariffStore.tariffs.length) {
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
