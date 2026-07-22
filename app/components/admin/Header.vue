<template>
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg text-white shrink-0 bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25"
      >
        <font-awesome-icon icon="fa-solid fa-car" />
      </div>
      <div class="leading-tight min-w-0">
        <h1 class="text-lg font-black tracking-tight truncate">
          <span class="text-sky-600 dark:text-sky-400">ZorTaksi</span><span class="text-red-500">.uz</span>
        </h1>
        <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          Haydovchilar platformasi
        </p>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 hover:border-amber-400 active:scale-95 transition-all shadow-sm shrink-0"
      @click="$emit('bonus')"
    >
      <font-awesome-icon icon="fa-solid fa-gift" />
      Bonus
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ bonus: [] }>()
</script>
