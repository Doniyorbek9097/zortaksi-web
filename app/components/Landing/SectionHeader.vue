<template>
  <div class="text-center max-w-3xl mx-auto mb-14 space-y-4">
    <span 
      v-if="badge"
      class="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide border
             bg-emerald-500/10 border-emerald-500/30 text-emerald-700
             dark:bg-emerald-400/10 dark:border-emerald-400/30 dark:text-emerald-400"
    >
      {{ badge }}
    </span>
    <h2 class="text-3xl md:text-4xl font-black tracking-tight">
      {{ title }}
    </h2>
    <p 
      v-if="description"
      class="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400"
      v-html="description"
    ></p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  badge?: string
}>()
</script>
