<template>
  <div
    class="rounded-xl p-5 flex items-start gap-4 border
           bg-neutral-50 border-neutral-200
           dark:bg-neutral-900 dark:border-neutral-800"
  >
    <span class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border
                 bg-emerald-500/10 border-emerald-500/30 text-emerald-700
                 dark:bg-emerald-400/10 dark:border-emerald-400/30 dark:text-emerald-400">
      ✓
    </span>
    <div>
      <h5 class="font-bold mb-1">{{ title }}</h5>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
