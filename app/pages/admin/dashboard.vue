<template>
  <div class="relative">
    <!-- Premium fon -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-500/10 via-violet-500/5 to-transparent dark:from-sky-500/15 dark:via-indigo-500/10"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -top-20 right-0 w-56 h-56 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/15"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute top-32 -left-16 w-48 h-48 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-5">
      <AdminHeader @bonus="onBonus" />

      <!-- Welcome strip -->
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 shadow-sm"
      >
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25"
        >
          <font-awesome-icon
            :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
            class="text-sm"
          />
        </div>
        <div class="min-w-0">
          <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
            {{ greeting }}, {{ firstName }}!
          </p>
          <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Platforma holati va boshqaruv
          </p>
        </div>
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
      <section class="space-y-3">
        <div class="flex items-center gap-2 px-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
          <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Boshqaruv
          </h3>
        </div>
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

      <!-- Statistika -->
      <section class="space-y-3">
        <div class="flex items-center gap-2 px-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
          <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Jonli statistika
          </h3>
        </div>

        <div
          class="rounded-2xl p-3 sm:p-4 space-y-3 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/50 shadow-lg shadow-slate-200/30 dark:shadow-black/20"
        >
          <div v-if="store.isLoading && !store.isReady" class="space-y-3">
            <div class="grid grid-cols-2 gap-2.5">
              <div class="h-[112px] rounded-2xl bg-slate-100/80 dark:bg-slate-800 animate-pulse" />
              <div class="h-[112px] rounded-2xl bg-slate-100/80 dark:bg-slate-800 animate-pulse" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="n in 4" :key="n" class="h-[56px] rounded-xl bg-slate-100/80 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>

          <template v-else>
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
        </div>
      </section>

      <!-- Hududlar -->
      <AdminSectionCard
        title="Yo'nalishlar"
        icon="fa-solid fa-location-dot"
        icon-tone="amber"
      >
        <div
          v-if="regionDrivers.length"
          class="grid grid-cols-2 gap-2.5 mb-4"
        >
          <div class="rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 dark:from-sky-950/50 dark:to-blue-950/30 border border-sky-200/60 dark:border-sky-900/50 px-3 py-3 text-center">
            <p class="text-2xl font-black text-sky-600 dark:text-sky-400 tabular-nums">
              {{ regionTotalDrivers }}
            </p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Jami</p>
          </div>
          <div class="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-900/50 px-3 py-3 text-center min-w-0">
            <p class="text-[12px] font-black text-amber-600 dark:text-amber-400 truncate leading-snug">
              {{ topRegion?.title || '—' }}
            </p>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Eng ko'p</p>
          </div>
        </div>
        <AdminRegionBarList :items="regionDrivers.slice(0, 6)" />
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
        />
      </AdminSectionCard>

      <!-- Referal -->
      <AdminSectionCard
        title="Top 10 referal"
        icon="fa-solid fa-trophy"
        icon-tone="amber"
        no-padding
      >
        <div class="px-4 pt-2 pb-2 flex items-center gap-3 text-[11px] font-bold text-slate-400">
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-pink-500/10 text-pink-500">
            <font-awesome-icon icon="fa-solid fa-user-plus" />
            {{ totalInvites.toLocaleString('ru-RU') }} taklif
          </span>
          <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/10 text-violet-500">
            <font-awesome-icon icon="fa-solid fa-share-nodes" />
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
