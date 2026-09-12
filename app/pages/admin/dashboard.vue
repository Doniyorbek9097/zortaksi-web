<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <AdminHeader action-button="download" @download="onDownloadApp" @bonus="onBonus" />

    <div class="flex items-center gap-2 px-1">
      <font-awesome-icon
        :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
        class="text-xs shrink-0"
        :class="isNight ? 'text-indigo-400' : 'text-amber-500'"
      />
      <div class="min-w-0">
        <p class="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">
          {{ greeting }}, {{ firstName }}!
        </p>
        <p class="text-[13px] font-bold tabular-nums text-slate-600 dark:text-slate-300 truncate">
          {{ liveDateTimeLabel }}
        </p>
      </div>
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
      :click-amount="monthIncome.clickAmount"
      :click-payments="monthIncome.clickPayments"
      :card-amount="monthIncome.cardAmount"
      :card-payments="monthIncome.cardPayments"
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

    <!-- E'lonlar — ixcham -->
    <button
      v-if="driverPosts"
      type="button"
      class="w-full rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-900 p-3 text-left active:scale-[0.99] transition-transform"
      @click="navigateTo('/admin/driver-posts')"
    >
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-sm" />
          </span>
          <div>
            <p class="text-[12px] font-black text-slate-900 dark:text-white">E'lon joylash</p>
            <p class="text-[10px] font-semibold text-slate-400">{{ driverPosts.activeCampaigns }} faol · {{ driverPosts.totalCampaigns }} jami</p>
          </div>
        </div>
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px] text-slate-300" />
      </div>
      <div class="grid grid-cols-3 gap-1.5">
        <div class="rounded-lg bg-white/80 dark:bg-slate-950/50 px-2 py-1.5 text-center border border-slate-100 dark:border-slate-800">
          <p class="text-[13px] font-black text-violet-600 tabular-nums">{{ driverPosts.estimatedSendsPerDay }}</p>
          <p class="text-[8px] font-bold text-slate-400 uppercase">Kunlik</p>
        </div>
        <div class="rounded-lg bg-white/80 dark:bg-slate-950/50 px-2 py-1.5 text-center border border-slate-100 dark:border-slate-800">
          <p class="text-[13px] font-black text-emerald-600 tabular-nums">{{ driverPosts.activeCampaigns }}</p>
          <p class="text-[8px] font-bold text-slate-400 uppercase">Play</p>
        </div>
        <div class="rounded-lg bg-white/80 dark:bg-slate-950/50 px-2 py-1.5 text-center border border-slate-100 dark:border-slate-800">
          <p class="text-[13px] font-black text-amber-600 tabular-nums">{{ driverPosts.uniqueDrivers }}</p>
          <p class="text-[8px] font-bold text-slate-400 uppercase">Driver</p>
        </div>
      </div>
      <div v-if="driverPosts.topDrivers?.length" class="mt-2 space-y-1">
        <p class="text-[9px] font-black uppercase tracking-wide text-slate-400 px-0.5">Eng ko'p yuk</p>
        <div
          v-for="row in driverPosts.topDrivers.slice(0, 3)"
          :key="row.userId"
          class="flex items-center gap-2 text-[11px]"
        >
          <img
            v-if="driverAvatar(row.owner)"
            :src="driverAvatar(row.owner)"
            alt=""
            class="w-5 h-5 rounded-full object-cover shrink-0 bg-slate-200"
            @error="brokenDriverAvatars.add(row.userId)"
          >
          <span
            v-else
            class="w-5 h-5 rounded-full shrink-0 bg-sky-100 text-sky-600 flex items-center justify-center text-[8px] font-black"
          >
            {{ row.owner.name.charAt(0) || '?' }}
          </span>
          <span class="font-bold text-slate-700 dark:text-slate-200 truncate flex-1">{{ row.owner.name }}</span>
          <span class="font-black text-rose-500 tabular-nums shrink-0">{{ row.sendsPerDay }}/kun</span>
        </div>
      </div>
    </button>

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

    <!-- Guruhlar daromadi -->
    <AdminSectionCard
      title="Guruhlar daromadi"
      icon="fa-solid fa-coins"
      icon-tone="emerald"
      header-subtitle="Oylik trend"
    >
      <AdminRegionIncomeTrendChart :chart="regionIncomeChart" />
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

    <!-- Guruh taklifi TOP 10 -->
    <DashboardGroupInviteLeaderboardCard
      admin-mode
      :show-me="false"
      :show-join-button="false"
      :data="groupInviteLeaderboard"
      :loading="groupInviteLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import { isAdminUser } from '~/utils/userRole'
import type { GroupInviteLeaderboardData } from '~/types/group-invite'

definePageMeta({
  layout: 'admin',
})

const store = useAdminDashboardStore()
const authStore = useAuthStore()
const { avatarUrl } = useMediaUrl()
const brokenDriverAvatars = ref<Set<string>>(new Set())

const driverAvatar = (owner: { avatar?: string; userId: string }) => {
  if (brokenDriverAvatars.value.has(owner.userId)) return undefined
  return avatarUrl(owner.avatar, owner.userId)
}
const isMainAdmin = computed(() => isAdminUser(authStore.user))

const groupInviteLeaderboard = ref<GroupInviteLeaderboardData | null>(null)
const groupInviteLoading = ref(false)
const GROUP_INVITE_CACHE_KEY = 'zt:admin-group-invite-lb'

const firstName = computed(() => authStore.user?.firstName || 'Admin')

const { liveDateTimeLabel, greeting, isNight } = useLiveDateTime()

const monthIncome = computed(() => store.monthIncome)
const todayIncome = computed(() => store.data?.todayIncome ?? { amount: 0, payments: 0, total: 0 })
const weekIncome = computed(() => store.data?.weekIncome ?? { amount: 0, payments: 0, total: 0 })
const growth = computed(() => store.data?.growth)
const driverPosts = computed(() => store.data?.driverPosts ?? null)

const navItems = computed(() => {
  const items = [
    { title: 'Haydovchilar', icon: 'fa-solid fa-users', tone: 'green' as const, to: '/admin/drivers' },
    { title: "To'lovlar", icon: 'fa-solid fa-receipt', tone: 'amber' as const, to: '/admin/payments' },
    { title: 'Tariflar', icon: 'fa-solid fa-tags', tone: 'violet' as const, to: '/admin/tariffs' },
    { title: 'E\'lonlar', icon: 'fa-solid fa-bullhorn', tone: 'amber' as const, to: '/admin/driver-posts' },
    { title: 'Bot guruhlari', icon: 'fa-solid fa-bullhorn', tone: 'rose' as const, to: '/admin/bot-groups' },
    { title: 'Bloklanganlar', icon: 'fa-solid fa-ban', tone: 'rose' as const, to: '/admin/blocked' },
  ]
  if (isMainAdmin.value) {
    items.splice(3, 0, { title: 'Bannerlar', icon: 'fa-solid fa-image', tone: 'blue' as const, to: '/admin/banners' })
  }
  return items
})

const num = (...vals: Array<number | undefined | null>) => {
  for (const v of vals) {
    if (v != null && Number.isFinite(Number(v))) return Number(v)
  }
  return 0
}

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

const regionIncomeChart = computed(() => store.data?.regionIncomeChart ?? null)

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

const loadCachedGroupInvite = () => {
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem(GROUP_INVITE_CACHE_KEY)
    if (!raw) return
    groupInviteLeaderboard.value = JSON.parse(raw) as GroupInviteLeaderboardData
  } catch {
    /* */
  }
}

const saveCachedGroupInvite = () => {
  if (!import.meta.client || !groupInviteLeaderboard.value) return
  try {
    sessionStorage.setItem(GROUP_INVITE_CACHE_KEY, JSON.stringify(groupInviteLeaderboard.value))
  } catch {
    /* */
  }
}

const fetchGroupInviteLeaderboard = async (opts?: { background?: boolean }) => {
  if (!opts?.background && !groupInviteLeaderboard.value) {
    groupInviteLoading.value = true
  }
  try {
    const res = await useApi<{ success: boolean; data: GroupInviteLeaderboardData }>(
      '/group-invite/leaderboard',
    )
    if (res?.success && res.data) {
      groupInviteLeaderboard.value = res.data
      saveCachedGroupInvite()
    }
  } catch {
    /* */
  } finally {
    groupInviteLoading.value = false
  }
}

const onDownloadApp = () => navigateTo('/admin/download-app')
const onBonus = () => navigateTo('/admin/bonus')

usePullToRefresh(async () => {
  await Promise.all([
    store.fetchStats().catch(() => {}),
    fetchGroupInviteLeaderboard({ background: true }),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  store.loadCached()
  loadCachedGroupInvite()
  void store.fetchStats({ background: store.isReady })
  void fetchGroupInviteLeaderboard({ background: !!groupInviteLeaderboard.value })
  try {
    const accountStore = useAccountStore()
    accountStore.load()
    if (authStore.user) accountStore.ensureCurrent(authStore.user)
  } catch { /* */ }
})
</script>
