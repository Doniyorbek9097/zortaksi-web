<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 rounded-2xl p-4 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md active:scale-[0.98] transition-all"
    @click="$emit('click')"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      :class="colorClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ title }}</p>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ subtitle }}</p>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  subtitle: string
  color?: 'indigo' | 'amber' | 'emerald' | 'sky'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'indigo',
})

defineEmits<{ click: [] }>()

const colorMap: Record<NonNullable<Props['color']>, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
  amber: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
  sky: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
}

const colorClass = computed(() => colorMap[props.color])
</script>
