<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <AdminHeader @bonus="onBonus" />

    <div class="flex items-center gap-2 px-1">
      <font-awesome-icon
        :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
        class="text-xs shrink-0"
        :class="isNight ? 'text-indigo-400' : 'text-amber-500'"
      />
      <p class="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">
        {{ greeting }}, {{ firstName }}!
      </p>
    </div>

    <AdminIncomeCard
      :amount="monthIncome.amount"
      :payments="monthIncome.payments"
      :total="monthIncome.total"
      :change-percent="growth?.monthIncomePercent"
      :today-amount="todayIncome.amount"
      :today-payments="todayIncome.payments"
      :week-amount="weekIncome.amount"
      :week-payments="weekIncome.payments"
    />

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
      {{ store.error }}
    </p>

    <!-- Boshqaruv -->
    <AdminSectionCard
      title="Boshqaruv"
      icon="fa-solid fa-house"
      icon-tone="sky"
      no-padding
    >
      <div class="grid grid-cols-2 gap-1.5 p-2.5">
        <AdminNavGridItem
          v-for="nav in navItems"
          :key="nav.title"
          :title="nav.title"
          :icon="nav.icon"
          :tone="nav.tone"
          @click="navigateTo(nav.to)"
        />
      </div>
    </AdminSectionCard>

    <!-- Jonli statistika -->
    <section class="space-y-2">
      <h3 class="text-[11px] font-black uppercase tracking-wide text-slate-400 px-0.5">
        Jonli statistika
      </h3>

      <div v-if="store.isLoading && !store.isReady" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="h-[88px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div class="h-[88px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="n in 4" :key="n" class="h-[52px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-2 gap-2">
          <AdminStatHero
            :value="heroStats.orders"
            label="Bugungi buyurtmalar"
            icon="fa-solid fa-clipboard-list"
            tone="sky"
            :change="growth?.ordersTodayDelta"
          />
          <AdminStatHero
            :value="heroStats.active"
            label="Faol haydovchilar"
            icon="fa-solid fa-user-check"
            tone="emerald"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <AdminStatChip
            :value="chipStats.newToday"
            label="Bugun qo'shilgan"
            icon="fa-solid fa-user-plus"
            tone="green"
            :change="growth?.newDriversTodayDelta"
          />
          <AdminStatChip
            :value="chipStats.total"
            label="Jami haydovchilar"
            icon="fa-solid fa-users"
            tone="violet"
            :change="growth?.newDriversMonthDelta"
          />
          <AdminStatChip
            :value="chipStats.debtors"
            label="Qarzdor haydovchilar"
            icon="fa-solid fa-circle-exclamation"
            tone="rose"
          />
          <AdminStatChip
            :value="chipStats.visits"
            label="Bugungi tashriflar"
            icon="fa-solid fa-eye"
            tone="sky"
          />
        </div>
      </template>
    </section>

    <!-- Yo'nalishlar -->
    <AdminSectionCard
      title="Yo'nalishlar"
      icon="fa-solid fa-location-dot"
      icon-tone="amber"
      :header-value="regionHeaderValue"
    >
      <AdminRegionBarList :items="regionDrivers.slice(0, 6)" />
    </AdminSectionCard>

    <!-- 7 kunlik daromad -->
    <AdminSectionCard
      title="7 kunlik daromad"
      icon="fa-solid fa-chart-line"
      icon-tone="emerald"
    >
      <AdminMonthlyTrendChart
        :items="incomeDailyItems"
        value-mode="amount"
        selected-title="Kun"
      />
    </AdminSectionCard>

    <!-- Tariflar -->
    <AdminSectionCard
      title="Eng ko'p sotilgan tariflar"
      icon="fa-solid fa-tags"
      icon-tone="violet"
    >
      <template #action>
        <AdminSegmentTabs v-model="tariffTab" :tabs="tariffTabs" />
      </template>
      <AdminTariffRankGrid :items="tariffStatsItems" />
    </AdminSectionCard>

    <!-- Oylik trend -->
    <AdminSectionCard
      title="Oylik trend"
      icon="fa-solid fa-chart-line"
      icon-tone="sky"
    >
      <template #action>
        <AdminSegmentTabs v-model="chartTab" :tabs="chartTabs" />
      </template>
      <AdminMonthlyTrendChart
        :items="chartItems"
        :value-mode="chartTab === 'amount' ? 'amount' : 'number'"
        :selected-title="chartSelectedTitle"
      />
    </AdminSectionCard>

    <!-- Referal -->
    <AdminSectionCard
      title="Top 10 referal"
      icon="fa-solid fa-trophy"
      icon-tone="amber"
      no-padding
    >
      <div class="px-4 pt-2 pb-2 flex flex-wrap gap-2 text-[11px] font-bold">
        <span class="text-pink-500">{{ totalInvites.toLocaleString('ru-RU') }} taklif</span>
        <span class="text-slate-300 dark:text-slate-600">·</span>
        <span class="text-violet-500">{{ totalReferrers.toLocaleString('ru-RU') }} taklifchi</span>
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
          class="flex flex-col items-center justify-center py-8 text-center text-slate-400"
        >
          <font-awesome-icon icon="fa-solid fa-trophy" class="text-xl mb-2 opacity-50" />
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
const todayIncome = computed(() => store.data?.todayIncome ?? { amount: 0, payments: 0, total: 0 })
const weekIncome = computed(() => store.data?.weekIncome ?? { amount: 0, payments: 0, total: 0 })
const growth = computed(() => store.data?.growth)

const navItems = [
  { title: 'Haydovchilar', icon: 'fa-solid fa-users', tone: 'green' as const, to: '/admin/drivers' },
  { title: "To'lovlar", icon: 'fa-solid fa-receipt', tone: 'amber' as const, to: '/admin/payments' },
  { title: 'Tariflar', icon: 'fa-solid fa-tags', tone: 'violet' as const, to: '/admin/tariffs' },
  { title: 'Bannerlar', icon: 'fa-solid fa-image', tone: 'blue' as const, to: '/admin/banners' },
  { title: 'Bot guruhlari', icon: 'fa-solid fa-bullhorn', tone: 'rose' as const, to: '/admin/bot-groups' },
  { title: 'Bloklanganlar', icon: 'fa-solid fa-ban', tone: 'rose' as const, to: '/admin/blocked' },
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

const heroStats = computed(() => {
  const s = store.data?.keyStats
  const p = store.data?.platform
  return {
    orders: num(s?.ordersToday, p?.ordersToday),
    active: num(s?.activeDrivers, p?.activeDrivers),
  }
})

const chipStats = computed(() => {
  const s = store.data?.keyStats
  const p = store.data?.platform
  return {
    newToday: num(s?.newDriversToday),
    total: num(s?.totalDrivers, p?.totalDrivers),
    debtors: num(s?.debtorDrivers),
    visits: num(s?.visitsToday),
  }
})

const regionDrivers = computed(() => store.data?.regionDrivers ?? [])
const regionTotalDrivers = computed(() =>
  regionDrivers.value.reduce((sum, r) => sum + r.count, 0)
)
const regionHeaderValue = computed(() =>
  regionTotalDrivers.value > 0
    ? `${regionTotalDrivers.value.toLocaleString('ru-RU')} jami`
    : ''
)

const tariffTab = ref('month')
const tariffTabs = [
  { label: 'Shu oy', value: 'month' },
  { label: 'Jami', value: 'total' },
]
const tariffStatsItems = computed(() => {
  const stats = store.data?.tariffStats
  if (!stats) return []
  const list = tariffTab.value === 'month' ? stats.month : stats.total
  return list.slice(0, 5)
})

const chartTab = ref('payments')
const chartTabs = [
  { label: "To'lov", value: 'payments' },
  { label: 'Daromad', value: 'amount' },
  { label: 'Driver', value: 'drivers' },
]

const MONTH_FULL_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

/** Hafta kunlari (0=Yakshanba) */
const WEEKDAY_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pash', 'Jum', 'Sham']

const chartSelectedTitle = computed(() => {
  if (chartTab.value === 'payments') return "To'lovlar"
  if (chartTab.value === 'amount') return 'Daromad'
  return 'Haydovchilar'
})

const chartItems = computed(() => {
  const series = store.data?.chart ?? []
  const now = new Date()
  if (!series.length) {
    const labels = ['YAN', 'FEV', 'MAR', 'APR', 'MAY', 'IYN', 'IYL', 'AVG', 'SEN', 'OKT', 'NOY', 'DEK']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
      return {
        label: labels[d.getMonth()],
        detail: `${MONTH_FULL_UZ[d.getMonth()]} ${d.getFullYear()}`,
        value: 0,
      }
    })
  }
  return series.map((m, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (series.length - 1 - i), 1)
    return {
      label: m.label,
      detail: `${MONTH_FULL_UZ[d.getMonth()]} ${d.getFullYear()}`,
      value:
        chartTab.value === 'payments'
          ? m.payments
          : chartTab.value === 'amount'
            ? m.amount
            : m.newDrivers,
    }
  })
})

const incomeDailyItems = computed(() => {
  const series = store.data?.incomeDailyChart ?? []
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return series.map((d, i) => {
    const date = new Date(todayStart.getTime() - (series.length - 1 - i) * 86400000)
    const wd = date.getDay()
    return {
      label: WEEKDAY_SHORT[wd],
      detail: d.label,
      value: d.amount,
    }
  })
})

const referrals = computed(() => referralStore.leaderboard)

const onBonus = () => navigateTo('/admin/bonus')

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
