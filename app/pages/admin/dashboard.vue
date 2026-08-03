<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-5">
    <AdminHeader @bonus="onBonus" />

    <!-- Caption — driver dashboard uslubida -->
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

    <div v-if="store.isLoading && !store.data" class="space-y-3">
      <div class="h-36 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="grid grid-cols-2 gap-2.5">
        <div v-for="n in 4" :key="n" class="h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
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
      <section class="space-y-2.5">
        <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
          Boshqaruv
        </h3>
        <AdminNavItem
          v-for="nav in navItems"
          :key="nav.title"
          :title="nav.title"
          :subtitle="nav.subtitle"
          :icon="nav.icon"
          :tone="nav.tone"
          @click="navigateTo(nav.to)"
        />
      </section>

      <!-- Platforma statistikasi -->
      <section class="space-y-3">
        <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
          Platforma statistikasi
        </h3>
        <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
          <AdminStatCard
            v-for="stat in keyStats"
            :key="stat.label"
            :value="stat.value"
            :label="stat.label"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>
      </section>

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

      <!-- Top referal — har user uchun taklif soni -->
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
    </template>
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
    title: "To'lovlar tarixi",
    subtitle: "Hisob to'ldirish · tarif to'lovlari",
    icon: 'fa-solid fa-receipt',
    tone: 'amber' as const,
    to: '/admin/payments',
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
  {
    title: 'Bot guruhlari',
    subtitle: "Buyurtma e'lon · Web App",
    icon: 'fa-solid fa-bullhorn',
    tone: 'rose' as const,
    to: '/admin/bot-groups',
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
  return [
    {
      value: num(s?.ordersToday, p?.ordersToday),
      label: 'Bugungi buyurtmalar',
      icon: 'fa-solid fa-clipboard-list',
      tone: 'blue' as const,
    },
    {
      value: num(s?.newDriversToday),
      label: "Bugungi qo'shilgan shafyorlar",
      icon: 'fa-solid fa-user-plus',
      tone: 'green' as const,
    },
    {
      value: num(s?.activeDrivers, p?.activeDrivers),
      label: 'Faol shafyorlar',
      icon: 'fa-solid fa-user-check',
      tone: 'emerald' as const,
    },
    {
      value: num(s?.debtorDrivers),
      label: 'Qarzdor shafyorlar',
      icon: 'fa-solid fa-circle-exclamation',
      tone: 'rose' as const,
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

usePullToRefresh(async () => {
  await Promise.all([
    store.fetchStats().catch(() => {}),
    referralStore.fetchAll().catch(() => {}),
    authStore.getMe().catch(() => {}),
  ])
})

onMounted(() => {
  store.fetchStats().catch(() => {})
  referralStore.fetchAll().catch(() => {})
  try {
    const accountStore = useAccountStore()
    accountStore.load()
    if (authStore.user) accountStore.ensureCurrent(authStore.user)
  } catch { /* */ }
})
</script>
