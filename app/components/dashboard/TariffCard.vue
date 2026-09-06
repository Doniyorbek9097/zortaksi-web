<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 dark:from-sky-950/30 dark:via-cyan-950/20 dark:to-emerald-950/20"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-tags" />
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
          <p class="text-[15px] font-black tabular-nums text-violet-600 dark:text-violet-400 leading-none">
            {{ formattedPrice }}
          </p>
          <p class="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            so'm · {{ durationLabel }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-3 space-y-3">
      <div
        v-if="!active && inactiveHint"
        class="rounded-xl px-3 py-2.5 text-center text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/35 border border-amber-200/70 dark:border-amber-800/50"
      >
        Buyurtmalarni olish uchun tarif faollashtiring
      </div>

      <div
        v-if="active"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Faol tarif
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
          <p class="text-[11px] font-black text-orange-600 dark:text-orange-400 shrink-0">
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
            class="rounded-xl border px-1.5 py-2.5 text-center bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50"
          >
            <p class="text-[20px] font-black tabular-nums leading-none text-orange-600 dark:text-orange-400">
              {{ unit.value }}
            </p>
            <p class="mt-1.5 text-[9px] font-black uppercase tracking-wider text-orange-500/80 dark:text-orange-400/80">
              {{ unit.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div
          class="rounded-xl p-2.5 border bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800"
        >
          <p class="text-[9px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Ulangan sana
          </p>
          <p class="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
            {{ startDate }}
          </p>
        </div>
        <div
          class="rounded-xl p-2.5 border bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800"
        >
          <p class="text-[9px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Tugash sanasi
          </p>
          <p class="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
            {{ endDate }}
          </p>
        </div>
      </div>

      <button
        v-if="!active && showBuy"
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/50 active:scale-[0.98] transition-all"
        @click="$emit('buy')"
      >
        <font-awesome-icon icon="fa-solid fa-wallet" />
        Tarif sotib olish
      </button>
    </div>
  </section>
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
  showBuy?: boolean
  inactiveHint?: boolean
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
