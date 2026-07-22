<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 active:scale-[0.99] transition-all text-left shadow-sm"
    @click="$emit('click')"
  >
    <div
      class="w-11 h-11 rounded-full flex items-center justify-center text-base shrink-0"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ title }}</p>
      <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ subtitle }}</p>
    </div>
    <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-slate-300 dark:text-slate-600 text-sm shrink-0" />
  </button>
</template>

<script setup lang="ts">
type Tone = 'green' | 'violet' | 'blue' | 'amber' | 'rose'

interface Props {
  title: string
  subtitle: string
  icon: string
  tone?: Tone
}

const props = withDefaults(defineProps<Props>(), { tone: 'blue' })
defineEmits<{ click: [] }>()

const toneMap: Record<Tone, string> = {
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

const toneClass = computed(() => toneMap[props.tone])
</script>
