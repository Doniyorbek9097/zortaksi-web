<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <AdminHeader @bonus="onBonus" />

    <div v-if="store.isLoading && !store.data" class="space-y-3">
      <div class="h-36 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="grid grid-cols-2 gap-3">
        <div v-for="n in 4" :key="n" class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      </div>
    </div>

    <template v-else>
      <AdminIncomeCard
        :amount="monthIncome.amount"
        :payments="monthIncome.payments"
        :total="monthIncome.total"
      />

      <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
        {{ store.error }}
      </p>

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
        <p
          v-if="!tariffSplit.length"
          class="py-4 text-center text-[12px] font-medium text-slate-400"
        >
          Hali to'lovlar yo'q
        </p>
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
            :avatar="ref.avatar"
            :user-id="ref.id"
            :invites="ref.invites"
            :bonus="ref.bonus"
          />
          <div
            v-if="!referrals.length"
            class="flex flex-col items-center justify-center py-10 text-center text-slate-400"
          >
            <font-awesome-icon icon="fa-solid fa-trophy" class="text-2xl mb-2 opacity-50" />
            <p class="text-[12px] font-medium">Hali referal reytingi yo'q</p>
          </div>
        </div>
      </AdminSectionCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useReferralStore } from '~/stores/referral.store'
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'

definePageMeta({
  layout: 'admin',
})

const referralStore = useReferralStore()
const store = useAdminDashboardStore()

const monthIncome = computed(() => store.data?.monthIncome ?? {
  amount: 0,
  payments: 0,
  total: 0,
})

const navItems = [
  {
    title: 'Haydovchilar',
    subtitle: "Ro'yxat · qidiruv · boshqaruv",
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

const keyStats = computed(() => {
  const s = store.data?.keyStats
  return [
    {
      value: s?.totalDrivers ?? 0,
      label: 'Jami haydovchilar',
      icon: 'fa-solid fa-users',
      tone: 'violet' as const,
    },
    {
      value: s?.newDrivers ?? 0,
      label: 'Yangi haydovchilar',
      icon: 'fa-solid fa-user-plus',
      tone: 'green' as const,
    },
    {
      value: s?.visitsToday ?? 0,
      label: 'Bugungi tashrif',
      icon: 'fa-solid fa-eye',
      tone: 'blue' as const,
    },
    {
      value: s?.yearIncome ?? 0,
      label: 'Yillik daromad',
      icon: 'fa-solid fa-chart-line',
      tone: 'amber' as const,
      compact: true,
    },
  ]
})

const incomeDetails = computed(() => store.data?.incomeDetails ?? [])
const tariffSplit = computed(() => store.data?.tariffSplit ?? [])

const chartTab = ref('payments')
const chartTabs = [
  { label: "To'lovlar", value: 'payments' },
  { label: 'Foyda', value: 'profit' },
]

const chartItems = computed(() => {
  const series = store.data?.chart ?? []
  if (!series.length) {
    return Array.from({ length: 7 }, (_, i) => ({
      label: '—',
      value: 0,
      active: i === 0,
    }))
  }
  const values = series.map((m) =>
    chartTab.value === 'payments' ? m.payments : m.profit
  )
  const maxIdx = values.indexOf(Math.max(...values))
  return series.map((m, i) => ({
    label: m.label,
    value: values[i] ?? 0,
    active: i === maxIdx,
  }))
})

const referrals = computed(() => referralStore.leaderboard)

const onBonus = () => {
  navigateTo('/admin/bonus')
}

onMounted(() => {
  store.fetchStats().catch(() => {})
  referralStore.fetchAll().catch(() => {})
})
</script>
