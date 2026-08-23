<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-black tracking-tight truncate leading-none">
          <span class="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">Zo'r</span>
          <span class="text-slate-900 dark:text-white"> Taksi</span>
        </h1>
        <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Admin panel
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 active:scale-95 transition-all shrink-0"
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
