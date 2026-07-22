<template>
  <header class="flex items-center justify-between gap-2.5 sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="min-w-0 leading-tight">
      <h1 class="text-lg font-black text-slate-900 dark:text-white">{{ title }}</h1>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">{{ subtitle }}</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
      @click="$emit('bonus')"
    >
      <font-awesome-icon icon="fa-solid fa-gift" />
      Bonus
    </button>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Profil',
  subtitle: 'Hisob, sozlamalar va hisoblar',
})

defineEmits<{ bonus: [] }>()
</script>
