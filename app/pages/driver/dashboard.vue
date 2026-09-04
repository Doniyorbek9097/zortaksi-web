<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2 space-y-5">
    <!-- Header -->
    <DashboardHeader @bonus="onBonus" />

    <!-- Caption — header emas, sahifa ichida -->
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
    <section class="space-y-3">
      <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
        Platforma statistikasi
      </h3>
      <div v-if="statsLoading && !statsReady" class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>
      <div v-else class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <DashboardStatCard
          v-for="stat in stats"
          :key="stat.label"
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
          :color="stat.color"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({
  layout: 'driver',
})

const authStore = useAuthStore()

// --- User derived data ---
const firstName = computed(() => authStore.user?.firstName || 'Haydovchi')
const balance = computed(() => authStore.user?.balance ?? 0)
const tariffActive = computed(() => authStore.tariffActive)

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
const onBonus = () => {
  navigateTo('/driver/bonus')
}

const onBuyTariff = () => {
  navigateTo('/driver/payment')
}

usePullToRefresh(async () => {
  await Promise.all([
    fetchPlatformStats(),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  loadCachedStats()
  void fetchPlatformStats({ background: statsReady.value })
})
</script>
