<template>
  <Teleport to="body">
    <Transition name="dg-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10000] flex flex-col bg-white dark:bg-slate-950"
      >
        <header class="shrink-0 px-4 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 active:scale-95"
              aria-label="Yopish"
              @click="close"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="text-sm" />
            </button>
            <div class="flex-1 min-w-0">
              <h2 class="text-base font-black text-slate-900 dark:text-white">
                Yangi guruh izlash
              </h2>
              <p class="text-[10px] font-semibold text-slate-400 truncate">
                Siz a'zo bo'lmagan guruhlar
              </p>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 active:scale-95"
              :disabled="loading"
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
              placeholder="Guruh nomi yoki @username…"
              class="w-full pl-9 pr-3 py-3 rounded-xl text-[14px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <p class="mt-2 text-[11px] font-bold text-slate-400">
            {{ totalShown }} ta topildi
          </p>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2.5">
          <div v-if="loading && !groups.length" class="space-y-2.5">
            <div
              v-for="n in 6"
              :key="n"
              class="h-[100px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
            />
          </div>

          <BaseEmptyState
            v-else-if="!loading && !groups.length"
            icon="fa-solid fa-users-slash"
            :title="searchQuery.trim() ? 'Mos guruh topilmadi' : 'Yangi guruh yo\'q'"
            :description="searchQuery.trim()
              ? 'Boshqa nom yoki username bilan qidiring'
              : 'Barcha ochiq guruhlarga allaqachon a\'zosiz yoki admin hali qo\'shmagan'"
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePostStore, type PostGroup } from '~/stores/post.store'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  joined: [title: string]
}>()

const store = usePostStore()

const searchQuery = ref('')
const groups = ref<PostGroup[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const page = ref(1)
const total = ref(0)
const localError = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const totalShown = computed(() => {
  if (total.value) return total.value
  return groups.value.length
})

const close = () => {
  emit('update:modelValue', false)
}

const loadPage = async (pageNum: number, append: boolean, force = false) => {
  const q = searchQuery.value.trim()
  const { groups: rows, pagination } = await store.fetchUnjoinedGroups({
    q,
    page: pageNum,
    force,
  })
  groups.value = append ? [...groups.value, ...rows] : rows
  page.value = Number(pagination?.page ?? pageNum)
  total.value = Number(pagination?.total ?? groups.value.length)
  hasMore.value = Boolean(pagination?.hasMore)
}

const reload = async (force = false) => {
  localError.value = ''
  loading.value = true
  page.value = 1
  hasMore.value = false
  try {
    await loadPage(1, false, force)
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
    await loadPage(page.value + 1, true)
  } catch (e: any) {
    localError.value = e?.message || 'Yuklash xatosi'
  } finally {
    loadingMore.value = false
  }
}

const onJoin = async (g: PostGroup) => {
  if (store.joiningId) return
  localError.value = ''
  try {
    const res = await store.joinGroup(g)
    if (res?.success) {
      groups.value = groups.value.filter((x) => x.id !== g.id)
      total.value = Math.max(0, total.value - 1)
      emit('joined', g.title || g.username || 'Guruh')
    }
  } catch (e: any) {
    localError.value = e?.message || store.error || "Qo'shilish amalga oshmadi"
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      searchQuery.value = ''
      groups.value = []
      localError.value = ''
      return
    }
    await reload()
    await nextTick()
    searchInputRef.value?.focus()
    if (sentinel.value && observer) observer.observe(sentinel.value)
  },
)

watch(searchQuery, () => {
  if (!props.modelValue) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void reload()
  }, 350)
})

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) void loadMore()
    },
    { rootMargin: '400px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.dg-fade-enter-active,
.dg-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dg-fade-enter-from,
.dg-fade-leave-to {
  opacity: 0;
}
</style>
