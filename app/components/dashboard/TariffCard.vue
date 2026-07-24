<template>
  <div
    class="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          Obuna / Tarif
        </p>
        <h3 class="mt-0.5 text-xl font-black text-sky-600 dark:text-sky-400 truncate">
          {{ name }}
        </h3>
        <p class="mt-0.5 text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
          {{ info }}
        </p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-lg font-black text-violet-600 dark:text-violet-400 leading-none">
          {{ formattedPrice }} so'm
        </p>
        <p class="mt-1 text-[12px] font-bold text-slate-400 dark:text-slate-500">
          {{ expireDays }} kun
        </p>
      </div>
    </div>

    <!-- Warning when inactive -->
    <div
      v-if="!active"
      class="mt-4 rounded-xl px-4 py-3 text-center text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-400/30 dark:border-amber-500/20"
    >
      Buyurtmalarni olish uchun tarif faollashtiring
    </div>

    <!-- Live remaining time (active only) -->
    <div v-if="active && hasDeadline" class="mt-4 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          Qolgan vaqt
        </p>
        <p class="text-[11px] font-black text-slate-700 dark:text-slate-200">
          {{ remainingLabel }}
        </p>
      </div>

      <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width] duration-1000 ease-linear"
          :style="{ width: `${progressPct}%` }"
        />
      </div>

      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="unit in units"
          :key="unit.key"
          class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-1.5 py-2.5 text-center"
        >
          <p class="text-[22px] font-black tabular-nums leading-none text-orange-500 dark:text-orange-400">
            {{ unit.value }}
          </p>
          <p class="mt-1.5 text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
            {{ unit.label }}
          </p>
        </div>
      </div>
    </div>

    <!-- Dates -->
    <div
      class="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800"
    >
      <div class="pr-3 border-r border-slate-100 dark:border-slate-800">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Ulangan sana
        </p>
        <p class="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
          {{ startDate }}
        </p>
      </div>
      <div class="pl-1">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Tugash sanasi
        </p>
        <p class="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
          {{ endDate }}
        </p>
      </div>
    </div>

    <button
      v-if="!active"
      type="button"
      class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 active:scale-[0.98] transition-all"
      @click="$emit('buy')"
    >
      <font-awesome-icon icon="fa-solid fa-wallet" />
      Tarif sotib olish
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name?: string
  info?: string
  price?: number
  expireDays?: number
  startDate?: string
  endDate?: string
  /** ISO — jonli countdown uchun */
  startedAt?: string | Date | null
  expireAt?: string | Date | null
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Kunlik sinov',
  info: '1 - martalik sinov tarifi',
  price: 5000,
  expireDays: 1,
  startDate: '—',
  endDate: '—',
  startedAt: null,
  expireAt: null,
  active: false,
})

defineEmits<{ buy: [] }>()

const formattedPrice = computed(() => props.price.toLocaleString('ru-RU'))

const nowMs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const expireMs = computed(() => {
  if (!props.expireAt) return null
  const t = new Date(props.expireAt).getTime()
  return Number.isNaN(t) ? null : t
})

const startMs = computed(() => {
  if (!props.startedAt) return null
  const t = new Date(props.startedAt).getTime()
  return Number.isNaN(t) ? null : t
})

const hasDeadline = computed(() => expireMs.value != null)

const remainingMs = computed(() => {
  if (expireMs.value == null) return 0
  return Math.max(0, expireMs.value - nowMs.value)
})

const pad2 = (n: number) => String(n).padStart(2, '0')

const units = computed(() => {
  const ms = remainingMs.value
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  return [
    { key: 'd', value: pad2(days), label: 'Kun' },
    { key: 'h', value: pad2(hours), label: 'Soat' },
    { key: 'm', value: pad2(minutes), label: 'Daqiqa' },
    { key: 's', value: pad2(seconds), label: 'Soniya' },
  ]
})

const remainingLabel = computed(() => {
  const ms = remainingMs.value
  if (ms <= 0) return 'Muddati tugadi'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `${days} kun qoldi`
  if (hours > 0) return `${hours} soat qoldi`
  const minutes = Math.floor((ms % 3600000) / 60000)
  if (minutes > 0) return `${minutes} daqiqa qoldi`
  return '1 daqiqadan kam'
})

/** Qolgan foiz (to‘liq = 100%) */
const progressPct = computed(() => {
  const end = expireMs.value
  if (end == null) return 0
  const start =
    startMs.value ??
    end - Math.max(1, props.expireDays) * 86400000
  const total = Math.max(1, end - start)
  const left = Math.max(0, end - nowMs.value)
  return Math.min(100, Math.max(0, (left / total) * 100))
})

onMounted(() => {
  if (!import.meta.client) return
  timer = setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
