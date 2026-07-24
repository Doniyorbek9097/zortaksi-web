<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="goBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">Hisobni to'ldirish</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Summa so'rovi adminga yuboriladi
        </p>
      </div>
    </header>

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
    </section>

    <section
      class="rounded-2xl px-4 py-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 space-y-2"
    >
      <p class="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
        Qanday ishlaydi?
      </p>
      <ol class="space-y-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">1.</span> Kerakli summani yozing va so'rov yuboring</li>
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">2.</span> Admin karta yuboradi — to'lab, chekni yuboring</li>
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">3.</span> Balans to'ldirilgach, tarifni o'zingiz ulang</li>
      </ol>
    </section>

    <section
      class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
    >
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          To'lov so'rovi
        </p>
        <p class="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Istagan summani yozing. So'rov faqat adminga ketadi.
        </p>
      </div>

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
        :disabled="saving || topupAmount <= 0"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="sendTopupRequest"
      >
        <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
        To'lov qilish so'rovi — {{ formatMoney(topupAmount) }} so'm
      </button>
    </section>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <NuxtLink
      to="/driver/payment"
      class="block text-center text-[13px] font-bold text-violet-600 dark:text-violet-400 py-2"
    >
      Tarifga ulanish →
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'driver' })

const config = useRuntimeConfig()
const route = useRoute()
const authStore = useAuthStore()

const topupText = ref('')
const saving = ref(false)
const error = ref('')
const amountPresets = [50000, 100000, 150000, 200000]

const appURL = computed(() => String(config.public.appUrl || 'https://www.zortaksi.uz').replace(/\/$/, ''))
const balance = computed(() => authStore.user?.balance ?? 0)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')
const parseAmount = (raw: string) => {
  const n = Number(String(raw).replace(/\s/g, '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}
const topupAmount = computed(() => parseAmount(topupText.value))

const payUserId = computed(() => {
  const u = authStore.user
  return String(u?.userId || u?._id || '')
})

const goBack = () => {
  if (window.history.length > 1) navigateTo('/driver/payment')
  else navigateTo('/driver/dashboard')
}

const buildTopupMessage = (amount: number) => {
  const u = authStore.user
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || 'Haydovchi'
  const phone = u?.phoneNumber || '—'
  const sum = formatMoney(amount)
  const payUrl = `${appURL.value}/admin/pay/${payUserId.value}?amount=${amount}`

  const payload = JSON.stringify({
    type: 'topup',
    name,
    phone,
    amount: sum,
    amountRaw: amount,
    payUrl,
    userId: payUserId.value,
    paymentStatus: 'unpaid',
  })

  return `[[ZT_PAYMENT_REQUEST]]\n${payload}\n[[/ZT_PAYMENT_REQUEST]]`
}

const sendTopupRequest = async () => {
  const amount = topupAmount.value
  if (amount <= 0) {
    error.value = 'Summani kiriting'
    return
  }

  saving.value = true
  error.value = ''
  try {
    const res = await useApi('/me/tariff/request-payment', {
      method: 'POST',
      body: { text: buildTopupMessage(amount) },
      timeout: 30000,
    })
    if (res.success && res.data?.chatId) {
      await navigateTo({
        path: `/driver/chat/${res.data.chatId}`,
        query: { name: 'Admin', support: '1' },
      })
      return
    }
    error.value = res.message || 'To\'ldirish so\'rovi yuborilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'To\'ldirish so\'rovi yuborilmadi'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* */ }
  }
  const qAmount = route.query.amount != null ? Number(route.query.amount) : NaN
  if (Number.isFinite(qAmount) && qAmount > 0) {
    topupText.value = formatMoney(qAmount)
  }
})
</script>
