<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-5">
    <AdminHeader @bonus="onBonus" />

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

    <AdminIncomeCard
      :amount="monthIncome.amount"
      :payments="monthIncome.payments"
      :total="monthIncome.total"
      :change-percent="growth?.monthIncomePercent"
    />

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
      {{ store.error }}
    </p>

    <!-- Boshqaruv — grid -->
    <section class="space-y-2.5">
      <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
        Boshqaruv
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <AdminNavGridItem
          v-for="nav in navItems"
          :key="nav.title"
          :title="nav.title"
          :icon="nav.icon"
          :tone="nav.tone"
          @click="navigateTo(nav.to)"
        />
      </div>
    </section>

    <!-- Platforma statistikasi -->
    <section class="space-y-3">
      <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
        Platforma statistikasi
      </h3>
      <div v-if="store.isLoading && !store.isReady" class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>
      <div v-else class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <AdminStatCard
          v-for="stat in keyStats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
          :tone="stat.tone"
          :compact="stat.compact"
          :change="stat.change"
          :change-mode="stat.changeMode"
        />
      </div>
    </section>

    <!-- Yo'nalishlar bo'yicha haydovchilar -->
    <AdminSectionCard title="Yo'nalishlar bo'yicha haydovchilar">
      <AdminRegionBarList :items="regionDrivers" />
    </AdminSectionCard>

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

    <!-- Eng ko'p sotilgan tariflar -->
    <AdminSectionCard title="Eng ko'p sotilgan tariflar">
      <template #action>
        <AdminSegmentTabs v-model="tariffTab" :tabs="tariffTabs" />
      </template>
      <AdminTariffBarList :items="tariffStatsItems" />
    </AdminSectionCard>

    <!-- Oylik statistika -->
    <AdminSectionCard title="Oylik statistika">
      <template #action>
        <AdminSegmentTabs v-model="chartTab" :tabs="chartTabs" />
      </template>
      <AdminBarChart
        :items="chartItems"
        :value-mode="chartTab === 'amount' ? 'amount' : 'number'"
      />
    </AdminSectionCard>

    <!-- Top referal -->
    <AdminSectionCard title="Top 10 referal" no-padding>
      <div class="px-4 pt-1 pb-2 flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <span class="inline-flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-user-plus" class="text-pink-500" />
          Jami taklif: {{ totalInvites.toLocaleString('ru-RU') }}
        </span>
        <span class="text-slate-300 dark:text-slate-600">·</span>
        <span class="inline-flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-violet-500" />
          Taklifchilar: {{ totalReferrers.toLocaleString('ru-RU') }}
        </span>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { useReferralStore } from '~/stores/referral.store'
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'

definePageMeta({
  layout: 'admin',
})

const referralStore = useReferralStore()
const store = useAdminDashboardStore()
const authStore = useAuthStore()

const firstName = computed(() => authStore.user?.firstName || 'Admin')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
})

const isNight = computed(() => /tun|kech/i.test(greeting.value))

const monthIncome = computed(() => store.monthIncome)
const growth = computed(() => store.data?.growth)

const navItems = [
  {
    title: 'Haydovchilar',
    icon: 'fa-solid fa-users',
    tone: 'green' as const,
    to: '/admin/drivers',
  },
  {
    title: "To'lovlar",
    icon: 'fa-solid fa-receipt',
    tone: 'amber' as const,
    to: '/admin/payments',
  },
  {
    title: 'Tariflar',
    icon: 'fa-solid fa-tags',
    tone: 'violet' as const,
    to: '/admin/tariffs',
  },
  {
    title: 'Bannerlar',
    icon: 'fa-solid fa-image',
    tone: 'blue' as const,
    to: '/admin/banners',
  },
  {
    title: 'Bot guruhlari',
    icon: 'fa-solid fa-bullhorn',
    tone: 'rose' as const,
    to: '/admin/bot-groups',
  },
  {
    title: 'Bloklanganlar',
    icon: 'fa-solid fa-ban',
    tone: 'rose' as const,
    to: '/admin/blocked',
  },
]

const num = (...vals: Array<number | undefined | null>) => {
  for (const v of vals) {
    if (v != null && Number.isFinite(Number(v))) return Number(v)
  }
  return 0
}

const totalInvites = computed(() =>
  num(store.data?.keyStats?.totalInvites, store.data?.platform?.totalInvites)
)
const totalReferrers = computed(() =>
  num(store.data?.keyStats?.totalReferrers, store.data?.platform?.totalReferrers)
)

const keyStats = computed(() => {
  const s = store.data?.keyStats
  const p = store.data?.platform
  const g = growth.value
  return [
    {
      value: num(s?.ordersToday, p?.ordersToday),
      label: 'Bugungi buyurtmalar',
      icon: 'fa-solid fa-clipboard-list',
      tone: 'blue' as const,
      change: g?.ordersTodayDelta ?? null,
      changeMode: 'absolute' as const,
    },
    {
      value: num(s?.newDriversToday),
      label: "Bugun qo'shilgan",
      icon: 'fa-solid fa-user-plus',
      tone: 'green' as const,
      change: g?.newDriversTodayDelta ?? null,
      changeMode: 'absolute' as const,
    },
    {
      value: num(s?.activeDrivers, p?.activeDrivers),
      label: 'Faol haydovchilar',
      icon: 'fa-solid fa-user-check',
      tone: 'emerald' as const,
    },
    {
      value: num(s?.totalDrivers, p?.totalDrivers),
      label: 'Jami haydovchilar',
      icon: 'fa-solid fa-users',
      tone: 'violet' as const,
      change: g?.newDriversMonthDelta ?? null,
      changeMode: 'absolute' as const,
    },
    {
      value: num(s?.debtorDrivers),
      label: 'Qarzdorlar',
      icon: 'fa-solid fa-circle-exclamation',
      tone: 'rose' as const,
    },
    {
      value: num(s?.visitsToday),
      label: 'Bugungi tashriflar',
      icon: 'fa-solid fa-eye',
      tone: 'sky' as const,
    },
  ]
})

const regionDrivers = computed(() => store.data?.regionDrivers ?? [])

const incomeDetails = computed(() => store.data?.incomeDetails ?? [])
const tariffSplit = computed(() => store.data?.tariffSplit ?? [])

const tariffTab = ref('month')
const tariffTabs = [
  { label: 'Shu oy', value: 'month' },
  { label: 'Jami', value: 'total' },
]
const tariffStatsItems = computed(() => {
  const stats = store.data?.tariffStats
  if (!stats) return []
  return tariffTab.value === 'month' ? stats.month : stats.total
})

const chartTab = ref('payments')
const chartTabs = [
  { label: "To'lovlar", value: 'payments' },
  { label: 'Daromad', value: 'amount' },
  { label: 'Haydovchilar', value: 'drivers' },
]

const chartItems = computed(() => {
  const series = store.data?.chart ?? []
  if (!series.length) {
    const now = new Date()
  const labels = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
      return {
        label: labels[d.getMonth()],
        value: 0,
        active: i === 6,
      }
    })
  }
  const values = series.map((m) => {
    if (chartTab.value === 'payments') return m.payments
    if (chartTab.value === 'amount') return m.amount
    return m.newDrivers
  })
  const maxIdx = values.reduce(
    (best, v, i) => (v > values[best] ? i : best),
    0
  )
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

usePullToRefresh(async () => {
  await Promise.all([
    store.fetchStats().catch(() => {}),
    referralStore.fetchAll().catch(() => {}),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  store.loadCached()
  void store.fetchStats({ background: store.isReady })
  void referralStore.fetchAll().catch(() => {})
  try {
    const accountStore = useAccountStore()
    accountStore.load()
    if (authStore.user) accountStore.ensureCurrent(authStore.user)
  } catch { /* */ }
})
</script>
