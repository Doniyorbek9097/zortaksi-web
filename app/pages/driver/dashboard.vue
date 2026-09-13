<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <DashboardHeader action-button="download" @download="onDownloadApp" @help="onHelp" />

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

    <DashboardPaymentBanner v-if="!tariffActive" @action="onBuyTariff" />

    <DashboardBalanceCard
      :balance="balance"
      :active="tariffActive"
      :banners="promoBanners"
      @buy="onBuyTariff"
    />

    <DashboardTariffCard
      :name="tariff.name"
      :info="tariff.info"
      :price="tariff.price"
      :expire-days="tariff.expireDays"
      :start-date="tariff.startDate"
      :end-date="tariff.endDate"
      :started-at="tariff.startedAt"
      :expire-at="tariff.expireAt"
      :active="tariffActive"
      @buy="onBuyTariff"
    />

    <DashboardPostStatsCard
      v-if="showPostCampaignCard"
      :campaign="activePostCampaign"
      :busy-id="postStore.campaignBusyId"
      :loading="postStatsLoading && !activePostCampaign"
      @start="startCampaign"
      @stop="stopCampaign"
      @delete="deleteCampaign"
    />

    <DashboardPlatformStatsSection
      :stats="platformStats"
      :loading="statsLoading"
      :ready="statsReady"
    />

    <DashboardGroupInviteLeaderboardCard
      :data="groupInviteLeaderboard"
      :loading="groupInviteLoading"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Haydovchi asosiy sahifa — balans, tarif, statistika, TOP 10.
 */
import DashboardPostStatsCard from '~/components/dashboard/PostStatsCard.vue'
import { useDriverTariffCard } from '~/composables/dashboard/useDriverTariffCard'
import { usePlatformStats } from '~/composables/dashboard/usePlatformStats'
import { usePromoBanners } from '~/composables/dashboard/usePromoBanners'
import { useGroupInviteLeaderboard } from '~/composables/dashboard/useGroupInviteLeaderboard'
import { useDriverPostCampaign } from '~/composables/dashboard/useDriverPostCampaign'
import { useAuthStore } from '~/stores/auth.store'
import { openDriverSupportChatInstant } from '~/utils/openSupportChat'

definePageMeta({ layout: 'driver' })

const authStore = useAuthStore()

const { liveDateTimeLabel, greeting, isNight } = useLiveDateTime()
const { tariff, tariffActive, balance, firstName } = useDriverTariffCard()

const { banners: promoBanners, hydrateFromCache: hydrateBanners, fetchBanners } = usePromoBanners()
const {
  stats: platformStats,
  loading: statsLoading,
  ready: statsReady,
  hydrateFromCache: hydrateStats,
  fetchStats: fetchPlatformStats,
} = usePlatformStats()

const {
  data: groupInviteLeaderboard,
  loading: groupInviteLoading,
  hydrateFromCache: hydrateGroupInvite,
  fetchLeaderboard: fetchGroupInviteLeaderboard,
} = useGroupInviteLeaderboard({
  cacheKey: 'zt:dashboard-group-invite-lb',
  requireActiveTariff: true,
  tariffActive: () => tariffActive.value,
})

const {
  postStore,
  loading: postStatsLoading,
  activeCampaign: activePostCampaign,
  showCard: showPostCampaignCard,
  startCampaign,
  stopCampaign,
  deleteCampaign,
  loadCampaign,
  startPolling,
  stopPolling,
} = useDriverPostCampaign()

const onDownloadApp = () => navigateTo('/driver/download-app')
const onHelp = () => openDriverSupportChatInstant()
const onBuyTariff = () => navigateTo('/driver/payment')

usePullToRefresh(async () => {
  await Promise.all([
    fetchPlatformStats(),
    fetchBanners(),
    fetchGroupInviteLeaderboard({ background: true }),
    postStore.refreshCampaignData(),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  postStore.hydrateActiveCampaignCache()
  hydrateStats()
  hydrateBanners()
  hydrateGroupInvite()
  void fetchPlatformStats({ background: statsReady.value })
  void fetchBanners()
  void fetchGroupInviteLeaderboard({ background: !!groupInviteLeaderboard.value })
  void loadCampaign()
  startPolling()
})

onBeforeUnmount(stopPolling)
</script>
