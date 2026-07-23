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
      <div class="leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">To'lov</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Tarifni tanlang va to'lang
        </p>
      </div>
    </header>

    <!-- Balans -->
    <section
      class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3"
    >
      <div>
        <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500">Balans</p>
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

    <!-- Qadamlar -->
    <section
      class="rounded-2xl px-4 py-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 space-y-2"
    >
      <p class="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
        Qanday to'lash kerak?
      </p>
      <ol class="space-y-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">1.</span> Pastdan tarifni tanlang</li>
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">2.</span> Kartaga pul o'tkazing</li>
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">3.</span> Adminga chek/skrinshot yuboring</li>
        <li class="flex gap-2"><span class="text-sky-500 shrink-0">4.</span> 5–10 daqiqada tarif yoqiladi</li>
      </ol>
    </section>

    <!-- Tariflar -->
    <section class="space-y-3">
      <h2 class="text-sm font-black text-slate-900 dark:text-white">1. Tarifni tanlang</h2>

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
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-sm shadow-sky-500/10'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
          @click="selectedId = t.id"
        >
          <span
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
            :class="selectedId === t.id ? 'border-sky-500' : 'border-slate-300 dark:border-slate-600'"
          >
            <span v-if="selectedId === t.id" class="w-2.5 h-2.5 rounded-full bg-sky-500" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-black text-slate-900 dark:text-white">{{ t.name }}</span>
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {{ tariffMeta(t) }}
            </span>
          </span>
          <span class="text-sm font-black text-sky-500 shrink-0">
            {{ formatMoney(t.price) }}
          </span>
        </button>

        <div
          v-if="!tariffStore.tariffs.length"
          class="flex flex-col items-center justify-center py-8 text-center text-slate-400"
        >
          <font-awesome-icon icon="fa-solid fa-tags" class="text-xl mb-2 opacity-50" />
          <p class="text-[12px]">Tariflar topilmadi</p>
        </div>
      </div>
    </section>

    <!-- To'lov bloki -->
    <section
      v-if="selected"
      class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
    >
      <div class="flex items-center justify-between gap-2">
        <div>
          <p class="text-[11px] font-bold text-slate-400">Tanlangan tarif</p>
          <p class="text-sm font-black text-slate-900 dark:text-white">{{ selected.name }}</p>
        </div>
        <p class="text-lg font-black text-sky-500">{{ formatMoney(selected.price) }} <span class="text-sm">so'm</span></p>
      </div>

      <p
        v-if="shortage > 0"
        class="text-center text-[13px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-xl py-2"
      >
        Balansda yetishmaydi: {{ formatMoney(shortage) }} so'm
      </p>
      <p
        v-else
        class="text-center text-[13px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl py-2"
      >
        Balans yetarli — darhol faollashtirish mumkin
      </p>

      <!-- Kartalar (balans yetmasa) -->
      <div v-if="shortage > 0" class="space-y-2">
        <h3 class="text-sm font-black text-slate-900 dark:text-white">2. Kartaga o'tkazing</h3>
        <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400">
          Quyidagi kartalardan biriga {{ formatMoney(selected.price) }} so'm o'tkazing. Raqamga bosib nusxa oling.
        </p>

        <button
          v-for="card in paymentCards"
          :key="card"
          type="button"
          class="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 active:scale-[0.99] transition-all"
          @click="copyCard(card)"
        >
          <span class="flex items-center gap-2 min-w-0">
            <font-awesome-icon icon="fa-solid fa-wallet" class="text-sky-500" />
            <span class="text-[15px] font-black tabular-nums text-slate-900 dark:text-white tracking-wide">
              {{ formatCard(card) }}
            </span>
          </span>
          <span class="text-[11px] font-black text-sky-500 shrink-0">
            {{ copiedCard === card ? 'Nusxa olindi' : 'Nusxa' }}
          </span>
        </button>

        <p class="text-[12px] font-bold text-slate-600 dark:text-slate-300 text-center">
          Karta egasi: {{ paymentCardOwner }}
        </p>
      </div>

      <button
        type="button"
        :disabled="saving || !selectedId"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="onPay"
      >
        <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
        <template v-if="shortage > 0">
          3. Adminga xabar yuborish
        </template>
        <template v-else>
          To'lash — {{ formatMoney(selected.price) }} so'm
        </template>
      </button>

      <p v-if="shortage > 0" class="text-center text-[11px] font-medium text-slate-400 leading-relaxed">
        Xabar yuborilgach admin karta ma'lumotini yuboradi.
        To'lovdan keyin <b class="text-slate-500">chek yoki skrinshot</b>ni shu chatga yuboring.
        Admin: @{{ adminTelegram }}
      </p>
    </section>

    <!-- Muvaffaqiyat -->
    <section
      v-if="requestSent"
      class="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2"
    >
      <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">
        <font-awesome-icon icon="fa-solid fa-circle-check" class="mr-1" />
        Adminga xabar yuborildi
      </p>
      <p class="text-[12px] font-bold text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed">
        Telegramda admin javobini kuting — karta raqami keladi.
        Pul o'tkazib, chekni shu suhbatga yuboring. Tarif 5–10 daqiqada yoqiladi.
      </p>
      <a
        :href="`https://t.me/${adminTelegram}`"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-[12px] font-black text-sky-600 dark:text-sky-400"
      >
        Telegramni ochish →
      </a>
    </section>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'driver' })

const config = useRuntimeConfig()
const authStore = useAuthStore()
const tariffStore = useTariffStore()

const selectedId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const requestSent = ref(false)
const copiedCard = ref('')

const adminTelegram = computed(() => String(config.public.adminTelegram || 'doniyorbek_ergashev'))
const appURL = computed(() => String(config.public.appUrl || 'https://www.zortaksi.uz').replace(/\/$/, ''))
const paymentCardOwner = computed(() => String(config.public.paymentCardOwner || 'Doniyor Mirgiyozov'))
const paymentCards = computed(() =>
  [config.public.paymentCard1, config.public.paymentCard2]
    .map((c) => String(c || '').replace(/\D/g, ''))
    .filter(Boolean)
)

const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => !!authStore.user?.active && !!authStore.user?.tariff)

const selected = computed(() =>
  tariffStore.tariffs.find(t => t.id === selectedId.value) || null
)

const shortage = computed(() => {
  if (!selected.value) return 0
  return Math.max(0, selected.value.price - balance.value)
})

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const formatCard = (digits: string) =>
  digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()

const tariffMeta = (t: TariffRow) => {
  const days = `${t.expireDays} kun`
  if (t.info) return `${days} • ${t.info}`
  return `${days} • ${t.expireDays * 24} soat faol`
}

const payUserId = computed(() => {
  const u = authStore.user
  return String(u?._id || u?.userId || '')
})

const copyCard = async (card: string) => {
  try {
    await navigator.clipboard.writeText(card)
    copiedCard.value = card
    setTimeout(() => {
      if (copiedCard.value === card) copiedCard.value = ''
    }, 2000)
  } catch {
    error.value = 'Nusxa olish ishlamadi — raqamni qo\'lda belgilang'
  }
}

const buildAdminMessage = (t: TariffRow) => {
  const u = authStore.user
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() || 'Haydovchi'
  const phone = u?.phoneNumber || '—'
  const sum = formatMoney(t.price)
  const payLink = `${appURL.value}/admin/pay/${payUserId.value}?tariffId=${t.id}&amount=${t.price}`

  return [
    '🛒 Tarif sotib olmoqchiman',
    '',
    `👤 Ism:  ${name}`,
    `📞 Tel:  ${phone}`,
    '',
    `💰 Summa: ${sum} so'm`,
    `📦 Tarif: ${t.name}`,
    '',
    '💳 Karta raqamini yuboring.',
    '',
    '✅ To\'lovdan keyin chek/skrinshot yuboraman.',
    '',
    '🔗 Admin to\'lov:',
    payLink,
  ].join('\n')
}

const openAdminTelegram = (t: TariffRow) => {
  const text = buildAdminMessage(t)
  const url = `https://t.me/${adminTelegram.value}?text=${encodeURIComponent(text)}`
  if (import.meta.client) window.open(url, '_blank', 'noopener,noreferrer')
}

/** Adminga xabar — avval server orqali, bo'lmasa Telegram draft */
const notifyAdmin = async (t: TariffRow) => {
  const text = buildAdminMessage(t)
  saving.value = true
  error.value = ''
  try {
    const res = await useApi('/me/tariff/request-payment', {
      method: 'POST',
      body: { text, tariffId: t.id },
      timeout: 30000,
    })
    if (res.success) {
      requestSent.value = true
      return
    }
    openAdminTelegram(t)
    requestSent.value = true
  } catch (e: any) {
    // Sessiya yo'q / yuborilmadi — Telegram draft
    openAdminTelegram(t)
    requestSent.value = true
    const code = e?.response?.data?.data?.code
    if (code === 'SESSION_MISSING' || code === 'TG_SEND_FAILED') {
      error.value = 'Telegram ochildi — xabarni yuborish tugmasini bosing'
    }
  } finally {
    saving.value = false
  }
}

const onPay = async () => {
  if (!selected.value) return
  error.value = ''
  requestSent.value = false

  if (shortage.value > 0) {
    await notifyAdmin(selected.value)
    return
  }

  saving.value = true
  try {
    const res = await useApi('/me/tariff/buy', {
      method: 'POST',
      body: { tariffId: selected.value.id },
    })
    if (res.success) {
      await authStore.getMe()
      await navigateTo('/driver/dashboard')
    } else {
      error.value = res.message || 'To\'lov amalga oshmadi'
    }
  } catch (e: any) {
    const status = e?.response?.status
    const msg = e?.response?.data?.message
    if (status === 402) {
      await notifyAdmin(selected.value!)
    } else {
      error.value = msg || e?.message || 'To\'lov amalga oshmadi'
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* ignore */ }
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
</script>
