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

    <div v-else>
      <ul class="divide-y divide-slate-100 dark:divide-slate-800">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3"
        >
          <span
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            :class="iconClass(item)"
          >
            <font-awesome-icon :icon="iconName(item)" class="text-sm" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
              {{ titleFor(item) }}
            </p>
            <p
              v-if="showDriver && (item.driverName || item.userId)"
              class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate"
            >
              {{ item.driverName || item.userId }}
              <span v-if="item.driverPhone" class="font-medium text-slate-400">
                · {{ item.driverPhone }}
              </span>
            </p>
            <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm font-black text-emerald-500">
              +{{ formatMoney(item.amount) }}
            </p>
            <p class="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
              {{ statusLabel(item.status) }}
            </p>
          </div>
          <button
            v-if="deletable"
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 transition-all disabled:opacity-50"
            aria-label="To'lovni o'chirish"
            :disabled="deletingId === item.id"
            @click="askDelete(item)"
          >
            <font-awesome-icon
              :icon="deletingId === item.id ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'"
              :class="deletingId === item.id ? 'animate-spin' : ''"
              class="text-xs"
            />
          </button>
        </li>
      </ul>

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

  <BaseConfirmDialog
    v-if="deletable"
    v-model="deleteOpen"
    title="To'lovni o'chirish"
    :message="deleteTarget ? deleteMessage(deleteTarget) : ''"
    confirm-text="O'chirish"
    cancel-text="Bekor qilish"
    variant="danger"
    :loading="Boolean(deletingId)"
    @confirm="confirmDelete"
  />
</template>

<script setup lang="ts">
import { PAYMENT_PAGE_SIZE } from '~/utils/memoryBudget'

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
  paginated?: boolean
  pageSize?: number
  deletable?: boolean
}>(), {
  refreshable: true,
  moreTo: '',
  apiPath: '/me/payments',
  showDriver: false,
  title: "To'lovlar tarixi",
  subtitle: "Hisob to'ldirish va to'lovlar",
  paginated: true,
  pageSize: PAYMENT_PAGE_SIZE,
  deletable: false,
})

const items = ref<PaymentHistoryItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(true)
const sentinelEl = ref<HTMLElement | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<PaymentHistoryItem | null>(null)
const deletingId = ref('')
let loadMoreObserver: IntersectionObserver | null = null

const emit = defineEmits<{ deleted: [] }>()

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
      params: { page: nextPage, limit: props.pageSize },
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

const deleteMessage = (item: PaymentHistoryItem) => {
  const amount = formatMoney(item.amount)
  const title = titleFor(item)
  const who = item.driverName || item.userId
  if (who) return `«${title}» (+${amount} so'm) — ${who}. Tarixdan o'chirilsinmi?`
  return `«${title}» (+${amount} so'm) tarixdan o'chirilsinmi?`
}

const askDelete = (item: PaymentHistoryItem) => {
  deleteTarget.value = item
  deleteOpen.value = true
}

const confirmDelete = async () => {
  const item = deleteTarget.value
  if (!item?.id || deletingId.value) return
  deletingId.value = item.id
  error.value = ''
  try {
    const res = await useApi(`/drivers/payments/${item.id}`, { method: 'DELETE' })
    if (!res.success) {
      error.value = res.message || "To'lovni o'chirib bo'lmadi"
      return
    }
    items.value = items.value.filter((i) => i.id !== item.id)
    deleteOpen.value = false
    deleteTarget.value = null
    emit('deleted')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || "To'lovni o'chirib bo'lmadi"
  } finally {
    deletingId.value = ''
  }
}

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
