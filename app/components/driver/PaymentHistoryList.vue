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
        @click="load"
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

    <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800">
      <li
        v-for="item in displayItems"
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
      </li>
    </ul>

    <div
      v-if="(moreTo && items.length) || truncated"
      class="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800"
    >
      <NuxtLink
        v-if="moreTo && items.length"
        :to="moreTo"
        class="block text-center text-[12px] font-black text-sky-500 hover:text-sky-600"
      >
        Barcha to'lovlar
      </NuxtLink>
      <p
        v-else-if="truncated"
        class="text-center text-[11px] font-bold text-slate-400"
      >
        So'nggi {{ maxItems }} ta ko'rsatilmoqda
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
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
  /** Ro'yxatda ko'rsatiladigan maksimal yozuv */
  maxItems?: number
  refreshable?: boolean
  /** Profil: to'liq tarix sahifasiga link */
  moreTo?: string
  /** API yo'li (haydovchi: /me/payments, admin: /drivers/.../payments) */
  apiPath?: string
  /** Barcha to'lovlar ro'yxatida haydovchi ismini ko'rsatish */
  showDriver?: boolean
  title?: string
  subtitle?: string
}>(), {
  maxItems: 20,
  refreshable: true,
  moreTo: '',
  apiPath: '/me/payments',
  showDriver: false,
  title: "To'lovlar tarixi",
  subtitle: "Hisob to'ldirish va to'lovlar",
})

const items = ref<PaymentHistoryItem[]>([])
const loading = ref(false)
const error = ref('')

const displayItems = computed(() => items.value.slice(0, props.maxItems))
const truncated = computed(() => items.value.length > props.maxItems)

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

const load = async () => {
  if (!props.apiPath) return
  loading.value = true
  error.value = ''
  try {
    const res = await useApi(props.apiPath, {
      params: { limit: Math.max(props.maxItems, 50) },
    })
    if (res.success) {
      items.value = Array.isArray(res.data?.items) ? res.data.items : []
    } else {
      error.value = res.message || 'Tarix yuklanmadi'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tarix yuklanmadi'
  } finally {
    loading.value = false
  }
}

watch(() => props.apiPath, () => { void load() })

onMounted(load)

defineExpose({ load })
</script>
