<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28 space-y-4">
    <AdminHeader @bonus="onBonus" />

    <AdminIncomeCard
      :amount="monthIncome.amount"
      :payments="monthIncome.payments"
      :total="monthIncome.total"
    />

    <!-- Tezkor bo'limlar -->
    <div class="space-y-2.5">
      <AdminNavItem
        v-for="nav in navItems"
        :key="nav.title"
        :title="nav.title"
        :subtitle="nav.subtitle"
        :icon="nav.icon"
        :tone="nav.tone"
        @click="navigateTo(nav.to)"
      />
    </div>

    <!-- Asosiy ko'rsatkichlar -->
    <div class="grid grid-cols-2 gap-3">
      <AdminStatCard
        v-for="stat in keyStats"
        :key="stat.label"
        :value="stat.value"
        :label="stat.label"
        :icon="stat.icon"
        :tone="stat.tone"
        :compact="stat.compact"
      />
    </div>

    <!-- Daromad tafsiloti -->
    <AdminSectionCard title="Daromad tafsiloti">
      <AdminDataRow
        v-for="row in incomeDetails"
        :key="row.label"
        :label="row.label"
        :amount="row.amount"
        :count="row.count"
      />
    </AdminSectionCard>

    <!-- Tarif bo'yicha taqsimot -->
    <AdminSectionCard title="Tarif bo'yicha taqsimot">
      <AdminDataRow
        v-for="row in tariffSplit"
        :key="row.label"
        :label="row.label"
        :amount="row.amount"
        :count="row.count"
      />
    </AdminSectionCard>

    <!-- Oylik statistika -->
    <AdminSectionCard title="Oylik statistika">
      <template #action>
        <AdminSegmentTabs v-model="chartTab" :tabs="chartTabs" />
      </template>
      <AdminBarChart :items="chartItems" />
    </AdminSectionCard>

    <!-- Top 10 referal -->
    <AdminSectionCard title="Top 10 referal" no-padding>
      <div class="px-4 pb-2">
        <AdminReferralItem
          v-for="ref in referrals"
          :key="ref.rank"
          :rank="ref.rank"
          :name="ref.name"
          :username="ref.username"
          :invites="ref.invites"
          :bonus="ref.bonus"
        />
        <p
          v-if="!referrals.length"
          class="py-6 text-center text-[12px] font-medium text-slate-400"
        >
          Hali referal reytingi yo'q
        </p>
      </div>
    </AdminSectionCard>
  </div>
</template>

<script setup lang="ts">
import { useReferralStore } from '~/stores/referral.store'

definePageMeta({
  layout: 'admin',
})

const referralStore = useReferralStore()

// --- Daromad ---
const monthIncome = ref({
  amount: 649000,
  payments: 34,
  total: 649000,
})

// --- Navigatsiya ---
const navItems = [
  {
    title: 'Haydovchilar',
    subtitle: 'Ro\'yxat · qidiruv · boshqaruv',
    icon: 'fa-solid fa-users',
    tone: 'green' as const,
    to: '/admin/drivers',
  },
  {
    title: 'Tariflar boshqaruvi',
    subtitle: 'Narx · muddat · faollashtirish',
    icon: 'fa-solid fa-tags',
    tone: 'violet' as const,
    to: '/admin/tariffs',
  },
  {
    title: 'Reklama bannerlari',
    subtitle: "Banner qo'shish · tartiblash",
    icon: 'fa-solid fa-image',
    tone: 'blue' as const,
    to: '/admin/banners',
  },
]

// --- Asosiy ko'rsatkichlar ---
const keyStats = [
  { value: 112, label: 'Jami haydovchilar', icon: 'fa-solid fa-users', tone: 'violet' as const },
  { value: 9, label: 'Yangi haydovchilar', icon: 'fa-solid fa-user-plus', tone: 'green' as const },
  { value: 0, label: 'Bugungi tashrif', icon: 'fa-solid fa-eye', tone: 'blue' as const },
  { value: 849000, label: 'Yillik daromad', icon: 'fa-solid fa-chart-line', tone: 'amber' as const, compact: true },
]

// --- Daromad tafsiloti ---
const incomeDetails = [
  { label: 'Bugun', amount: 0, count: 0 },
  { label: 'Kechagi', amount: 20000, count: 1 },
  { label: 'Kunlik', amount: 20000, count: 1 },
  { label: 'Haftalik', amount: 40000, count: 2 },
  { label: 'Oylik', amount: 589000, count: 31 },
]

// --- Tarif taqsimoti ---
const tariffSplit = [
  { label: 'Kunlik', amount: 20000, count: 1 },
  { label: 'Haftalik', amount: 40000, count: 2 },
  { label: 'Oylik', amount: 589000, count: 31 },
]

// --- Chart ---
const chartTab = ref('payments')
const chartTabs = [
  { label: "To'lovlar", value: 'payments' },
  { label: 'Foyda', value: 'profit' },
]

const monthLabels = ['IYL', 'IYN', 'MAY', 'APR', 'MAR', 'FEV', 'YAN']

const paymentsData = [34, 28, 41, 22, 19, 15, 12]
const profitData = [649, 520, 710, 380, 290, 210, 180]

const chartItems = computed(() => {
  const values = chartTab.value === 'payments' ? paymentsData : profitData
  const maxIdx = values.indexOf(Math.max(...values))
  return monthLabels.map((label, i) => ({
    label,
    value: values[i],
    active: i === maxIdx,
  }))
})

// --- Referallar ---
const referrals = computed(() => referralStore.leaderboard)

const onBonus = () => {
  navigateTo('/admin/bonus')
}

onMounted(() => {
  referralStore.fetchAll().catch(() => {})
})
</script>

