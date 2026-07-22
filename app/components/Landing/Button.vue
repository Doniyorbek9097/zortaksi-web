<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
    :class="[
      variant === 'primary' 
        ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 font-bold text-sm' 
        : 'border-2 border-neutral-300 text-neutral-900 hover:border-emerald-500 hover:bg-emerald-50 dark:border-neutral-700 dark:text-neutral-50 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/40 font-semibold text-sm'
    ]"
  >
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  variant?: 'primary' | 'secondary'
}>()
</script>
