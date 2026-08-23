<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-lg font-black tracking-tight truncate leading-none min-w-0">
        <span class="text-sky-500">Zo'r</span>
        <span class="text-slate-900 dark:text-white"> Taksi</span>
      </h1>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 active:scale-95 transition-transform shrink-0"
        @click="$emit('bonus')"
      >
        <font-awesome-icon icon="fa-solid fa-gift" class="text-xs" />
        Bonus
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ bonus: [] }>()
</script>
