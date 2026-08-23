<template>
  <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-full">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="px-2 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-[12px] font-black transition-all shrink-0"
      :class="model === tab.value
        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'"
      @click="model = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  label: string
  value: string
}

defineProps<{ tabs: Tab[] }>()
const model = defineModel<string>({ required: true })
</script>
