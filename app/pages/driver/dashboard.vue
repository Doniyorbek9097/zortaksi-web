<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-4">
    <!-- Header -->
    <DashboardHeader action-button="download" @download="onDownloadApp" @bonus="onBonus" />

    <!-- Salomlashish -->
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
        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">
          Haydovchi paneli
        </p>
      </div>
    </div>

    <!-- Promo bannerlar -->
    <DashboardBannerCarousel v-if="promoBanners.length" :banners="promoBanners" />

    <!-- Payment banner -->
    <DashboardPaymentBanner v-if="!tariffActive" @action="onBuyTariff" />

    <!-- Balance -->
    <DashboardBalanceCard :balance="balance" :active="tariffActive" @buy="onBuyTariff" />

    <!-- Tarif -->
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

    <!-- Platform statistics -->
    <section
      class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
    >
      <div
        class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-chart-line" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Platforma statistikasi
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Jonli ma'lumotlar
            </p>
          </div>
        </div>
      </div>

      <div class="p-3">
        <div v-if="statsLoading && !statsReady" class="grid grid-cols-2 gap-2">
          <div
            v-for="n in 6"
            :key="n"
            class="h-[88px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        </div>
        <div v-else class="grid grid-cols-2 gap-2">
          <DashboardStatCard
            v-for="stat in stats"
            :key="stat.label"
            :value="stat.value"
            :label="stat.label"
            :icon="stat.icon"
            :color="stat.color"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import type { IBanner } from '~/types/banner'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()

// --- User derived data ---
const firstName = computed(() => authStore.user?.firstName || 'Haydovchi')
const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => authStore.tariffActive)

const promoBanners = ref<IBanner[]>([])
const BANNERS_CACHE_KEY = 'zt:dashboard-banners'

const loadCachedBanners = () => {
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem(BANNERS_CACHE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as IBanner[]
    if (Array.isArray(data)) promoBanners.value = data
  } catch {
    /* */
  }
}

const saveCachedBanners = () => {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(BANNERS_CACHE_KEY, JSON.stringify(promoBanners.value))
  } catch {
    /* */
  }
}

const fetchPromoBanners = async () => {
  try {
    const res = await useApi<{ success: boolean; data: { banners: IBanner[] } }>('/banners')
    if (res?.success && res.data?.banners) {
      promoBanners.value = res.data.banners
      saveCachedBanners()
    }
  } catch {
    /* */
  }
}

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
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const resolveStartedAt = () => {
  const raw = authStore.user?.startedAt
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  // Eski hisoblar: startedAt yo'q — tugash − expireDays
  const end = authStore.user?.tariffExpireAt
  const days = Number(authStore.user?.tariff?.expireDays || 0)
  if (end && days > 0) {
    const e = new Date(end)
    if (!Number.isNaN(e.getTime())) {
      return new Date(e.getTime() - days * 24 * 60 * 60 * 1000)
    }
  }
  return null
}

const tariff = computed(() => {
  const startedAt = resolveStartedAt()
  return {
    name: authStore.user?.tariff?.name || 'Kunlik sinov',
    info: authStore.user?.tariff?.info || '1 - martalik sinov tarifi',
    price: authStore.user?.tariff?.price ?? 5000,
    expireDays: authStore.user?.tariff?.expireDays ?? 1,
    startDate: formatDate(startedAt ?? undefined),
    endDate: formatDate(authStore.user?.tariffExpireAt),
    startedAt,
    expireAt: authStore.user?.tariffExpireAt ?? null,
  }
})

// --- Platform statistics (backend) ---
type StatColor = 'blue' | 'amber' | 'green' | 'violet' | 'emerald' | 'pink'
interface Stat {
  value: number
  label: string
  icon: string
  color: StatColor
}

const platform = ref({
  ordersToday: 0,
  ordersLastHour: 0,
  ordersTotal: 0,
  totalDrivers: 0,
  activeDrivers: 0,
  tariffsCount: 0,
})
const statsLoading = ref(false)
const statsReady = ref(false)

const stats = computed<Stat[]>(() => [
  {
    value: platform.value.ordersToday,
    label: 'Bugungi buyurtmalar',
    icon: 'fa-solid fa-clipboard-list',
    color: 'blue',
  },
  {
    value: platform.value.ordersLastHour,
    label: "So'nggi 1 soat",
    icon: 'fa-solid fa-bolt',
    color: 'amber',
  },
  {
    value: platform.value.ordersTotal,
    label: 'Jami buyurtmalar',
    icon: 'fa-solid fa-chart-line',
    color: 'green',
  },
  {
    value: platform.value.totalDrivers,
    label: 'Jami Haydovchilar',
    icon: 'fa-solid fa-users',
    color: 'violet',
  },
  {
    value: platform.value.activeDrivers,
    label: 'Faol Haydovchilar',
    icon: 'fa-solid fa-user-check',
    color: 'emerald',
  },
  {
    value: platform.value.tariffsCount,
    label: 'Tariflar soni',
    icon: 'fa-solid fa-tags',
    color: 'pink',
  },
])

const STATS_CACHE_KEY = 'zt:dashboard-platform-stats'

const loadCachedStats = () => {
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem(STATS_CACHE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<typeof platform.value>
    platform.value = {
      ordersToday: Number(data.ordersToday || 0),
      ordersLastHour: Number(data.ordersLastHour || 0),
      ordersTotal: Number(data.ordersTotal || 0),
      totalDrivers: Number(data.totalDrivers || 0),
      activeDrivers: Number(data.activeDrivers || 0),
      tariffsCount: Number(data.tariffsCount || 0),
    }
    statsReady.value = true
  } catch {
    /* */
  }
}

const saveCachedStats = () => {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(STATS_CACHE_KEY, JSON.stringify(platform.value))
  } catch {
    /* */
  }
}

const fetchPlatformStats = async (opts?: { background?: boolean }) => {
  if (!opts?.background && !statsReady.value) {
    statsLoading.value = true
  }
  try {
    const res = await useApi('/dashboard/stats')
    if (res?.success && res.data) {
      platform.value = {
        ordersToday: Number(res.data.ordersToday || 0),
        ordersLastHour: Number(res.data.ordersLastHour || 0),
        ordersTotal: Number(res.data.ordersTotal || 0),
        totalDrivers: Number(res.data.totalDrivers || 0),
        activeDrivers: Number(res.data.activeDrivers || 0),
        tariffsCount: Number(res.data.tariffsCount || 0),
      }
      statsReady.value = true
      saveCachedStats()
    }
  } catch (e) {
    console.warn('[Dashboard] stats:', e)
  } finally {
    statsLoading.value = false
  }
}

// --- Actions ---
const onDownloadApp = () => {
  navigateTo('/driver/download-app')
}
const onBonus = () => navigateTo('/driver/bonus')

const onBuyTariff = () => {
  navigateTo('/driver/payment')
}

usePullToRefresh(async () => {
  await Promise.all([
    fetchPlatformStats(),
    fetchPromoBanners(),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  loadCachedStats()
  loadCachedBanners()
  void fetchPlatformStats({ background: statsReady.value })
  void fetchPromoBanners()
})
</script>
