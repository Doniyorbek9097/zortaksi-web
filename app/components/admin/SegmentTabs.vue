<template>
  <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="px-2.5 py-1 rounded-md text-[10px] font-black transition-colors shrink-0"
      :class="model === tab.value
        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400'
        : 'text-slate-500 dark:text-slate-400'"
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
