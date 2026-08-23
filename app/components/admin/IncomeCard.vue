<template>
  <section class="rounded-2xl bg-sky-600 dark:bg-sky-700 p-4 text-white space-y-3">
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-xl bg-white/10 px-2 py-2">
        <p class="text-[9px] font-bold uppercase text-sky-100">Bugun</p>
        <p class="mt-0.5 text-sm font-black tabular-nums leading-tight">
          {{ formattedToday }}
        </p>
        <p class="text-[9px] text-sky-200">{{ todayPayments }} to'lov</p>
      </div>
      <div class="rounded-xl bg-white/10 px-2 py-2">
        <p class="text-[9px] font-bold uppercase text-sky-100">7 kun</p>
        <p class="mt-0.5 text-sm font-black tabular-nums leading-tight">
          {{ formattedWeek }}
        </p>
        <p class="text-[9px] text-sky-200">{{ weekPayments }} to'lov</p>
      </div>
      <div class="rounded-xl bg-white/15 px-2 py-2 ring-1 ring-white/20">
        <p class="text-[9px] font-bold uppercase text-sky-100">Shu oy</p>
        <p class="mt-0.5 text-sm font-black tabular-nums leading-tight">
          {{ formattedAmount }}
        </p>
        <p class="text-[9px] text-sky-200">{{ payments }} to'lov</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold">
      <span
        v-if="changePercent != null"
        class="px-2 py-0.5 rounded-md"
        :class="changePercent >= 0 ? 'bg-emerald-500/25 text-emerald-100' : 'bg-rose-500/25 text-rose-100'"
      >
        {{ changePercent > 0 ? '+' : '' }}{{ changePercent }}% oyga
      </span>
      <span class="text-sky-100">Jami: {{ formattedTotal }} so'm</span>
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
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Shu oy daromad',
  total: undefined,
  changePercent: null,
  todayAmount: 0,
  todayPayments: 0,
  weekAmount: 0,
  weekPayments: 0,
})

const fmt = (n: number) => n.toLocaleString('ru-RU')
const formattedAmount = computed(() => fmt(props.amount))
const formattedTotal = computed(() => fmt(props.total ?? props.amount))
const formattedToday = computed(() => fmt(props.todayAmount))
const formattedWeek = computed(() => fmt(props.weekAmount))
</script>
