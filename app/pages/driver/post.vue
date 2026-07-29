<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-36 space-y-3">
    <!-- Header -->
    <header class="flex items-center justify-between gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="min-w-0 leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">E'lon joylash</h1>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
          Hududlar Buyurtmalar bilan umumiy
        </p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all active:scale-95 border"
          :class="showFilter || filterActive
            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-400/50 dark:border-indigo-500/50'
            : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
          @click="showFilter = !showFilter"
        >
          <font-awesome-icon icon="fa-solid fa-location-dot" class="text-[10px]" />
          Hudud belgilash
        </button>
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900 active:scale-95"
          :disabled="store.isLoading"
          @click="store.load(true)"
        >
          <font-awesome-icon
            icon="fa-solid fa-rotate"
            :class="store.isLoading ? 'animate-spin' : ''"
          />
        </button>
      </div>
    </header>

    <OrdersRegionChips
      :keywords="appliedKeywords"
      @remove="onRemoveRegion"
    />

    <OrdersFilterPanel
      v-if="showFilter"
      v-model="draftKeywords"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <!-- Tabs: Meniki / Reklama -->
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="store.tab === 'mine'
          ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="store.setTab('mine')"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
        Meniki {{ store.mineTotal }}
      </button>
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="store.tab === 'ads'
          ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="store.setTab('ads')"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-[10px]" />
        Reklama {{ store.adsTotal }}
      </button>
    </div>

    <p
      v-if="store.tab === 'ads' && !store.isAdmin"
      class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug"
    >
      Faqat a'zo bo'lmagan guruhlar. «A'zo bo'lish» — keyin Meniki dan e'lon yuboring.
    </p>
    <p
      v-else-if="store.tab === 'mine' && store.isAdmin"
      class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug"
    >
      Admin guruhlarda ko'z belgisini bosing — ochilganlari haydovchilar Reklama tabida ko'rinadi.
    </p>

    <!-- Count + select (faqat Meniki) -->
    <div
      v-if="store.tab === 'mine'"
      class="flex items-center justify-between gap-2"
    >
      <p class="text-[12px] font-bold text-slate-400">
        {{ selectedCount }} tanlangan · {{ filtered.length }}/{{ store.totalGroups }} ko'rsatildi
      </p>
      <button
        type="button"
        class="px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-500"
        @click="toggleSelectAll"
      >
        {{ allFilteredSelected ? 'Bekor' : 'Hammasi' }}
      </button>
    </div>
    <p
      v-else
      class="text-[12px] font-bold text-slate-400"
    >
      {{ filtered.length }}/{{ store.totalGroups }} ko'rsatildi
    </p>

    <!-- List -->
    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="h-[88px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!filtered.length"
      icon="fa-solid fa-bullhorn"
      :title="store.tab === 'mine'
        ? 'Guruhlar topilmadi — Telegram sessiyangizni tekshiring'
        : (store.isAdmin ? 'Guruhlar topilmadi' : 'A\'zo bo\'lish uchun guruh qolmadi')"
      tone="slate"
    />

    <div v-else class="space-y-2.5">
      <PostGroupCard
        v-for="g in filtered"
        :key="g.id"
        :group="g"
        :selectable="store.tab === 'mine'"
        :selected="store.selected.has(g.id)"
        :show-admin-badge="store.tab === 'mine'"
        :show-visible-badge="store.tab === 'mine' && store.isAdmin"
        :show-join="store.tab === 'ads' && !store.isAdmin"
        :joining="store.joiningId === g.id"
        :show-visibility="store.tab === 'mine' && store.isAdmin && g.isAdmin"
        @toggle="store.toggle(g.id)"
        @join="onJoinGroup(g)"
        @toggle-visibility="onToggleVisibility(g)"
      />

      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-2.5 pt-1">
        <div
          v-for="n in 2"
          :key="n"
          class="h-[88px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>

      <p
        v-else-if="!store.hasMore && filtered.length"
        class="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha guruhlar ko'rsatildi
      </p>
    </div>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
      {{ store.error }}
    </p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">
      {{ success }}
    </p>

    <!-- Fixed send — Teleport: PTR transform fixed ni buzmasin -->
    <Teleport to="body">
      <div
        v-if="store.tab === 'mine' && selectedCount > 0"
        class="fixed bottom-20 inset-x-0 z-[60] px-4 pointer-events-none"
      >
        <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl pointer-events-auto">
          <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all"
            @click="composeOpen = true"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" />
            {{ selectedCount }} guruhga xabar yuborish
          </button>
        </div>
      </div>
    </Teleport>

    <PostComposeDialog
      v-model="composeOpen"
      :count="selectedCount"
      :cost="store.totalCost"
      :loading="store.isSending"
      @confirm="onSend"
    />
  </div>
</template>

<script setup lang="ts">
import { usePostStore } from '~/stores/post.store'
import { useAuthStore } from '~/stores/auth.store'
import {
  loadOrderFilterKeywords,
  parseKeywords,
  saveOrderFilterKeywords,
} from '~/utils/orderFilterKeywords'

definePageMeta({ layout: 'driver' })

const store = usePostStore()
const authStore = useAuthStore()

const composeOpen = ref(false)
const success = ref('')
const showFilter = ref(false)
const draftKeywords = ref('')
const appliedKeywords = ref('')
const filterActive = computed(() => !!appliedKeywords.value.trim())

const onSaveFilter = async (value: string) => {
  draftKeywords.value = value
  appliedKeywords.value = value
  saveOrderFilterKeywords(value)
  showFilter.value = false
  await store.setSearch(value)
}

const onCancelFilter = () => {
  draftKeywords.value = appliedKeywords.value
  showFilter.value = false
}

const onRemoveRegion = (chip: string) => {
  const next = parseKeywords(appliedKeywords.value)
    .filter((k) => k !== chip)
    .join(', ')
  void onSaveFilter(next)
}

const filtered = computed(() => store.groups)

const selectedCount = computed(() => store.selected.size)

const allFilteredSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every(g => store.selected.has(g.id))
)

const toggleSelectAll = () => {
  if (allFilteredSelected.value) store.clearSelection()
  else store.selectAllVisible(filtered.value)
}

const onSend = async (text: string) => {
  success.value = ''
  try {
    const res = await store.broadcast(text)
    composeOpen.value = false
    const sent = res.data?.sent ?? 0
    const failed = res.data?.failed ?? 0
    if (failed) success.value = `${sent} ta guruhga tushdi, ${failed} tasiga tushmadi`
    else success.value = `${sent} ta guruhga tushdi`
  } catch {
    /* error in store */
  }
}

const onToggleVisibility = async (g: any) => {
  try {
    await store.setVisibility(g, !g.visibleToDrivers)
  } catch {
    /* store error */
  }
}

const onJoinGroup = async (g: any) => {
  try {
    await store.joinGroup(g)
    success.value = `«${g.title}» Meniki ga qo'shildi`
  } catch {
    /* store error */
  }
}

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  const saved = loadOrderFilterKeywords()
  draftKeywords.value = saved
  appliedKeywords.value = saved
  store.search = saved.trim()

  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* ignore */ }
  }
  await store.load()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) store.loadMore()
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

usePullToRefresh(() => store.load(true))

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>
