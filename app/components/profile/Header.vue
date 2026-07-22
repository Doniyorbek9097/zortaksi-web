<template>
  <header class="flex items-start justify-between gap-3">
    <div>
      <h1 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{{ title }}</h1>
      <p class="text-[11px] md:text-xs font-medium text-slate-400 dark:text-slate-500">{{ subtitle }}</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 hover:border-amber-400 dark:hover:border-amber-500/60 active:scale-95 transition-all shadow-sm shrink-0"
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
