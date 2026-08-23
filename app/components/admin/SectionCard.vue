<template>
  <section class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div class="px-4 py-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2 min-w-0">
        <span
          v-if="icon"
          class="w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0"
          :class="iconToneClass"
        >
          <font-awesome-icon :icon="icon" />
        </span>
        <h3 class="text-[12px] font-black text-slate-700 dark:text-slate-200">
          {{ title }}
        </h3>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span
          v-if="headerValue"
          class="text-[12px] font-black tabular-nums text-sky-600 dark:text-sky-400"
        >
          {{ headerValue }}
        </span>
        <slot name="action" />
      </div>
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
  headerValue?: string
}>(), {
  noPadding: false,
  icon: '',
  iconTone: 'sky',
  headerValue: '',
})

const toneMap: Record<IconTone, string> = {
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
}

const iconToneClass = computed(() => toneMap[props.iconTone])
</script>
