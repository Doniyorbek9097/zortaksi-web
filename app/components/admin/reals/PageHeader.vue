<template>
  <header class="space-y-1 pt-1">
    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
      Boshqaruv
    </p>
    <div class="flex items-end justify-between gap-3">
      <h1 class="text-xl font-black text-slate-900 dark:text-white">
        Reals reklama
      </h1>
      <span class="text-[11px] font-bold text-slate-400 tabular-nums">{{ total }} ta</span>
    </div>
    <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
      Qisqa video reklama, mahsulot havolasi va like/dislike statistikasi.
    </p>
  </header>
</template>

<script setup lang="ts">
defineProps<{ total: number }>()
</script>
