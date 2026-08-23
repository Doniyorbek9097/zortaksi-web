<template>
  <section class="rounded-2xl bg-sky-600 dark:bg-sky-700 p-4 text-white">
    <p class="text-[10px] font-bold uppercase tracking-wide text-sky-100">
      {{ label }}
    </p>
    <p class="mt-1 text-3xl font-black tabular-nums leading-none">
      {{ formattedAmount }}
      <span class="text-sm font-bold text-sky-200">so'm</span>
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
      <span
        v-if="changePercent != null"
        class="px-2 py-0.5 rounded-md"
        :class="changePercent >= 0 ? 'bg-emerald-500/25 text-emerald-100' : 'bg-rose-500/25 text-rose-100'"
      >
        {{ changePercent > 0 ? '+' : '' }}{{ changePercent }}%
      </span>
      <span class="text-sky-100">{{ payments }} ta to'lov</span>
    </div>
    <div class="mt-3 pt-3 border-t border-sky-500/40 flex justify-between gap-2 text-[11px]">
      <span class="text-sky-200 font-semibold">Jami daromad</span>
      <span class="font-black tabular-nums">{{ formattedTotal }} so'm</span>
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
