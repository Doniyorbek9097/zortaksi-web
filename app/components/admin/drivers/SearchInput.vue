<template>
  <label class="relative block">
    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
      <font-awesome-icon icon="fa-solid fa-search" class="text-sm" />
    </span>
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
    >
    <button
      v-if="model"
      type="button"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label="Tozalash"
      @click="model = ''"
    >
      <font-awesome-icon icon="fa-solid fa-times" class="text-xs" />
    </button>
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: 'Ism, telefon yoki username...',
})
const model = defineModel<string>({ default: '' })
</script>
