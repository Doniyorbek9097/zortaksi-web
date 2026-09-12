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
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
            {{ c.textPreview }}
          </p>
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
    </div>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">{{ store.error }}</p>

    <Teleport to="body">
      <div
        v-if="editOpen"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 backdrop-blur-sm"
        @click.self="editOpen = false"
      >
        <div class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 class="text-lg font-black text-slate-900 dark:text-white">E'lonni tahrirlash</h3>
          <input
            v-model="editForm.name"
            type="text"
            maxlength="80"
            placeholder="Nom"
            class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
          <textarea
            v-model="editForm.text"
            rows="4"
            placeholder="Matn"
            class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 resize-none"
          />
          <input
            v-model.number="editForm.intervalMin"
            type="number"
            min="10"
            max="1440"
            class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
          <p class="text-[10px] text-slate-400">Minimal interval: 10 daqiqa · Guruhlar: {{ editForm.groupCount }}</p>
          <button
            type="button"
            class="w-full py-3 rounded-xl text-sm font-black text-white bg-sky-500 disabled:opacity-50"
            :disabled="store.isSaving"
            @click="saveEdit"
          >
            Saqlash
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  useAdminDriverPostsStore,
  type AdminDriverPostCampaign,
} from '~/stores/adminDriverPosts.store'
import { MIN_POST_INTERVAL_MIN } from '~/stores/post.store'

definePageMeta({ layout: 'admin' })

const store = useAdminDriverPostsStore()
const { avatarUrl } = useMediaUrl()
const brokenAvatars = ref<Set<string>>(new Set())

const filter = ref<'all' | 'active' | 'paused'>('all')
const search = ref('')
const driverFilter = ref('')
const sentinel = ref<HTMLElement | null>(null)
const editOpen = ref(false)
const editTarget = ref<AdminDriverPostCampaign | null>(null)
const editForm = ref({ name: '', text: '', intervalMin: MIN_POST_INTERVAL_MIN, groupCount: 0 })

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

const openDriver = (userId: string) => navigateTo(`/admin/driver/${userId}`)

const onToggle = async (c: AdminDriverPostCampaign) => {
  if (c.active) await store.stopCampaign(c.id)
  else await store.startCampaign(c.id)
}

const openEdit = (c: AdminDriverPostCampaign) => {
  editTarget.value = c
  editForm.value = {
    name: c.name,
    text: c.text || c.textPreview,
    intervalMin: Math.max(MIN_POST_INTERVAL_MIN, c.intervalMin),
    groupCount: c.groupCount,
  }
  editOpen.value = true
}

const saveEdit = async () => {
  if (!editTarget.value) return
  await store.updateCampaign(editTarget.value.id, {
    name: editForm.value.name.trim(),
    text: editForm.value.text.trim(),
    intervalMin: Math.max(MIN_POST_INTERVAL_MIN, Math.round(editForm.value.intervalMin)),
  })
  editOpen.value = false
}

const onDelete = async (c: AdminDriverPostCampaign) => {
  if (!confirm(`"${c.name}" o'chirilsinmi?`)) return
  await store.deleteCampaign(c.id)
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void reload(), 350)
})
watch(filter, () => void reload())

usePullToRefresh(async () => { await reload() })

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
