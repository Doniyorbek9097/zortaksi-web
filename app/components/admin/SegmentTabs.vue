<template>
  <div class="inline-flex p-0.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 max-w-full">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="px-2.5 sm:px-3.5 py-1.5 rounded-[10px] text-[10px] sm:text-[11px] font-black transition-all shrink-0"
      :class="model === tab.value
        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
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
