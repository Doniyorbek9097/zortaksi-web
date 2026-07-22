<template>
  <header class="flex items-center justify-between gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center gap-2 min-w-0">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20"
      >
        <font-awesome-icon icon="fa-solid fa-car" />
      </div>
      <div class="leading-none min-w-0">
        <h1 class="text-[13px] font-black tracking-tight truncate">
          <span class="text-sky-600 dark:text-sky-400">ZorTaksi</span><span class="text-red-500">.uz</span>
        </h1>
        <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mt-0.5">
          Admin
        </p>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
      @click="$emit('bonus')"
    >
      <font-awesome-icon icon="fa-solid fa-gift" />
      Bonus
    </button>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ bonus: [] }>()
</script>
