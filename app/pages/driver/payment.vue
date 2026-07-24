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
        <h1 class="text-base font-black text-slate-900 dark:text-white">Tarifga ulanish</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Balansingizdan tarifni faollashtiring
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 active:scale-95"
        @click="navigateTo('/driver/topup')"
      >
        To'ldirish
      </button>
    </header>

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

    <!-- Tariflar -->
    <section class="space-y-3">
      <div class="px-0.5">
        <h2 class="text-sm font-black text-slate-900 dark:text-white">Tarifni tanlang</h2>
        <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
          Balans yetarli bo'lsa darhol ulanadi
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
        Balans yetarli — darhol ulash mumkin
      </p>

      <button
        v-if="shortage <= 0"
        type="button"
        :disabled="savingBuy || !selectedId"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="buyTariff"
      >
        <font-awesome-icon v-if="savingBuy" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
        Tarifga ulanish — {{ formatMoney(selected.price) }} so'm
      </button>

      <button
        v-else
        type="button"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all"
        @click="goTopup"
      >
        To'lov qilish so'rovi — {{ formatMoney(shortage) }} so'm
      </button>
    </section>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <DriverPaymentHistoryList ref="historyList" :max-items="30" />
  </div>
</template>

<script setup lang="ts">
import type { TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'driver' })

const authStore = useAuthStore()
const tariffStore = useTariffStore()

const selectedId = ref<string | null>(null)
const savingBuy = ref(false)
const error = ref('')
const historyList = ref<{ load: () => Promise<void> } | null>(null)

const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => authStore.tariffActive)

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

const goTopup = () => {
  navigateTo({
    path: '/driver/topup',
    query: shortage.value > 0 ? { amount: String(shortage.value) } : undefined,
  })
}

const buyTariff = async () => {
  if (!selected.value) return
  if (shortage.value > 0) {
    goTopup()
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
      await historyList.value?.load()
      await navigateTo('/driver/dashboard')
    } else {
      error.value = res.message || 'Tarif ulanmadi'
    }
  } catch (e: any) {
    const status = e?.response?.status
    const msg = e?.response?.data?.message
    if (status === 402) {
      const need = Number(e?.response?.data?.data?.shortage || shortage.value || 0)
      error.value = msg || 'Balans yetarli emas — hisobni to\'ldiring'
      await navigateTo({
        path: '/driver/topup',
        query: need > 0 ? { amount: String(need) } : undefined,
      })
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
