<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl sm:text-2xl font-black tracking-tight truncate leading-none min-w-0">
        <span class="text-sky-500">Zo'r</span>
        <span class="text-slate-900 dark:text-white"> Taksi</span>
      </h1>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
        @click="$emit('bonus')"
      >
        <font-awesome-icon icon="fa-solid fa-gift" />
        Bonus
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ bonus: [] }>()
</script>
