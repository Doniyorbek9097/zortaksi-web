<template>
  <div
    class="rounded-xl border p-3 space-y-2.5"
    :class="panelBorder"
  >
    <div class="flex items-start gap-2.5">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-sm shrink-0"
        :class="iconClass"
      >
        <font-awesome-icon :icon="kind === 'post' ? 'fa-solid fa-bullhorn' : 'fa-solid fa-tags'" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <p class="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight">
            {{ title }}
          </p>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide"
            :class="active ? activeBadge : inactiveBadge"
          >
            <span
              v-if="active"
              class="w-1 h-1 rounded-full animate-pulse"
              :class="activeDot"
            />
            {{ active ? 'Faol' : 'Yo\'q' }}
          </span>
        </div>
        <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {{ name }}
        </p>
      </div>
    </div>

    <template v-if="active && hasDeadline">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">Qolgan vaqt</p>
        <p class="text-[10px] font-black shrink-0" :class="accentText">{{ remainingLabel }}</p>
      </div>
      <div class="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          class="h-full rounded-full transition-[width] duration-1000 ease-linear"
          :class="progressClass"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
      <div class="grid grid-cols-4 gap-1.5">
        <div
          v-for="unit in units"
          :key="unit.key"
          class="rounded-lg border px-1 py-1.5 text-center"
          :class="cellClass"
        >
          <p class="text-[15px] font-black tabular-nums leading-none" :class="accentText">
            {{ unit.value }}
          </p>
          <p class="mt-1 text-[8px] font-black uppercase tracking-wide opacity-80" :class="accentText">
            {{ unit.label }}
          </p>
        </div>
      </div>
      <div class="flex items-center justify-between gap-2 text-[10px] font-bold tabular-nums">
        <span class="text-slate-500 dark:text-slate-400">
          <span class="font-black text-slate-600 dark:text-slate-300">Ulangan:</span>
          {{ startDate }}
        </span>
        <span class="text-slate-400">→</span>
        <span class="text-right" :class="accentText">
          <span class="font-black opacity-80">{{ endLabel }}:</span>
          {{ endDate }}
        </span>
      </div>
    </template>

    <template v-else>
      <p
        class="text-[10px] font-bold text-center rounded-lg px-2 py-2 leading-snug"
        :class="inactiveHintClass"
      >
        {{ inactiveHint }}
      </p>
      <button
        type="button"
        class="w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-wide active:scale-[0.98] transition-all"
        :class="buyClass"
        @click="$emit('buy')"
      >
        {{ buyLabel }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTariffCountdown } from '~/composables/dashboard/useTariffCountdown'

type Kind = 'order' | 'post'

const props = withDefaults(
  defineProps<{
    kind: Kind
    name: string
    startDate: string
    endDate: string
    startedAt?: string | Date | null
    expireAt?: string | Date | null
    expireDays?: number
    active?: boolean
    nowMs: number
  }>(),
  {
    startedAt: null,
    expireAt: null,
    expireDays: 1,
    active: false,
  },
)

defineEmits<{ buy: [] }>()

const title = computed(() =>
  props.kind === 'post' ? "Auto e'lon tarqatish" : 'Buyurtma tarifi',
)

const endLabel = computed(() =>
  props.kind === 'post' ? 'Uzilish' : 'Tugash',
)

const inactiveHint = computed(() =>
  props.kind === 'post'
    ? "Guruhlarda avtomatik e'lon uchun tarif ulang"
    : 'Buyurtmalarni olish uchun tarif ulang',
)

const buyLabel = computed(() =>
  props.kind === 'post' ? "E'lon tarifini ulash" : 'Buyurtma tarifini ulash',
)

const nowMs = toRef(props, 'nowMs')
const expireAt = toRef(props, 'expireAt')
const startedAt = toRef(props, 'startedAt')
const expireDays = toRef(props, 'expireDays')

const { hasDeadline, units, remainingLabel, progressPct } = useTariffCountdown({
  expireAt,
  startedAt,
  expireDays,
  nowMs,
})

const isPost = computed(() => props.kind === 'post')

const panelBorder = computed(() =>
  isPost.value
    ? 'border-violet-200/80 dark:border-violet-900/50 bg-violet-50/40 dark:bg-violet-950/15'
    : 'border-sky-200/80 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/15',
)

const iconClass = computed(() =>
  isPost.value
    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
    : 'bg-gradient-to-br from-sky-500 to-cyan-600',
)

const accentText = computed(() =>
  isPost.value
    ? 'text-violet-600 dark:text-violet-400'
    : 'text-orange-600 dark:text-orange-400',
)

const progressClass = computed(() =>
  isPost.value
    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400'
    : 'bg-gradient-to-r from-orange-500 to-amber-400',
)

const cellClass = computed(() =>
  isPost.value
    ? 'bg-white/80 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40'
    : 'bg-white/80 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/40',
)

const activeBadge = computed(() =>
  isPost.value
    ? 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200'
    : 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
)

const inactiveBadge = computed(() =>
  'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
)

const activeDot = computed(() =>
  isPost.value ? 'bg-fuchsia-500' : 'bg-emerald-500',
)

const inactiveHintClass = computed(() =>
  isPost.value
    ? 'text-violet-700/90 dark:text-violet-300/90 bg-violet-100/60 dark:bg-violet-950/40'
    : 'text-amber-800/90 dark:text-amber-200/90 bg-amber-100/60 dark:bg-amber-950/35',
)

const buyClass = computed(() =>
  isPost.value
    ? 'text-violet-800 dark:text-violet-200 bg-white dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800'
    : 'text-sky-800 dark:text-sky-200 bg-white dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800',
)
</script>
