<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800"
      :class="headerGradient"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-sm shrink-0"
            :class="iconGradient"
          >
            <font-awesome-icon :icon="headerIcon" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight truncate">
              {{ name }}
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {{ info }}
            </p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <template v-if="price > 0 || active">
            <p
              class="text-[15px] font-black tabular-nums leading-none"
              :class="isPost ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-violet-600 dark:text-violet-400'"
            >
              {{ formattedPrice }}
            </p>
            <p class="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              so'm · {{ durationLabel }}
            </p>
          </template>
          <p v-else class="text-[10px] font-bold text-slate-400 dark:text-slate-500 max-w-[88px] leading-snug">
            To'lov sahifasida tanlang
          </p>
        </div>
      </div>
    </div>

    <div class="p-3 space-y-3">
      <div
        v-if="!active && inactiveHint"
        class="rounded-xl px-3 py-2.5 text-center text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/35 border border-amber-200/70 dark:border-amber-800/50"
      >
        {{ inactiveHintText }}
      </div>

      <div
        v-if="active"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide"
        :class="activeBadgeClass"
      >
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="activeDotClass" />
        {{ activeBadgeText }}
      </div>

      <div v-if="active && hasDeadline" class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Qolgan vaqt
            </p>
            <p
              v-if="startDate && startDate !== '—'"
              class="mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500"
            >
              Ulangan: {{ startDate }}
            </p>
          </div>
          <p class="text-[11px] font-black shrink-0" :class="remainingTextClass">
            {{ remainingLabel }}
          </p>
        </div>

        <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-[width] duration-1000 ease-linear"
            :class="progressBarClass"
            :style="{ width: `${progressPct}%` }"
          />
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="unit in units"
            :key="unit.key"
            class="rounded-xl border px-1.5 py-2.5 text-center"
            :class="countdownCellClass"
          >
            <p class="text-[20px] font-black tabular-nums leading-none" :class="countdownValueClass">
              {{ unit.value }}
            </p>
            <p class="mt-1.5 text-[9px] font-black uppercase tracking-wider" :class="countdownLabelClass">
              {{ unit.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-xl p-2.5 border"
          :class="startDateCardClass"
        >
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] mb-2 shadow-sm"
            :class="startDateIconClass"
          >
            <font-awesome-icon icon="fa-solid fa-calendar-day" />
          </div>
          <p class="text-[9px] font-black uppercase tracking-wide" :class="startDateLabelClass">
            Ulangan sana
          </p>
          <p class="mt-1 text-sm font-black tabular-nums leading-tight" :class="startDateValueClass">
            {{ startDate }}
          </p>
        </div>
        <div
          class="rounded-xl p-2.5 border"
          :class="endDateCardClass"
        >
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] mb-2 shadow-sm"
            :class="endDateIconClass"
          >
            <font-awesome-icon icon="fa-solid fa-clock" />
          </div>
          <p class="text-[9px] font-black uppercase tracking-wide" :class="endDateLabelClass">
            {{ endDateTitle }}
          </p>
          <p class="mt-1 text-sm font-black tabular-nums leading-tight" :class="endDateValueClass">
            {{ endDate }}
          </p>
        </div>
      </div>

      <button
        v-if="!active && showBuy"
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider active:scale-[0.98] transition-all"
        :class="buyButtonClass"
        @click="$emit('buy')"
      >
        <font-awesome-icon :icon="buyButtonIcon" />
        {{ buyButtonLabel }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
type TariffCardVariant = 'order' | 'post'

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
  showBuy?: boolean
  inactiveHint?: boolean
  /** buyurtma | auto e'lon */
  variant?: TariffCardVariant
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
  showBuy: true,
  inactiveHint: true,
  variant: 'order',
})

defineEmits<{ buy: [] }>()

const isPost = computed(() => props.variant === 'post')

const headerGradient = computed(() =>
  isPost.value
    ? 'bg-gradient-to-r from-violet-50 via-fuchsia-50 to-emerald-50 dark:from-violet-950/35 dark:via-fuchsia-950/25 dark:to-emerald-950/20'
    : 'bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 dark:from-sky-950/30 dark:via-cyan-950/20 dark:to-emerald-950/20',
)

const iconGradient = computed(() =>
  isPost.value
    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
    : 'bg-gradient-to-br from-sky-500 to-cyan-600',
)

const headerIcon = computed(() =>
  isPost.value ? 'fa-solid fa-bullhorn' : 'fa-solid fa-tags',
)

const inactiveHintText = computed(() =>
  isPost.value
    ? "Auto e'lon tarqatish uchun tarif faollashtiring"
    : 'Buyurtmalarni olish uchun tarif faollashtiring',
)

const activeBadgeClass = computed(() =>
  isPost.value
    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
)

const activeDotClass = computed(() =>
  isPost.value ? 'bg-fuchsia-500' : 'bg-emerald-500',
)

const activeBadgeText = computed(() =>
  isPost.value ? "Auto e'lon faol" : 'Faol tarif',
)

const remainingTextClass = computed(() =>
  isPost.value
    ? 'text-fuchsia-600 dark:text-fuchsia-400'
    : 'text-orange-600 dark:text-orange-400',
)

const progressBarClass = computed(() =>
  isPost.value
    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
    : 'bg-gradient-to-r from-orange-500 to-amber-400',
)

const countdownCellClass = computed(() =>
  isPost.value
    ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50'
    : 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50',
)

const countdownValueClass = computed(() =>
  isPost.value
    ? 'text-violet-600 dark:text-violet-400'
    : 'text-orange-600 dark:text-orange-400',
)

const countdownLabelClass = computed(() =>
  isPost.value
    ? 'text-violet-500/80 dark:text-violet-400/80'
    : 'text-orange-500/80 dark:text-orange-400/80',
)

const startDateCardClass = computed(() =>
  isPost.value
    ? 'bg-violet-50 dark:bg-violet-950/35 border-violet-100 dark:border-violet-900/50'
    : 'bg-emerald-50 dark:bg-emerald-950/35 border-emerald-100 dark:border-emerald-900/50',
)

const startDateIconClass = computed(() =>
  isPost.value ? 'bg-violet-500' : 'bg-emerald-500',
)

const startDateLabelClass = computed(() =>
  isPost.value
    ? 'text-violet-600/90 dark:text-violet-400/90'
    : 'text-emerald-600/90 dark:text-emerald-400/90',
)

const startDateValueClass = computed(() =>
  isPost.value
    ? 'text-violet-800 dark:text-violet-200'
    : 'text-emerald-800 dark:text-emerald-200',
)

const endDateCardClass = computed(() =>
  isPost.value
    ? 'bg-fuchsia-50 dark:bg-fuchsia-950/35 border-fuchsia-100 dark:border-fuchsia-900/50'
    : 'bg-sky-50 dark:bg-sky-950/35 border-sky-100 dark:border-sky-900/50',
)

const endDateIconClass = computed(() =>
  isPost.value ? 'bg-fuchsia-500' : 'bg-sky-500',
)

const endDateLabelClass = computed(() =>
  isPost.value
    ? 'text-fuchsia-600/90 dark:text-fuchsia-400/90'
    : 'text-sky-600/90 dark:text-sky-400/90',
)

const endDateValueClass = computed(() =>
  isPost.value
    ? 'text-fuchsia-800 dark:text-fuchsia-200'
    : 'text-sky-800 dark:text-sky-200',
)

const buyButtonClass = computed(() =>
  isPost.value
    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50'
    : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/50',
)

const buyButtonIcon = computed(() =>
  isPost.value ? 'fa-solid fa-bullhorn' : 'fa-solid fa-wallet',
)

const buyButtonLabel = computed(() =>
  isPost.value ? "E'lon tarifini ulash" : 'Tarif sotib olish',
)

const endDateTitle = computed(() =>
  isPost.value ? 'Uzilish sanasi' : 'Tugash sanasi',
)

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

const durationLabel = computed(() => {
  if (props.active && hasDeadline.value) {
    const ms = remainingMs.value
    if (ms <= 0) return 'Muddati tugadi'
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    if (days > 0) return `${days} kun`
    if (hours > 0) return `${hours} soat`
    const minutes = Math.floor((ms % 3600000) / 60000)
    return minutes > 0 ? `${minutes} daq` : '1 daq'
  }
  return `${props.expireDays} kun`
})

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
