<script setup lang="ts">
/** Eski admin haydovchi sahifasi — bitta profil sahifasiga yo'naltirish */
const route = useRoute()
await navigateTo(
  {
    path: `/driver/user/${encodeURIComponent(String(route.params.userId || ''))}`,
    query: { ...route.query },
  },
  { replace: true },
)
</script>

<template>
  <div />
</template>
