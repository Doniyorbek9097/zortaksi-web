<template>
  <button
    type="button"
    class="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-[0.98] transition-transform text-center min-h-[96px]"
    @click="$emit('click')"
  >
    <div
      class="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
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
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  blue: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
}

const toneClass = computed(() => toneMap[props.tone])
</script>
