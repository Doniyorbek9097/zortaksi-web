<template>
  <button
    type="button"
    class="group relative flex flex-col items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50 hover:border-sky-300/80 dark:hover:border-sky-600/50 active:scale-[0.97] transition-all text-center shadow-sm hover:shadow-lg hover:shadow-sky-500/10 min-h-[108px]"
    @click="$emit('click')"
  >
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 shadow-sm"
      :class="toneClass"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
      {{ title }}
    </p>
    <div class="absolute inset-x-4 bottom-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
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
  green: 'bg-gradient-to-br from-emerald-400/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  violet: 'bg-gradient-to-br from-violet-400/20 to-purple-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20',
  blue: 'bg-gradient-to-br from-sky-400/20 to-blue-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20',
  amber: 'bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
  rose: 'bg-gradient-to-br from-rose-400/20 to-pink-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20',
}

const toneClass = computed(() => toneMap[props.tone])
</script>
