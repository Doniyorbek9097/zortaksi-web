<template>
  <div class="space-y-2.5">
    <!-- Keyword -->
    <div class="relative">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        <font-awesome-icon icon="fa-solid fa-search" class="text-sm" />
      </span>
      <input
        v-model="keyword"
        type="text"
        placeholder="Kalit so'z: namangan, chortoq..."
        class="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all"
      >
    </div>

    <!-- Message text -->
    <div class="relative">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        <font-awesome-icon icon="fa-solid fa-comments" class="text-sm" />
      </span>
      <input
        v-model="text"
        type="text"
        placeholder="Buyurtma matni bo'yicha qidirish..."
        class="w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
const keyword = defineModel<string>('keyword', { default: '' })
const text = defineModel<string>('text', { default: '' })
</script>
