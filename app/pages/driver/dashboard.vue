<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-5">
    <!-- Header -->
    <DashboardHeader @bonus="onBonus" />

    <!-- Caption — header emas, sahifa ichida -->
    <div class="flex items-center gap-2 -mt-1 px-0.5">
      <font-awesome-icon
        :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
        class="text-sm shrink-0"
        :class="isNight ? 'text-indigo-400' : 'text-amber-400'"
      />
      <p class="text-[14px] font-bold text-slate-700 dark:text-slate-200 min-w-0 truncate">
        {{ greeting }}, {{ firstName }}!
      </p>
    </div>

    <!-- Payment banner -->
    <DashboardPaymentBanner v-if="!tariffActive" @action="onBuyTariff" />

    <!-- Balance -->
    <DashboardBalanceCard :balance="balance" :active="tariffActive" @buy="onBuyTariff" />

    <!-- Tariff / subscription -->
    <DashboardTariffCard
      :name="tariff.name"
      :info="tariff.info"
      :price="tariff.price"
      :expire-days="tariff.expireDays"
      :start-date="tariff.startDate"
      :end-date="tariff.endDate"
      :active="tariffActive"
      @buy="onBuyTariff"
    />

    <!-- Platform statistics -->
    <section class="space-y-3">
      <h3 class="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
        Platforma statistikasi
      </h3>
      <div class="grid grid-cols-2 gap-3">
        <DashboardStatCard
          v-for="stat in stats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()

// --- User derived data ---
const firstName = computed(() => authStore.user?.firstName || 'Haydovchi')
const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => !!authStore.user?.tariff && !!authStore.user?.active)

// --- Greeting based on hour ---
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
})

const isNight = computed(() => /tun|kech/i.test(greeting.value))

// --- Tariff card data ---
const formatDate = (value?: string | Date) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const tariff = computed(() => ({
  name: authStore.user?.tariff?.name || 'Kunlik sinov',
  info: authStore.user?.tariff?.info || '1 - martalik sinov tarifi',
  price: authStore.user?.tariff?.price ?? 5000,
  expireDays: authStore.user?.tariff?.expireDays ?? 1,
  startDate: formatDate(authStore.user?.startedAt),
  endDate: formatDate(authStore.user?.tariffExpireAt),
}))

// --- Platform statistics ---
type StatColor = 'blue' | 'amber' | 'green' | 'violet' | 'emerald' | 'pink'
interface Stat {
  value: number
  label: string
  icon: string
  color: StatColor
}

const stats = ref<Stat[]>([
  { value: 205, label: 'Bugungi buyurtmalar', icon: 'fa-solid fa-calendar-day', color: 'blue' },
  { value: 71, label: "So'nggi 1 soat", icon: 'fa-solid fa-bolt', color: 'amber' },
  { value: 1787, label: 'Jami buyurtmalar', icon: 'fa-solid fa-chart-line', color: 'green' },
  { value: 50, label: 'Jami Haydovchilar', icon: 'fa-solid fa-users', color: 'violet' },
  { value: 9, label: 'Faol Haydovchilar', icon: 'fa-solid fa-user-check', color: 'emerald' },
  { value: 2, label: 'Tariflar soni', icon: 'fa-solid fa-tags', color: 'pink' },
])

// --- Actions ---
const onBonus = () => {
  navigateTo('/driver/bonus')
}

const onBuyTariff = () => {
  navigateTo('/driver/payment')
}
</script>
