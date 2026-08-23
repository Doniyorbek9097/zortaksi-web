<template>
  <section
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
  >
    <div class="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {{ title }}
        </h3>
        <p class="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {{ subtitle }}
        </p>
      </div>
      <button
        v-if="refreshable"
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
        aria-label="Yangilash"
        :disabled="loading"
        @click="reload"
      >
        <font-awesome-icon
          icon="fa-solid fa-rotate-right"
          :class="loading ? 'animate-spin' : ''"
        />
      </button>
    </div>

    <div v-if="loading && !items.length" class="px-4 pb-4 space-y-2">
      <div v-for="n in 3" :key="n" class="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>

    <div
      v-else-if="error"
      class="mx-4 mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-center text-[12px] font-bold text-red-500"
    >
      {{ error }}
    </div>

    <div
      v-else-if="!items.length"
      class="flex flex-col items-center justify-center px-4 py-8 text-center text-slate-400 dark:text-slate-500"
    >
      <font-awesome-icon icon="fa-solid fa-receipt" class="text-xl mb-2 opacity-50" />
      <p class="text-[12px] font-medium">Hali to'lov yo'q</p>
    </div>

  <div v-else ref="listRootEl" class="relative">
      <!-- Virtual scroll — faqat ko'rinadigan qatorlar DOM da -->
      <div :style="{ height: `${virtual.range.paddingTop}px` }" aria-hidden="true" />

      <ul class="divide-y divide-slate-100 dark:divide-slate-800">
        <li
          v-for="{ row } in virtual.range.visible"
          :key="row.key"
          class="flex items-center gap-3 px-4 py-3"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="iconClass(row.data)"
          >
            <font-awesome-icon :icon="iconName(row.data)" class="text-sm" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
              {{ titleFor(row.data) }}
            </p>
            <p
              v-if="showDriver && (row.data.driverName || row.data.userId)"
              class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate"
            >
              {{ row.data.driverName || row.data.userId }}
              <span v-if="row.data.driverPhone" class="font-medium text-slate-400">
                · {{ row.data.driverPhone }}
              </span>
            </p>
            <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {{ formatDate(row.data.createdAt) }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-black text-emerald-500">
              +{{ formatMoney(row.data.amount) }}
            </p>
            <p class="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
              {{ statusLabel(row.data.status) }}
            </p>
          </div>
        </li>
      </ul>

      <div :style="{ height: `${virtual.range.paddingBottom}px` }" aria-hidden="true" />

      <div ref="sentinelEl" class="h-1" />

      <div
        v-if="loadingMore"
        class="py-3 flex justify-center"
      >
        <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-slate-400" />
      </div>

      <p
        v-else-if="!hasMore && items.length"
        class="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha to'lovlar ko'rsatildi
      </p>
    </div>

    <div
      v-if="moreTo && items.length && !paginated"
      class="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800"
    >
      <NuxtLink
        :to="moreTo"
        class="block text-center text-[12px] font-black text-sky-500 hover:text-sky-600"
      >
        Barcha to'lovlar
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { PAYMENT_PAGE_SIZE, PAYMENT_ROW_HEIGHT } from '~/utils/memoryBudget'
import { useWindowVirtualRows, type VirtualRow } from '~/composables/useWindowVirtualRows'

export interface PaymentHistoryItem {
  id: string
  amount: number
  kind: 'admin_credit' | 'self_buy' | 'admin_assign'
  tariffName?: string | null
  note?: string
  createdAt: string | Date
  status?: string
  userId?: string
  driverName?: string | null
  driverPhone?: string | null
}

const props = withDefaults(defineProps<{
  refreshable?: boolean
  moreTo?: string
  apiPath?: string
  showDriver?: boolean
  title?: string
  subtitle?: string
  /** Infinite scroll (default) yoki bir martalik yuklash */
  paginated?: boolean
  pageSize?: number
}>(), {
  refreshable: true,
  moreTo: '',
  apiPath: '/me/payments',
  showDriver: false,
  title: "To'lovlar tarixi",
  subtitle: "Hisob to'ldirish va to'lovlar",
  paginated: true,
  pageSize: PAYMENT_PAGE_SIZE,
})

const items = ref<PaymentHistoryItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(true)
const listRootEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null

const virtualRows = computed<VirtualRow<PaymentHistoryItem>[]>(() =>
  items.value.map((item) => ({
    key: item.id,
    height: PAYMENT_ROW_HEIGHT,
    data: item,
  })),
)

const virtual = useWindowVirtualRows(virtualRows, 3)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const formatDate = (raw: string | Date) => {
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusLabel = (status?: string) => {
  if (String(status || '').toLowerCase() === 'paid') return 'Muvaffaqiyatli'
  return 'Yakunlangan'
}

const titleFor = (item: PaymentHistoryItem) => {
  const note = String(item.note || '')
  if (item.kind === 'self_buy') {
    return item.tariffName ? `Tarif: ${item.tariffName}` : 'Tarif sotib olish'
  }
  if (item.kind === 'admin_assign') {
    return item.tariffName ? `Tarif: ${item.tariffName}` : 'Tarif ulash'
  }
  if (note.includes('tariff') && item.tariffName) {
    return `To'lov + ${item.tariffName}`
  }
  if (item.tariffName) return `Hisob to'ldirish · ${item.tariffName}`
  return "Hisob to'ldirish"
}

const iconName = (item: PaymentHistoryItem) => {
  if (item.kind === 'self_buy' || item.kind === 'admin_assign') return 'fa-solid fa-tags'
  return 'fa-solid fa-wallet'
}

const iconClass = (item: PaymentHistoryItem) => {
  if (item.kind === 'self_buy' || item.kind === 'admin_assign') {
    return 'bg-violet-50 text-violet-500 dark:bg-violet-950/40 dark:text-violet-400'
  }
  return 'bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400'
}

const fetchPage = async (nextPage: number, append: boolean) => {
  if (!props.apiPath) return
  if (append) loadingMore.value = true
  else loading.value = true
  error.value = ''
  try {
    const res = await useApi(props.apiPath, {
      params: {
        page: nextPage,
        limit: props.pageSize,
      },
    })
    if (res.success) {
      const batch = Array.isArray(res.data?.items) ? res.data.items : []
      if (append) {
        const seen = new Set(items.value.map((i) => i.id))
        items.value = [...items.value, ...batch.filter((i: PaymentHistoryItem) => !seen.has(i.id))]
      } else {
        items.value = batch
      }
      const pagination = res.data?.pagination
      page.value = pagination?.page ?? nextPage
      hasMore.value = pagination
        ? pagination.page < pagination.totalPages
        : batch.length >= props.pageSize
    } else {
      error.value = res.message || 'Tarix yuklanmadi'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tarix yuklanmadi'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const load = async () => {
  page.value = 1
  hasMore.value = true
  await fetchPage(1, false)
}

const reload = () => void load()

const loadMore = () => {
  if (!props.paginated || loading.value || loadingMore.value || !hasMore.value) return
  void fetchPage(page.value + 1, true)
}

const bindLoadMore = () => {
  if (!import.meta.client || !props.paginated) return
  loadMoreObserver?.disconnect()
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '400px' },
  )
  if (sentinelEl.value) loadMoreObserver.observe(sentinelEl.value)
}

watch(sentinelEl, (el) => {
  if (loadMoreObserver && el) loadMoreObserver.observe(el)
})

watch(() => props.apiPath, () => { void load() })

onMounted(() => {
  void load().then(() => bindLoadMore())
})

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
})

defineExpose({ load, reload })
</script>
