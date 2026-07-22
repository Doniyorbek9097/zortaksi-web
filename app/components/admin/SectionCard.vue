<template>
  <section class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
      <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {{ title }}
      </h3>
      <slot name="action" />
    </div>
    <div :class="noPadding ? '' : 'px-4 pb-4'">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; noPadding?: boolean }>(), {
  noPadding: false,
})
</script>
