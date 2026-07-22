<template>
  <section
    class="rounded-3xl px-5 py-5 bg-gradient-to-br from-sky-50 to-blue-100/80 dark:from-sky-950/50 dark:to-slate-900 border border-sky-100 dark:border-sky-900/40 shadow-sm"
  >
    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600/80 dark:text-sky-400">
      {{ label }}
    </p>
    <div class="mt-2 flex items-end gap-2 flex-wrap">
      <p class="text-4xl md:text-5xl font-black tracking-tight text-sky-600 dark:text-sky-400 leading-none">
        {{ formattedAmount }}
      </p>
    </div>
    <p class="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
      so'm / {{ payments }} ta to'lov
    </p>
    <p class="mt-4 text-[12px] font-bold text-slate-500 dark:text-slate-400">
      Jami daromad: <span class="text-slate-700 dark:text-slate-200">{{ formattedTotal }} so'm</span>
    </p>
  </section>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  amount: number
  payments: number
  total?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Shu oy daromad',
  total: undefined,
})

const fmt = (n: number) => n.toLocaleString('ru-RU')
const formattedAmount = computed(() => fmt(props.amount))
const formattedTotal = computed(() => fmt(props.total ?? props.amount))
</script>
