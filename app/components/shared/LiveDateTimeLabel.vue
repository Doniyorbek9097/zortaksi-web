<template>
  <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
    {{ text }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>
