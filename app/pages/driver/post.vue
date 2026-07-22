<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-36 space-y-3">
    <!-- Header -->
    <header class="flex items-center justify-between gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="min-w-0 leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">E'lon joylash</h1>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
          Kalit so'zlar Buyurtmalar bilan umumiy
        </p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900"
        >
          <font-awesome-icon icon="fa-solid fa-filter" class="text-[10px]" />
          Filtrlash
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
        v-if="store.isAdmin"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="store.tab === 'ads'
          ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="store.setTab('ads')"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-[10px]" />
        Reklama berish {{ store.adsTotal }}
      </button>
    </div>

    <!-- Count + filters -->
    <div class="flex items-center justify-between gap-2">
      <p class="text-[12px] font-bold text-slate-400">
        {{ selectedCount }} tanlangan · {{ filtered.length }}/{{ store.totalGroups }} ko'rsatildi
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-500"
          @click="toggleSelectAll"
        >
          {{ allFilteredSelected ? 'Bekor' : 'Hammasi' }}
        </button>
        <span class="text-[11px] font-black text-amber-500">
          {{ store.tab === 'mine' || store.isAdmin ? 'Bepul' : `${store.pricePerGroup.toLocaleString('ru-RU')} so'm` }}
          · {{ store.tab === 'mine' ? 'Meniki' : 'Reklama berish' }}
        </span>
      </div>
    </div>

    <!-- List -->
    <div v-if="store.isLoading" class="space-y-2">
      <div v-for="n in 6" :key="n" class="h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <BaseEmptyState
      v-else-if="!filtered.length"
      icon="fa-solid fa-bullhorn"
      :title="store.tab === 'mine' ? 'Guruhlar topilmadi — Telegram sessiyangizni tekshiring' : 'Guruhlar topilmadi'"
      tone="slate"
    />

    <div v-else class="space-y-1.5">
      <button
        v-for="(g, idx) in filtered"
        :key="g.id"
        type="button"
        class="w-full flex items-center gap-2.5 px-3 py-3 rounded-2xl border text-left transition-colors"
        :class="store.selected.has(g.id)
          ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/30'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
        @click="store.toggle(g.id)"
      >
        <span class="w-5 text-[11px] font-bold text-slate-400 shrink-0">{{ idx + 1 }}</span>

        <span
          class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
          :class="store.selected.has(g.id)
            ? 'border-amber-500 bg-amber-500 text-white'
            : 'border-slate-300 dark:border-slate-600'"
        >
          <font-awesome-icon
            v-if="store.selected.has(g.id)"
            icon="fa-solid fa-check"
            class="text-[9px]"
          />
        </span>

        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black text-slate-900 dark:text-white truncate">
            {{ g.title }}
          </span>
          <span class="text-[11px] font-medium text-slate-400 truncate">
            @{{ g.username || '—' }} · {{ g.connections }} ulangan
          </span>
        </span>

        <span class="text-[11px] font-black text-amber-500 shrink-0">
          {{ g.free || store.tab === 'mine' ? 'Bepul' : `${g.price.toLocaleString('ru-RU')}` }}
        </span>
      </button>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-2 pt-1">
        <div v-for="n in 2" :key="n" class="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
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

    <!-- Floating send -->
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-20 inset-x-0 z-30 px-4 pointer-events-none"
    >
      <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl pointer-events-auto">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all"
          @click="composeOpen = true"
        >
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
          {{ selectedCount }} guruhga xabar yuborish
          <span class="ml-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-white/25">
            {{ store.totalCost > 0 ? `${store.totalCost.toLocaleString('ru-RU')} so'm` : 'Bepul' }}
          </span>
        </button>
      </div>
    </div>

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

definePageMeta({ layout: 'driver' })

const store = usePostStore()
const authStore = useAuthStore()

const composeOpen = ref(false)
const success = ref('')
const filterFreeOnly = ref(false)

const filtered = computed(() => {
  let list = store.groups
  if (filterFreeOnly.value) list = list.filter(g => g.free)
  return list
})

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
    if (failed) success.value = `${sent} ta yuborildi, ${failed} ta xato`
    else success.value = `${sent} ta guruhga yuborildi`
  } catch {
    /* error in store */
  }
}

// --- Infinite scroll (10 tadan) ---
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
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

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>
