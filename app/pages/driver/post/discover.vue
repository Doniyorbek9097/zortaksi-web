<template>
  <div class="flex flex-col min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)] -mx-4 md:-mx-0">
    <header class="shrink-0 px-4 pt-2 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg sticky top-0 z-20">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 active:scale-95"
          aria-label="Orqaga"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-base font-black text-slate-900 dark:text-white">
            Yangi guruh izlash
          </h1>
          <p class="text-[10px] font-semibold text-slate-400 truncate">
            Siz a'zo bo'lmagan guruhlar
          </p>
        </div>
        <button
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 active:scale-95"
          :disabled="loading || !canSearch"
          aria-label="Yangilash"
          @click="reload(true)"
        >
          <font-awesome-icon
            icon="fa-solid fa-rotate"
            :class="loading ? 'animate-spin' : ''"
            class="text-sm"
          />
        </button>
      </div>

      <div class="relative mt-3">
        <font-awesome-icon
          icon="fa-solid fa-magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none"
        />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="search"
          enterkeyhint="search"
          placeholder="Nom, hudud yoki @username — Telegram bo'ylab"
          class="w-full pl-9 pr-3 py-3 rounded-xl text-[14px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        />
      </div>

      <p v-if="canSearch" class="mt-2 text-[11px] font-bold text-slate-400">
        {{ totalShown }} ta topildi
      </p>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2.5 pb-6">
      <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500 py-1">
        {{ success }}
      </p>

      <div v-if="loading && !groups.length" class="space-y-2.5">
        <div
          v-for="n in 6"
          :key="n"
          class="h-[100px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>

      <BaseEmptyState
        v-else-if="!loading && !groups.length"
        icon="fa-solid fa-magnifying-glass"
        :title="!canSearch ? 'Guruh nomini yozing' : 'Mos guruh topilmadi'"
        :description="!canSearch
          ? 'Kamida 2 ta harf yoki @username kiriting — keyin izlanadi'
          : 'Telegram ochiq guruhlari bo\'ylab qidiring (@username aniqroq)'"
        tone="slate"
      />

      <template v-else>
        <PostGroupCard
          v-for="g in groups"
          :key="g.id"
          :group="g"
          :selectable="false"
          :swipe-actions="false"
          :show-join="true"
          :joining="store.joiningId === g.id"
          @join="onJoin(g)"
        />
        <div ref="sentinel" class="h-1" />
        <div v-if="loadingMore" class="py-4 flex justify-center">
          <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-slate-400" />
        </div>
      </template>

      <p v-if="localError" class="text-center text-[12px] font-bold text-red-500 py-2">
        {{ localError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePostStore, type PostGroup } from '~/stores/post.store'
import { requireServiceAuth } from '~/utils/authSession'

definePageMeta({ layout: 'driver' })

const store = usePostStore()
const router = useRouter()

const searchQuery = ref('')
const groups = ref<PostGroup[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const discoverCursor = ref('')
const discoverPage = ref(1)
const localError = ref('')
const success = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const MIN_SEARCH_LEN = 2

const normalizedQuery = computed(() =>
  searchQuery.value.trim().replace(/^@+/, ''),
)

const canSearch = computed(() => normalizedQuery.value.length >= MIN_SEARCH_LEN)
const totalShown = computed(() => groups.value.length)

const goBack = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    void navigateTo('/driver/post')
  }
}

const loadPage = async (append: boolean, force = false) => {
  const q = normalizedQuery.value
  const excludeIds = append ? groups.value.map((g) => g.id) : []
  let pageNum = 1
  let cursor: string | undefined
  if (append) {
    if (discoverCursor.value) {
      cursor = discoverCursor.value
      pageNum = 1
    } else {
      discoverPage.value += 1
      pageNum = discoverPage.value
    }
  } else {
    discoverPage.value = 1
  }
  const { groups: rows, pagination, discoverHint } = await store.fetchUnjoinedGroups({
    q,
    page: pageNum,
    discoverCursor: cursor,
    excludeIds,
    force,
  })
  groups.value = append ? [...groups.value, ...rows] : rows
  discoverCursor.value = String(pagination?.discoverCursor || '')
  hasMore.value = Boolean(pagination?.hasMore)
  if (discoverHint && !rows.length) {
    localError.value = discoverHint
  } else if (discoverHint && rows.length) {
    localError.value = ''
  } else if (!append || rows.length) {
    localError.value = ''
  }
}

const reload = async (force = false) => {
  if (!canSearch.value) {
    groups.value = []
    discoverCursor.value = ''
    hasMore.value = false
    localError.value = ''
    return
  }
  localError.value = ''
  loading.value = true
  discoverCursor.value = ''
  discoverPage.value = 1
  hasMore.value = false
  try {
    await loadPage(false, force)
  } catch (e: any) {
    localError.value = e?.message || 'Guruhlar yuklanmadi'
    groups.value = []
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  localError.value = ''
  try {
    await loadPage(true)
  } catch (e: any) {
    localError.value = e?.message || 'Yuklash xatosi'
  } finally {
    loadingMore.value = false
  }
}

const onJoin = async (g: PostGroup) => {
  if (store.joiningId) return
  localError.value = ''
  success.value = ''
  try {
    const res = await store.joinGroup(g)
    if (res?.success) {
      groups.value = groups.value.filter((x) => x.id !== g.id)
      success.value = `«${g.title || g.username || 'Guruh'}» qo'shildi — Meniki ro'yxatda`
      void store.fetchMine({ page: 1, force: true, append: false })
    }
  } catch (e: any) {
    localError.value = e?.message || store.error || "Qo'shilish amalga oshmadi"
  }
}

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (!canSearch.value) {
      groups.value = []
      discoverCursor.value = ''
      hasMore.value = false
      localError.value = ''
      loading.value = false
      return
    }
    void reload()
  }, 350)
})

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onMounted(async () => {
  if (!requireServiceAuth('/driver/post/discover')) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) void loadMore()
    },
    { rootMargin: '400px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
  await nextTick()
  searchInputRef.value?.focus()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (observer) observer.disconnect()
})
</script>
