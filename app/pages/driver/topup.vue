<template>
  <div />
</template>

<script setup lang="ts">
/** Eski havola: /driver/topup → /driver/payment?tab=topup */
const route = useRoute()
const q = { ...route.query, tab: 'topup' }
await navigateTo({ path: '/driver/payment', query: q }, { replace: true })
</script>
