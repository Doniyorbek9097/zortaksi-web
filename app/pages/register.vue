<template>
  <div />
</template>

<script setup lang="ts">
// Eski havolalar: /register?ref=... → /auth?ref=...
const route = useRoute()
const q = { ...route.query }
await navigateTo({ path: '/auth', query: q }, { replace: true })
</script>
