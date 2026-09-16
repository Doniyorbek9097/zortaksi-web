<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <AdminHeader action-button="download" @download="onDownloadApp" @bonus="onBonus" />

    <!-- Salomlashish va vaqt -->
    <div
      class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80"
    >
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-sm"
        :class="isNight ? 'bg-indigo-500 text-white' : 'bg-amber-400 text-white'"
      >
        <font-awesome-icon :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'" />
      </div>
      <div class="min-w-0">
        <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">
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
      :total-days="monthIncome.totalDays"
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
            <p class="text-[12px] font-black text-slate-900 dark:text-white">Saqlangan e'lonlar</p>
            <p class="text-[10px] font-semibold text-slate-400">{{ driverPosts.activeCampaigns }} faol · {{ driverPosts.totalCampaigns }} jami · 10 tadan</p>
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
    <section
      class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
    >
      <div
        class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/90 via-cyan-50/50 to-emerald-50/40 dark:from-sky-950/25 dark:via-cyan-950/15 dark:to-emerald-950/15"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-xs shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-signal" />
          </div>
          <div class="min-w-0">
            <p class="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Jonli statistika
            </p>
            <p class="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Real vaqt ko'rsatkichlari
            </p>
          </div>
        </div>
      </div>

      <div class="p-2.5">
        <div v-if="store.isLoading && !store.isReady" class="grid grid-cols-2 gap-1.5">
          <div
            v-for="n in 6"
            :key="n"
            class="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        </div>

        <div v-else class="grid grid-cols-2 gap-1.5">
          <AdminStatHero
            :value="heroStats.orders"
            label="Buyurtma (bugun)"
            icon="fa-solid fa-clipboard-list"
            tone="sky"
            :change="growth?.ordersTodayDelta"
          />
          <AdminStatHero
            :value="heroStats.active"
            label="Faol haydovchi"
            icon="fa-solid fa-user-check"
            tone="emerald"
          />
          <AdminStatChip
            :value="chipStats.newToday"
            label="Yangi (bugun)"
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
            label="Qarzdor"
            icon="fa-solid fa-circle-exclamation"
            tone="rose"
          />
          <AdminStatChip
            :value="chipStats.visits"
            label="Tashrif (bugun)"
            icon="fa-solid fa-eye"
            tone="sky"
          />
        </div>
      </div>
    </section>

    <AdminServerResourceStats
      :stats="serverStats"
      :loading="serverResourcesLoading"
      :maintaining="serverMaintaining"
      :maintenance-message="serverMaintenanceMessage"
      :error="serverResourcesError"
      @maintenance="onServerMaintenance"
    />

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

    <!-- Oylik trend — 7 kunlikdan keyin -->
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
/**
 * Admin asosiy sahifa — daromad, statistika, trend grafiklar.
 */
import { useAdminDashboardStore } from '~/stores/adminDashboard.store'
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import { useAdminDashboardStats } from '~/composables/dashboard/useAdminDashboardStats'
import { useAdminChartData } from '~/composables/dashboard/useAdminChartData'
import { useGroupInviteLeaderboard } from '~/composables/dashboard/useGroupInviteLeaderboard'
import { useServerResources } from '~/composables/dashboard/useServerResources'

definePageMeta({ layout: 'admin' })

const store = useAdminDashboardStore()
const authStore = useAuthStore()
const { avatarUrl } = useMediaUrl()
const brokenDriverAvatars = ref<Set<string>>(new Set())

const driverAvatar = (owner: { avatar?: string; userId: string }) => {
  if (brokenDriverAvatars.value.has(owner.userId)) return undefined
  return avatarUrl(owner.avatar, owner.userId)
}

const firstName = computed(() => authStore.user?.firstName || 'Admin')
const { liveDateTimeLabel, greeting, isNight } = useLiveDateTime()

const {
  monthIncome,
  todayIncome,
  weekIncome,
  growth,
  driverPosts,
  regionIncomeChart,
  navItems,
  heroStats,
  chipStats,
  tariffTab,
  tariffTabs,
  tariffStatsItems,
} = useAdminDashboardStats(store)

const {
  chartTab,
  chartTabs,
  chartSelectedTitle,
  chartItems,
  incomeDailyItems,
} = useAdminChartData(store)

const {
  stats: serverStats,
  loading: serverResourcesLoading,
  maintaining: serverMaintaining,
  maintenanceMessage: serverMaintenanceMessage,
  error: serverResourcesError,
  refresh: refreshServerResources,
  runMaintenance: runServerMaintenance,
} = useServerResources(3000)

const onServerMaintenance = async () => {
  try {
    await runServerMaintenance()
  } catch {
    /* xato composable ichida */
  }
}

const {
  data: groupInviteLeaderboard,
  loading: groupInviteLoading,
  hydrateFromCache: hydrateGroupInvite,
  fetchLeaderboard: fetchGroupInviteLeaderboard,
} = useGroupInviteLeaderboard({
  cacheKey: 'zt:admin-group-invite-lb',
})

const onDownloadApp = () => navigateTo('/admin/download-app')
const onBonus = () => navigateTo('/admin/bonus')

usePullToRefresh(async () => {
  await Promise.all([
    store.fetchStats().catch(() => {}),
    refreshServerResources().catch(() => {}),
    fetchGroupInviteLeaderboard({ background: true }),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  store.loadCached()
  hydrateGroupInvite()
  void store.fetchStats({ background: store.isReady })
  void fetchGroupInviteLeaderboard({ background: !!groupInviteLeaderboard.value })

  try {
    const accountStore = useAccountStore()
    accountStore.load()
    if (authStore.user) accountStore.ensureCurrent(authStore.user)
  } catch {
    /* */
  }
})
</script>
