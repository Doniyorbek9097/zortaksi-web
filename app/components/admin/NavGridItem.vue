<template>
  <button
    type="button"
    class="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 active:scale-[0.98] transition-all text-center shadow-sm min-h-[104px]"
    @click="$emit('click')"
  >
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p class="text-[12px] font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
      {{ title }}
    </p>
  </button>
</template>

<script setup lang="ts">
type Tone = 'green' | 'violet' | 'blue' | 'amber' | 'rose'

interface Props {
  title: string
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
