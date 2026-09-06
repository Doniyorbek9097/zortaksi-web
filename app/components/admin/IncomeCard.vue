<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <!-- Sarlavha -->
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 via-indigo-50 to-sky-50 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-sky-950/20"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-coins" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Daromad statistikasi
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Kunlik · Haftalik · Oylik
            </p>
          </div>
        </div>
        <span
          v-if="changePercent != null"
          class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tabular-nums"
          :class="
            changePercent >= 0
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
          "
        >
          <font-awesome-icon
            :icon="changePercent >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"
            class="text-[9px]"
          />
          {{ changePercent > 0 ? '+' : '' }}{{ changePercent }}%
        </span>
      </div>
    </div>

    <!-- 3 davr -->
    <div class="grid grid-cols-3 gap-2 p-3">
      <div
        class="rounded-xl p-2.5 min-h-[96px] flex flex-col border bg-emerald-50 dark:bg-emerald-950/35 border-emerald-100 dark:border-emerald-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[11px] mb-2 shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-calendar-day" />
        </div>
        <p class="text-[9px] font-black uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
          Bugun
        </p>
        <p
          class="mt-1 text-[14px] font-black tabular-nums leading-tight text-emerald-700 dark:text-emerald-300 break-all"
        >
          {{ formattedToday }}
        </p>
        <p class="mt-auto pt-1.5 text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70">
          {{ todayPayments }} to'lov
        </p>
      </div>

      <div
        class="rounded-xl p-2.5 min-h-[96px] flex flex-col border bg-sky-50 dark:bg-sky-950/35 border-sky-100 dark:border-sky-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white text-[11px] mb-2 shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-chart-line" />
        </div>
        <p class="text-[9px] font-black uppercase tracking-wide text-sky-600/90 dark:text-sky-400/90">
          7 kun
        </p>
        <p
          class="mt-1 text-[14px] font-black tabular-nums leading-tight text-sky-700 dark:text-sky-300 break-all"
        >
          {{ formattedWeek }}
        </p>
        <p class="mt-auto pt-1.5 text-[9px] font-bold text-sky-600/70 dark:text-sky-400/70">
          {{ weekPayments }} to'lov
        </p>
      </div>

      <div
        class="rounded-xl p-2.5 min-h-[96px] flex flex-col border bg-violet-50 dark:bg-violet-950/35 border-violet-100 dark:border-violet-900/50"
      >
        <div
          class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] mb-2 shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-money-bill" />
        </div>
        <p class="text-[9px] font-black uppercase tracking-wide text-violet-600/90 dark:text-violet-400/90">
          Shu oy
        </p>
        <p
          class="mt-1 text-[14px] font-black tabular-nums leading-tight text-violet-700 dark:text-violet-300 break-all"
        >
          {{ formattedAmount }}
        </p>
        <p class="mt-auto pt-1.5 text-[9px] font-bold text-violet-600/70 dark:text-violet-400/70">
          {{ payments }} to'lov
        </p>
      </div>
    </div>

    <!-- To'lov turlari (shu oy) -->
    <div class="mx-3 mb-2 grid grid-cols-2 gap-1.5">
      <div
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-sky-200/70 dark:border-sky-800/50 bg-sky-500/[0.06] dark:bg-sky-950/30"
      >
        <div
          class="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-white text-[9px] shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-bolt" />
        </div>
        <div class="min-w-0 flex-1 leading-none">
          <p class="text-[8px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Click
          </p>
          <p class="text-[12px] font-black tabular-nums text-sky-800 dark:text-sky-200 truncate">
            {{ formattedClick }}
          </p>
        </div>
        <span class="text-[8px] font-bold text-sky-500/80 shrink-0 tabular-nums">
          {{ clickPayments }}
        </span>
      </div>
      <div
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-violet-200/70 dark:border-violet-800/50 bg-violet-500/[0.06] dark:bg-violet-950/30"
      >
        <div
          class="w-6 h-6 rounded-md bg-violet-500 flex items-center justify-center text-white text-[9px] shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-credit-card" />
        </div>
        <div class="min-w-0 flex-1 leading-none">
          <p class="text-[8px] font-black uppercase tracking-wide text-violet-600 dark:text-violet-400">
            Card
          </p>
          <p class="text-[12px] font-black tabular-nums text-violet-800 dark:text-violet-200 truncate">
            {{ formattedCard }}
          </p>
        </div>
        <span class="text-[8px] font-bold text-violet-500/80 shrink-0 tabular-nums">
          {{ cardPayments }}
        </span>
      </div>
    </div>

    <!-- Jami -->
    <div
      class="mx-3 mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border border-emerald-200/70 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/35"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] shrink-0 shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-wallet" />
        </div>
        <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate">
          Jami daromad
        </span>
      </div>
      <span
        class="text-[13px] font-black tabular-nums text-emerald-800 dark:text-emerald-100 shrink-0"
      >
        {{ formattedTotal }} so'm
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  amount: number
  payments: number
  total?: number
  changePercent?: number | null
  todayAmount?: number
  todayPayments?: number
  weekAmount?: number
  weekPayments?: number
  clickAmount?: number
  clickPayments?: number
  cardAmount?: number
  cardPayments?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Shu oy daromad',
  total: undefined,
  changePercent: null,
  todayAmount: 0,
  todayPayments: 0,
  weekAmount: 0,
  weekPayments: 0,
  clickAmount: 0,
  clickPayments: 0,
  cardAmount: 0,
  cardPayments: 0,
})

const fmt = (n: number) => n.toLocaleString('ru-RU')
const formattedAmount = computed(() => fmt(props.amount))
const formattedTotal = computed(() => fmt(props.total ?? props.amount))
const formattedToday = computed(() => fmt(props.todayAmount))
const formattedWeek = computed(() => fmt(props.weekAmount))
const formattedClick = computed(() => fmt(props.clickAmount))
const formattedCard = computed(() => fmt(props.cardAmount))
</script>
