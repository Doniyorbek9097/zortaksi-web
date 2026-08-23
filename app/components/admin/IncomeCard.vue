<template>
  <section
    class="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-sky-950 text-white shadow-2xl shadow-sky-900/25 border border-white/10"
  >
    <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
    <div class="absolute -left-6 bottom-0 w-28 h-28 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none" />

    <div class="relative z-[1] flex items-start justify-between gap-3">
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.25em] text-sky-300/90">
          {{ label }}
        </p>
        <div class="mt-2 flex items-end gap-2 flex-wrap">
          <p class="text-4xl sm:text-[42px] font-black tracking-tight leading-none tabular-nums">
            {{ formattedAmount }}
          </p>
          <span class="text-sm font-bold text-sky-200/80 pb-1">so'm</span>
        </div>
      </div>
      <div
        class="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 border border-white/10 text-sky-300 shrink-0"
      >
        <font-awesome-icon icon="fa-solid fa-chart-line" class="text-lg" />
      </div>
    </div>

    <div class="relative z-[1] mt-4 flex flex-wrap items-center gap-2">
      <span
        v-if="changePercent != null"
        class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full"
        :class="changePercent >= 0
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
          : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'"
      >
        <font-awesome-icon
          :icon="changePercent >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"
          class="text-[10px]"
        />
        {{ changePercent > 0 ? '+' : '' }}{{ changePercent }}%
      </span>
      <span class="text-[11px] font-bold text-slate-300">
        {{ payments }} ta to'lov
      </span>
    </div>

    <div class="relative z-[1] mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
      <p class="text-[11px] font-bold text-slate-400">
        Jami daromad
      </p>
      <p class="text-sm font-black tabular-nums text-white">
        {{ formattedTotal }} <span class="text-slate-400 font-bold">so'm</span>
      </p>
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
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Shu oy daromad',
  total: undefined,
  changePercent: null,
})

const fmt = (n: number) => n.toLocaleString('ru-RU')
const formattedAmount = computed(() => fmt(props.amount))
const formattedTotal = computed(() => fmt(props.total ?? props.amount))
</script>
