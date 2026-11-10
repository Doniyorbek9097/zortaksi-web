<template>
  <div
    class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 space-y-3"
    :class="selectedIds.size > 0 ? 'pb-[5.75rem]' : 'pb-4'"
  >
    <div
      class="sticky top-0 z-30 -mx-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
    >
      <header class="flex items-center gap-2 px-4 py-1.5">
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900 active:scale-95 shrink-0"
          aria-label="Orqaga"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-xs" />
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
          class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900 active:scale-95 shrink-0"
          :disabled="loading || !canSearch"
          aria-label="Yangilash"
          @click="reload(true)"
        >
          <font-awesome-icon
            icon="fa-solid fa-rotate"
            :class="loading ? 'animate-spin' : ''"
            class="text-xs"
          />
        </button>
      </header>

      <div class="px-4 pb-3">
        <div class="relative">
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
            class="w-full pl-9 pr-3 py-3 rounded-xl text-[14px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        <div v-if="canSearch" class="mt-2 flex items-center justify-between gap-2">
          <p class="text-[11px] font-bold text-slate-400">
            {{ totalShown }} ta topildi
          </p>
          <div v-if="groups.length" class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-slate-400">
              {{ selectedIds.size }} tanlangan
            </span>
            <button
              type="button"
              class="text-[10px] font-black text-sky-600 dark:text-sky-400"
              @click="toggleSelectAll"
            >
              {{ allListedSelected ? 'Bekor' : 'Hammasi' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">
      {{ success }}
    </p>

    <p
      v-if="discoverInfo"
      class="text-center text-[11px] font-semibold text-amber-700 dark:text-amber-300 px-2"
    >
      {{ discoverInfo }}
    </p>

    <div v-if="loading && !groups.length" class="space-y-2.5">
      <div
        v-for="n in 6"
        :key="n"
        class="h-[72px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
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

    <div v-else class="space-y-2.5">
      <PostGroupCard
        v-for="g in groups"
        :key="g.id"
        :group="g"
        :selectable="true"
        :selected="isSelected(g.id)"
        :swipe-actions="false"
        :show-join="true"
        :joining="store.joiningId === g.id"
        @toggle="toggleSelect(g.id)"
        @join="onJoin(g)"
      />

      <div ref="sentinel" class="h-1" />

      <div v-if="loadingMore" class="py-3 flex justify-center">
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-slate-400" />
      </div>

      <p
        v-else-if="!hasMore && groups.length"
        class="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha natijalar ko'rsatildi
      </p>
    </div>

    <p v-if="localError" class="text-center text-[12px] font-bold text-red-500">
      {{ localError }}
    </p>
  </div>

  <div
    v-if="selectedIds.size > 0"
    class="fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
    :style="{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 0.5rem)' }"
  >
    <button
      type="button"
      class="pointer-events-auto w-full max-w-md inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/30 border border-sky-400/40 disabled:opacity-50"
      :disabled="!selectedJoinUrls.length"
      @click="copySelectedJoinUrls"
    >
      <font-awesome-icon :icon="copiedLinks ? 'fa-solid fa-check' : 'fa-solid fa-copy'" />
      {{ copiedLinks ? 'Nusxalandi' : `Havolalarni nusxalash (${selectedIds.size})` }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { usePostStore, type PostGroup } from '~/stores/post.store'
import { requireServiceAuth } from '~/utils/authSession'
import { normalizeTelegramChannelId } from '~/utils/telegramLinks'

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
const discoverInfo = ref('')
const success = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)
const selectedIds = ref<Set<string>>(new Set())
const copiedLinks = ref(false)

let observer: IntersectionObserver | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null
let copiedLinksTimer: ReturnType<typeof setTimeout> | null = null

const MIN_SEARCH_LEN = 2

const normalizedQuery = computed(() =>
  searchQuery.value.trim().replace(/^@+/, ''),
)

const canSearch = computed(() => normalizedQuery.value.length >= MIN_SEARCH_LEN)
const totalShown = computed(() => groups.value.length)

const allListedSelected = computed(
  () => groups.value.length > 0 && groups.value.every((g) => selectedIds.value.has(g.id)),
)

const resolveGroupJoinUrl = (g: PostGroup): string => {
  const join = String(g.joinUrl || '').trim()
  if (join) return join
  const username = String(g.username || '').replace(/^@/, '').trim()
  if (username) return `https://t.me/${username}`
  const channelId = normalizeTelegramChannelId(g.id)
  if (!channelId) return ''
  return `https://t.me/c/${channelId}`
}

const selectedJoinUrls = computed(() =>
  groups.value
    .filter((g) => selectedIds.value.has(g.id))
    .map((g) => resolveGroupJoinUrl(g))
    .filter((u): u is string => !!u),
)

const isSelected = (id: string) => selectedIds.value.has(id)

const toggleSelect = (id: string) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

const selectAllListed = () => {
  selectedIds.value = new Set(groups.value.map((g) => g.id))
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

const toggleSelectAll = () => {
  if (allListedSelected.value) clearSelection()
  else selectAllListed()
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

const isSoftDiscoverHint = (hint: string) =>
  /Telegram qidiruv uzoq|mahalliy ro'yxat/i.test(hint)

const applyDiscoverHint = (
  hint: string | undefined,
  append: boolean,
  rowsLength: number,
) => {
  if (!hint) {
    if (!append) discoverInfo.value = ''
    return
  }
  if (append) return
  if (rowsLength > 0 && isSoftDiscoverHint(hint)) {
    discoverInfo.value = hint
    localError.value = ''
    return
  }
  if (!rowsLength) {
    discoverInfo.value = ''
    localError.value = hint
  }
}

const copySelectedJoinUrls = async () => {
  if (!selectedJoinUrls.value.length) return
  await copyText(selectedJoinUrls.value.join('\n'))
  copiedLinks.value = true
  if (copiedLinksTimer) clearTimeout(copiedLinksTimer)
  copiedLinksTimer = setTimeout(() => {
    copiedLinks.value = false
    copiedLinksTimer = null
  }, 2000)
}

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
  if (!append) {
    selectedIds.value = new Set()
    copiedLinks.value = false
  } else {
    const listed = new Set(groups.value.map((g) => g.id))
    const kept = new Set<string>()
    for (const id of selectedIds.value) {
      if (listed.has(id)) kept.add(id)
    }
    selectedIds.value = kept
  }
  discoverCursor.value = String(pagination?.discoverCursor || '')
  hasMore.value = Boolean(pagination?.hasMore)
  if (append) {
    localError.value = ''
  } else {
    applyDiscoverHint(discoverHint, false, rows.length)
    if (!discoverHint) {
      discoverInfo.value = ''
      if (rows.length) localError.value = ''
    }
  }
}

const reload = async (force = false) => {
  if (!canSearch.value) {
    groups.value = []
    discoverCursor.value = ''
    hasMore.value = false
    localError.value = ''
    discoverInfo.value = ''
    return
  }
  localError.value = ''
  discoverInfo.value = ''
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
      if (selectedIds.value.has(g.id)) {
        const next = new Set(selectedIds.value)
        next.delete(g.id)
        selectedIds.value = next
      }
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
      discoverInfo.value = ''
      loading.value = false
      return
    }
    void reload()
  }, 350)
})

const bindSentinelObserver = () => {
  if (!import.meta.client || !sentinel.value) return
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { rootMargin: '520px' },
    )
  }
  observer.disconnect()
  observer.observe(sentinel.value)
}

watch(sentinel, (el) => {
  if (el) bindSentinelObserver()
})

watch(
  () => groups.value.length,
  () => {
    nextTick(() => bindSentinelObserver())
  },
)

usePullToRefresh(async () => {
  if (canSearch.value) await reload(true)
})

onMounted(async () => {
  if (!requireServiceAuth('/driver/post/discover')) return
  await nextTick()
  bindSentinelObserver()
  searchInputRef.value?.focus()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (copiedLinksTimer) clearTimeout(copiedLinksTimer)
  if (observer) observer.disconnect()
})
</script>
