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

    <!-- Boshqaruv -->
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

    <!-- Statistika — aralash dizayn -->
    <section class="space-y-3">
      <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
        Statistika
      </h3>

      <div v-if="store.isLoading && !store.isReady" class="space-y-2.5">
        <div class="grid grid-cols-2 gap-2.5">
          <div class="h-[108px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          <div class="h-[108px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="n in 4" :key="n" class="h-[52px] rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>
      </div>

      <template v-else>
        <!-- Gradient hero -->
        <div class="grid grid-cols-2 gap-2.5">
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

        <!-- Chip grid -->
        <div class="grid grid-cols-2 gap-2">
          <AdminStatChip
            :value="chipStats.newToday"
            label="Yangi bugun"
            icon="fa-solid fa-user-plus"
            tone="green"
            :change="growth?.newDriversTodayDelta"
          />
          <AdminStatChip
            :value="chipStats.total"
            label="Jami haydovchi"
            icon="fa-solid fa-users"
            tone="violet"
            :change="growth?.newDriversMonthDelta"
          />
          <AdminStatChip
            :value="chipStats.debtors"
            label="Qarzdorlar"
            icon="fa-solid fa-circle-exclamation"
            tone="rose"
          />
          <AdminStatChip
            :value="chipStats.visits"
            label="Tashriflar"
            icon="fa-solid fa-eye"
            tone="sky"
          />
        </div>
      </template>
    </section>

    <!-- Hududlar -->
    <AdminSectionCard title="Yo'nalishlar">
      <div
        v-if="regionDrivers.length"
        class="flex gap-2 mb-3 -mt-1"
      >
        <div class="flex-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-3 py-2 text-center">
          <p class="text-lg font-black text-sky-600 dark:text-sky-400 tabular-nums">
            {{ regionTotalDrivers }}
          </p>
          <p class="text-[10px] font-bold text-slate-400">Jami</p>
        </div>
        <div class="flex-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-3 py-2 text-center min-w-0">
          <p class="text-[12px] font-black text-amber-600 dark:text-amber-400 truncate">
            {{ topRegion?.title || '—' }}
          </p>
          <p class="text-[10px] font-bold text-slate-400">Eng ko'p</p>
        </div>
      </div>
      <AdminRegionBarList :items="regionDrivers.slice(0, 6)" />
    </AdminSectionCard>

    <!-- Tariflar -->
    <AdminSectionCard title="Eng ko'p sotilgan tariflar">
      <template #action>
        <AdminSegmentTabs v-model="tariffTab" :tabs="tariffTabs" />
      </template>
      <AdminTariffRankGrid :items="tariffStatsItems" />
    </AdminSectionCard>

    <!-- Oylik trend -->
    <AdminSectionCard title="Oylik trend">
      <template #action>
        <AdminSegmentTabs v-model="chartTab" :tabs="chartTabs" />
      </template>
      <AdminMonthlyTrendChart
        :items="chartItems"
        :value-mode="chartTab === 'amount' ? 'amount' : 'number'"
      />
    </AdminSectionCard>

    <!-- Referal -->
    <AdminSectionCard title="Top 10 referal" no-padding>
      <div class="px-4 pt-1 pb-2 flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <span class="inline-flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-user-plus" class="text-pink-500" />
          Taklif: {{ totalInvites.toLocaleString('ru-RU') }}
        </span>
        <span class="text-slate-300 dark:text-slate-600">·</span>
        <span class="inline-flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-share-nodes" class="text-violet-500" />
          {{ totalReferrers.toLocaleString('ru-RU') }} kishi
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
const topRegion = computed(() => regionDrivers.value[0] ?? null)

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
      }
    })
  }
  return series.map((m) => ({
    label: m.label,
    value:
      chartTab.value === 'payments'
        ? m.payments
        : chartTab.value === 'amount'
          ? m.amount
          : m.newDrivers,
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
