<template>
  <div
    v-if="visible"
    class="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          Ish hududi
        </p>
        <h3 class="mt-0.5 text-lg font-black text-indigo-600 dark:text-indigo-400 truncate">
          {{ regionTitle }}
        </h3>
        <p class="mt-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
          {{ regionSlug || '—' }}
        </p>
        <p class="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
          Faqat shu hudud buyurtmalari va guruhlari ko'rsatiladi
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2 text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
        @click="openSheet = true"
      >
        O'zgartirish
      </button>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fp-fade">
      <div
        v-if="openSheet"
        class="fixed inset-0 flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-0 md:p-4 z-[10000]"
        @click.self="openSheet = false"
      >
        <Transition name="fp-sheet" appear>
          <div
            v-if="openSheet"
            class="w-full md:max-w-md max-h-[min(85vh,720px)] flex flex-col rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            @click.stop
          >
            <div class="shrink-0 p-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2 px-0.5">
                <span class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center shrink-0">
                  <font-awesome-icon icon="fa-solid fa-location-dot" />
                </span>
                <div class="min-w-0 flex-1 leading-none">
                  <p class="text-sm font-black text-slate-900 dark:text-white">
                    Hududni o'zgartirish
                  </p>
                  <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Eski guruhlardan chiqasiz, yangi hudud guruhlariga qo'shilasiz
                  </p>
                </div>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2">
              <div v-if="loading" class="py-8 text-center text-[12px] text-slate-400">
                <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin mr-1" />
                Yuklanmoqda…
              </div>
              <button
                v-for="r in regions"
                :key="r.slug"
                type="button"
                class="w-full text-left rounded-xl border px-3.5 py-3 transition-all"
                :class="selectedSlug === r.slug
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'"
                @click="selectedSlug = r.slug"
              >
                <p class="text-[13px] font-black text-slate-900 dark:text-white">{{ r.title }}</p>
                <p class="text-[10px] font-mono text-slate-400 mt-0.5">{{ r.slug }}</p>
              </button>
            </div>

            <div class="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                class="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-black py-3 disabled:opacity-50"
                :disabled="!canSave"
                @click="onSave"
              >
                {{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}
              </button>
              <button
                type="button"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[13px] font-bold py-2.5"
                @click="openSheet = false"
              >
                Bekor qilish
              </button>
              <p v-if="error" class="text-center text-[11px] font-bold text-red-500">{{ error }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { isTariffActive } from '~/utils/tariffActive'
import { ORDERS_PAGE_LIMIT } from '~/utils/orderFilterKeywords'

type RegionRow = { slug: string; title: string }

const authStore = useAuthStore()
const orderStore = useOrderStore()
const { show: showRegionGroupsWelcome } = useRegionGroupsWelcome()

const openSheet = ref(false)
const regions = ref<RegionRow[]>([])
const selectedSlug = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const visible = computed(() => {
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  return isTariffActive(authStore.user) && !!String(authStore.user?.regionSlug || '').trim()
})

const regionSlug = computed(() => String(authStore.user?.regionSlug || '').trim())

const regionTitle = computed(() => {
  const slug = regionSlug.value
  if (!slug) return 'Tanlanmagan'
  const row = regions.value.find((r) => r.slug === slug)
  return row?.title || slug
})

const canSave = computed(() => {
  return !!selectedSlug.value && selectedSlug.value !== regionSlug.value && !saving.value
})

const loadRegions = async () => {
  loading.value = true
  try {
    const res = await useApi('/bot-regions')
    regions.value = res?.data?.regions ?? []
  } catch {
    regions.value = []
  } finally {
    loading.value = false
  }
}

const onSave = async () => {
  if (!canSave.value) return
  saving.value = true
  error.value = ''
  try {
    const res = await useApi('/me/region', {
      method: 'PATCH',
      body: { regionSlug: selectedSlug.value },
      timeout: 90_000,
    })
    await authStore.getMe()
    openSheet.value = false
    const groups = res?.data?.groups
    if (groups) showRegionGroupsWelcome(groups)
    orderStore.applyListFilter({ page: 1, limit: ORDERS_PAGE_LIMIT })
    orderStore.orders = []
    void orderStore.fetchOrders({ page: 1, limit: ORDERS_PAGE_LIMIT })
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Saqlash xato'
  } finally {
    saving.value = false
  }
}

watch(openSheet, (v) => {
  if (v) {
    selectedSlug.value = regionSlug.value
    if (!regions.value.length) void loadRegions()
  }
})

onMounted(() => {
  void loadRegions()
})
</script>

<style scoped>
.fp-fade-enter-active,
.fp-fade-leave-active { transition: opacity 0.2s ease; }
.fp-fade-enter-from,
.fp-fade-leave-to { opacity: 0; }
.fp-sheet-enter-active,
.fp-sheet-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.fp-sheet-enter-from,
.fp-sheet-leave-to { transform: translateY(16px); opacity: 0; }
</style>
