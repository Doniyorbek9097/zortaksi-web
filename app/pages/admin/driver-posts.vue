<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 space-y-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="navigateTo('/admin/dashboard')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
        </button>
        <h1 class="text-base font-black text-slate-900 dark:text-white">E'lonlar</h1>
      </div>
      <AdminSegmentTabs v-model="filter" :tabs="filterTabs" />
    </header>

    <div v-if="stats" class="grid grid-cols-2 gap-2">
      <AdminStatChip
        :value="stats.totalCampaigns"
        label="Saqlangan xabarlar"
        icon="fa-solid fa-inbox"
        tone="sky"
      />
      <AdminStatChip
        :value="stats.activeCampaigns"
        label="Faol (play)"
        icon="fa-solid fa-play"
        tone="emerald"
      />
      <AdminStatChip
        :value="stats.pausedCampaigns"
        label="To'xtatilgan"
        icon="fa-solid fa-pause"
        tone="amber"
      />
      <AdminStatChip
        :value="stats.estimatedSendsPerDay"
        label="Kunlik yuborish (taxmin)"
        icon="fa-solid fa-paper-plane"
        tone="violet"
      />
    </div>

    <AdminSectionCard
      v-if="stats?.topDrivers?.length"
      title="Eng ko'p resurs sarflayotgan haydovchilar"
      icon="fa-solid fa-gauge-high"
      icon-tone="rose"
      no-padding
    >
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <button
          v-for="row in stats.topDrivers"
          :key="row.userId"
          type="button"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          @click="filterByDriver(row.userId)"
        >
          <span class="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-[11px] font-black shrink-0">
            {{ row.sendsPerDay }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
              {{ row.owner.name }}
            </p>
            <p class="text-[10px] font-semibold text-slate-400 truncate">
              {{ row.activeCampaigns }} faol · {{ row.totalGroups }} guruh · kuniga ~{{ row.sendsPerDay }} yuborish
            </p>
          </div>
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px] text-slate-300 shrink-0" />
        </button>
      </div>
    </AdminSectionCard>

    <AdminDriversSearchInput v-model="search" placeholder="Haydovchi, nom yoki matn..." />

    <p v-if="driverFilter" class="text-[11px] font-bold text-sky-600 dark:text-sky-400 px-1">
      Filtr: haydovchi {{ driverFilter }}
      <button type="button" class="underline ml-1" @click="clearDriverFilter">Tozalash</button>
    </p>

    <div v-if="store.isLoading && !store.items.length" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <BaseEmptyState
      v-else-if="!store.items.length"
      icon="fa-solid fa-bullhorn"
      title="Saqlangan e'lon topilmadi"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <article
        v-for="c in store.items"
        :key="c.id"
        class="rounded-2xl border p-3 space-y-2.5 transition-colors"
        :class="c.active
          ? 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-[13px] font-black text-slate-900 dark:text-white truncate">
                {{ c.name }}
              </h3>
              <span
                class="shrink-0 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                :class="c.active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'"
              >
                {{ c.active ? 'Play' : 'Pause' }}
              </span>
              <span
                class="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                :class="c.mode === 'mine' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ c.mode === 'mine' ? 'Meniki' : 'Boshqalar' }}
              </span>
            </div>

            <button
              type="button"
              class="mt-1 text-left text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate block w-full"
              @click="openDriver(c.userId)"
            >
              {{ c.owner.name }}
              <span v-if="c.owner.phone" class="text-slate-400 font-semibold"> · {{ c.owner.phone }}</span>
            </button>

            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
              {{ c.textPreview }}
            </p>

            <p class="text-[10px] font-semibold text-slate-400 mt-1.5">
              {{ c.groupCount }} guruh · har {{ c.intervalMin }} daqiqa
              <span v-if="c.active"> · kuniga ~{{ c.sendsPerDay }} yuborish</span>
            </p>

            <p v-if="c.lastRunAt" class="text-[10px] text-slate-400 mt-0.5">
              Oxirgi: {{ formatDate(c.lastRunAt) }} — {{ c.lastSent }} ok, {{ c.lastFailed }} xato
              <span v-if="c.lastCharged"> · {{ formatMoney(c.lastCharged) }}</span>
            </p>
            <p v-if="c.lastError" class="text-[10px] font-bold text-rose-500 mt-1">
              {{ c.lastError }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-if="c.active"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-rose-600 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 active:scale-95 disabled:opacity-50"
            :disabled="store.isSaving"
            @click="onStop(c)"
          >
            <font-awesome-icon
              :icon="store.isSaving ? 'fa-solid fa-spinner' : 'fa-solid fa-pause'"
              :class="store.isSaving ? 'animate-spin' : ''"
              class="text-[9px]"
            />
            To'xtatish
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-sky-600 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5 active:scale-95"
            @click="openDriver(c.userId)"
          >
            <font-awesome-icon icon="fa-solid fa-user" class="text-[9px]" />
            Haydovchi
          </button>
        </div>
      </article>

      <div ref="sentinel" class="h-1" />
      <p
        v-if="!store.hasMore && store.items.length"
        class="py-3 text-center text-[12px] font-bold text-slate-400"
      >
        — Hammasi yuklandi —
      </p>
    </div>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">{{ store.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAdminDriverPostsStore } from '~/stores/adminDriverPosts.store'

definePageMeta({
  layout: 'admin',
})

const store = useAdminDriverPostsStore()
const filter = ref<'all' | 'active' | 'paused'>('all')
const search = ref('')
const driverFilter = ref('')
const sentinel = ref<HTMLElement | null>(null)

const filterTabs = [
  { label: 'Hammasi', value: 'all' },
  { label: 'Faol', value: 'active' },
  { label: 'Pause', value: 'paused' },
]

const stats = computed(() => store.stats)

const activeFilter = computed(() => {
  if (filter.value === 'active') return true
  if (filter.value === 'paused') return false
  return null
})

const formatDate = (raw?: string) => {
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return raw
  }
}

const formatMoney = (n: number) => `${Number(n || 0).toLocaleString('uz-UZ')} so'm`

const reload = async () => {
  store.resetList()
  await Promise.all([
    store.fetchStats(),
    store.fetchCampaigns({
      page: 1,
      active: activeFilter.value,
      q: search.value.trim() || undefined,
      userId: driverFilter.value || undefined,
    }),
  ])
}

const loadMore = async () => {
  if (!store.hasMore || store.isLoadingMore || store.isLoading) return
  await store.fetchCampaigns({
    page: store.page + 1,
    active: activeFilter.value,
    q: search.value.trim() || undefined,
    userId: driverFilter.value || undefined,
    append: true,
  })
}

const filterByDriver = (userId: string) => {
  driverFilter.value = userId
  void reload()
}

const clearDriverFilter = () => {
  driverFilter.value = ''
  void reload()
}

const openDriver = (userId: string) => navigateTo(`/admin/driver/${userId}`)

const onStop = async (c: { id: string; name: string }) => {
  if (!confirm(`"${c.name}" e'lonini to'xtatasizmi?`)) return
  await store.stopCampaign(c.id)
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void reload(), 350)
})

watch(filter, () => void reload())

usePullToRefresh(async () => {
  await reload()
})

onMounted(async () => {
  const route = useRoute()
  const uid = String(route.query.userId || '').trim()
  if (uid) driverFilter.value = uid

  await reload()

  if (!import.meta.client) return
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) void loadMore()
  }, { rootMargin: '200px' })
  watch(sentinel, (el, _, onCleanup) => {
    if (el) io.observe(el)
    onCleanup(() => io.disconnect())
  }, { immediate: true })
})
</script>
