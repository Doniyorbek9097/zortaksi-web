<template>
  <section
    class="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 overflow-hidden"
  >
    <div class="px-4 pt-4 pb-2 flex items-center justify-between gap-2 border-b border-slate-100/80 dark:border-slate-800/80">
      <div class="flex items-center gap-2 min-w-0">
        <span
          v-if="icon"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
          :class="iconToneClass"
        >
          <font-awesome-icon :icon="icon" />
        </span>
        <h3 class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 truncate">
          {{ title }}
        </h3>
      </div>
      <slot name="action" />
    </div>
    <div :class="noPadding ? '' : 'px-4 pb-4 pt-3'">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
type IconTone = 'sky' | 'violet' | 'amber' | 'emerald' | 'rose'

const props = withDefaults(defineProps<{
  title: string
  noPadding?: boolean
  icon?: string
  iconTone?: IconTone
}>(), {
  noPadding: false,
  icon: '',
  iconTone: 'sky',
})

const toneMap: Record<IconTone, string> = {
  sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

const iconToneClass = computed(() => toneMap[props.iconTone])
</script>
