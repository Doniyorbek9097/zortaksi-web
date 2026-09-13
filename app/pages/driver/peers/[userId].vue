<script setup lang="ts">
/** Eski havola — bitta profil sahifasiga yo'naltirish */
const route = useRoute()
const q = { ...route.query }
await navigateTo(
  {
    path: `/driver/user/${encodeURIComponent(String(route.params.userId || ''))}`,
    query: q,
  },
  { replace: true },
)
</script>

<template>
  <div />
</template>
