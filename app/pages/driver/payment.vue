<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28 space-y-4">
    <!-- Header -->
    <header class="flex items-center gap-2.5 sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-9 h-9 rounded-full flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="navigateTo('/driver/dashboard')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-tight">
        <h1 class="text-lg font-black text-slate-900 dark:text-white">To'lov</h1>
        <p class="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Tarif sotib olish
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
        {{ tariffActive ? 'Faol' : 'Faol emas' }}
      </span>
    </section>

    <!-- Tariflar -->
    <section class="space-y-3">
      <h2 class="text-sm font-black text-slate-900 dark:text-white">Tarifni tanlang</h2>

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
      class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
    >
      <p
        v-if="shortage > 0"
        class="text-center text-[13px] font-black text-amber-500"
      >
        Yetishmaydi: {{ formatMoney(shortage) }} so'm
      </p>
      <p
        v-else
        class="text-center text-[13px] font-black text-emerald-500"
      >
        Balans yetarli — tarif faollashtiriladi
      </p>

      <div
        class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
      >
        <span class="text-base font-black text-slate-900 dark:text-white">
          {{ formatMoney(selected.price) }}
        </span>
        <span class="text-sm font-bold text-slate-400">so'm</span>
      </div>

      <button
        type="button"
        :disabled="saving || !selectedId"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="onPay"
      >
        <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
        <template v-if="shortage > 0">
          Adminga xabar — {{ formatMoney(selected.price) }} so'm
        </template>
        <template v-else>
          To'lash — {{ formatMoney(selected.price) }} so'm
        </template>
      </button>

      <p v-if="shortage > 0" class="text-center text-[11px] font-bold text-slate-400">
        @{{ adminTelegram }}
      </p>
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

const adminTelegram = computed(() => String(config.public.adminTelegram || 'doniyorbek_ergashev'))
const appURL = computed(() => String(config.public.appUrl || 'https://www.zortaksi.uz').replace(/\/$/, ''))

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

const tariffMeta = (t: TariffRow) => {
  const days = `${t.expireDays} kun`
  if (t.info) return `${days} • ${t.info}`
  return `${days} • ${t.expireDays * 24} soat faol`
}

const payUserId = computed(() => {
  const u = authStore.user
  return String(u?._id || u?.userId || '')
})

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
    '',
    `📦 Tarif: ${t.name}`,
    `💵 Narx:  ${sum} so'm`,
    '',
    '💳 Karta raqamini yuboring.',
    '',
    '🔗 To\'lov:',
    payLink,
  ].join('\n')
}

const openAdminTelegram = (t: TariffRow) => {
  const text = buildAdminMessage(t)
  const url = `https://t.me/${adminTelegram.value}?text=${encodeURIComponent(text)}`
  if (import.meta.client) window.open(url, '_blank', 'noopener,noreferrer')
}

/** Adminga xabar — Telegram ochiladi (matn tayyor) */
const notifyAdmin = (t: TariffRow) => {
  openAdminTelegram(t)
}

const onPay = async () => {
  if (!selected.value) return
  error.value = ''

  // Balans yetmasa — Telegramga o'tib, adminga xabar matni bilan
  if (shortage.value > 0) {
    notifyAdmin(selected.value)
    return
  }

  // Yetarli — balansdan yechib faollashtirish
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
      notifyAdmin(selected.value)
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
