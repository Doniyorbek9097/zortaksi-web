<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-3">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 space-y-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="navigateTo('/admin/dashboard')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-base font-black text-slate-900 dark:text-white">E'lonlar</h1>
          <p v-if="stats" class="text-[10px] font-semibold text-slate-400 truncate">
            {{ stats.totalCampaigns }} saqlangan · {{ stats.activeCampaigns }} faol
          </p>
        </div>
      </div>
      <AdminSegmentTabs v-model="filter" :tabs="filterTabs" />
    </header>

    <div v-if="stats" class="grid grid-cols-4 gap-1.5">
      <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-center">
        <p class="text-[15px] font-black text-slate-900 dark:text-white tabular-nums">{{ stats.totalCampaigns }}</p>
        <p class="text-[9px] font-bold text-slate-400 uppercase">Jami</p>
      </div>
      <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 p-2 text-center">
        <p class="text-[15px] font-black text-emerald-600 tabular-nums">{{ stats.activeCampaigns }}</p>
        <p class="text-[9px] font-bold text-emerald-600/70 uppercase">Play</p>
      </div>
      <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-center">
        <p class="text-[15px] font-black text-violet-600 tabular-nums">{{ stats.estimatedSendsPerDay }}</p>
        <p class="text-[9px] font-bold text-slate-400 uppercase">Kunlik</p>
      </div>
      <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-center">
        <p class="text-[15px] font-black text-amber-600 tabular-nums">{{ stats.uniqueDrivers }}</p>
        <p class="text-[9px] font-bold text-slate-400 uppercase">Driver</p>
      </div>
    </div>

    <button
      type="button"
      class="w-full flex items-center gap-3 rounded-2xl border border-violet-200/80 dark:border-violet-900/50 bg-white dark:bg-slate-900 px-3.5 py-3 text-left active:scale-[0.99] transition-transform"
      @click="navigateTo('/admin/driver-posts/global')"
    >
      <span
        class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-sm" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-[12px] font-black text-slate-900 dark:text-white">
          Global xabar
        </span>
        <span class="block text-[10px] font-semibold text-slate-400 truncate mt-0.5">
          Barcha e'lonlarga qo'shiladigan matn
        </span>
      </span>
      <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-[10px] text-slate-400 shrink-0" />
    </button>

    <AdminDriversSearchInput v-model="search" placeholder="Haydovchi, nom yoki matn..." />

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
        <button
          type="button"
          class="w-full flex items-center gap-2.5 text-left active:opacity-80"
          @click="openDriver(c.userId)"
        >
          <img
            v-if="avatarSrc(c.owner)"
            :src="avatarSrc(c.owner)"
            alt=""
            class="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-200"
            @error="onAvatarError(c.userId)"
          >
          <span
            v-else
            class="w-9 h-9 rounded-full shrink-0 bg-sky-100 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center text-[12px] font-black"
          >
            {{ c.owner.name.charAt(0) || '?' }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[12px] font-black text-slate-900 dark:text-white truncate">{{ c.owner.name }}</p>
            <p v-if="c.owner.phone" class="text-[10px] font-semibold text-slate-400 truncate">{{ c.owner.phone }}</p>
          </div>
          <span
            class="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
            :class="c.active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'"
          >
            {{ c.active ? 'Play' : 'Pause' }}
          </span>
        </button>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-[13px] font-black text-slate-900 dark:text-white truncate">{{ c.name }}</h3>
            <span
              class="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
              :class="c.mode === 'mine' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'"
            >
              {{ c.mode === 'mine' ? 'Meniki' : 'Boshqalar' }}
            </span>
          </div>
          <PostBroadcastTextPreview
            :text="c.broadcastText || c.textPreview"
            :line-clamp="2"
            class="mt-1 text-[11px]"
          />
          <p class="text-[10px] font-semibold text-slate-400 mt-1.5">
            {{ c.groupCount }} guruh · har {{ c.intervalMin }} daqiqa
            <span v-if="c.active"> · ~{{ c.sendsPerDay }}/kun</span>
          </p>
          <p v-if="c.lastError" class="text-[10px] font-bold text-rose-500 mt-1">{{ c.lastError }}</p>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-if="c.active"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-rose-600 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 disabled:opacity-50"
            :disabled="store.isSaving"
            @click="onToggle(c)"
          >
            <font-awesome-icon icon="fa-solid fa-pause" class="text-[9px]" />
            Pause
          </button>
          <button
            v-else
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 disabled:opacity-50"
            :disabled="store.isSaving"
            @click="onToggle(c)"
          >
            <font-awesome-icon icon="fa-solid fa-play" class="text-[9px]" />
            Play
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-sky-600 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5"
            :disabled="store.isSaving"
            @click="openEdit(c)"
          >
            <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[9px]" />
            Tahrir
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-rose-600 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 disabled:opacity-50"
            :disabled="store.isSaving"
            @click="onDelete(c)"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="text-[9px]" />
            O'chirish
          </button>
        </div>
      </article>

      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-3 pt-1">
        <div
          v-for="n in 2"
          :key="n"
          class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>

      <p
        v-else-if="!store.hasMore && store.items.length"
        class="py-3 text-center text-[12px] font-bold text-slate-400 dark:text-slate-500"
      >
        — Hammasi yuklandi —
      </p>
    </div>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">{{ store.error }}</p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="E'lonni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.name}» o'chirilsinmi?` : ''"
      confirm-text="O'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="store.isSaving"
      @confirm="onConfirmDelete"
      @cancel="deleteOpen = false"
    />

  </div>
</template>

<script setup lang="ts">
import {
  useAdminDriverPostsStore,
  type AdminDriverPostCampaign,
} from '~/stores/adminDriverPosts.store'
definePageMeta({ layout: 'admin', keepalive: true })

const store = useAdminDriverPostsStore()
const { avatarUrl } = useMediaUrl()
const brokenAvatars = ref<Set<string>>(new Set())

const filter = ref<'all' | 'active' | 'paused'>('all')
const search = ref('')
const driverFilter = ref('')
const success = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<AdminDriverPostCampaign | null>(null)
const listBooted = ref(false)

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

const avatarSrc = (owner: { avatar?: string; userId: string }) => {
  if (brokenAvatars.value.has(owner.userId)) return undefined
  return avatarUrl(owner.avatar, owner.userId)
}

const onAvatarError = (userId: string) => {
  brokenAvatars.value.add(userId)
}

const reload = async (opts?: { keepItems?: boolean; silent?: boolean }) => {
  const keepItems = opts?.keepItems === true
  const silent = opts?.silent === true
  if (!keepItems) store.resetList()
  await Promise.all([
    store.fetchStats(),
    store.fetchGlobalAppend(),
    store.fetchCampaigns({
      page: 1,
      active: activeFilter.value,
      q: search.value.trim() || undefined,
      userId: driverFilter.value || undefined,
      silent,
    }),
  ])
}

const listQuery = () => ({
  active: activeFilter.value,
  q: search.value.trim() || undefined,
  userId: driverFilter.value || undefined,
})

const loadMore = () => store.loadMore(listQuery())

const sentinel = ref<HTMLElement | null>(null)
let scrollObserver: IntersectionObserver | null = null

const openDriver = (userId: string) => navigateTo(`/driver/user/${encodeURIComponent(userId)}`)

const onToggle = async (c: AdminDriverPostCampaign) => {
  success.value = ''
  if (c.active) {
    await store.stopCampaign(c.id)
    return
  }
  try {
    await store.startCampaign(c.id)
    success.value = `«${c.name}» boshlandi`
  } catch { /* store.error */ }
}

const openEdit = (c: AdminDriverPostCampaign) => {
  navigateTo(`/admin/driver-posts/${encodeURIComponent(c.id)}/edit`)
}

const onDelete = (c: AdminDriverPostCampaign) => {
  deleteTarget.value = c
  deleteOpen.value = true
}

const onConfirmDelete = async () => {
  const c = deleteTarget.value
  if (!c) return
  await store.deleteCampaign(c.id)
  deleteOpen.value = false
  deleteTarget.value = null
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void reload(), 350)
})
watch(filter, () => void reload())

usePullToRefresh(async () => { await reload() })

const bootList = async () => {
  const route = useRoute()
  const uid = String(route.query.userId || '').trim()
  if (uid) driverFilter.value = uid

  if (listBooted.value && store.items.length) {
    await reload({ keepItems: true, silent: true })
    return
  }

  await reload()
  listBooted.value = true
}

onMounted(async () => {
  await bootList()

  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '200px' },
  )
  if (sentinel.value) scrollObserver.observe(sentinel.value)
})

onActivated(() => {
  if (listBooted.value && store.items.length) {
    void reload({ keepItems: true, silent: true })
  }
})

watch(sentinel, (el) => {
  if (scrollObserver && el) scrollObserver.observe(el)
})

onBeforeUnmount(() => {
  if (scrollObserver) scrollObserver.disconnect()
})
</script>
