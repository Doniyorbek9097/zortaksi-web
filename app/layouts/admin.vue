<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
    <slot />
    <AdminBottomNavigation :orders-badge="ordersBadge" :chats-badge="chatsBadge" />
  </div>
</template>

<script setup lang="ts">
// Keyinroq real sonlar store'dan olinadi
const ordersBadge = ref(11)
const chatsBadge = ref(13)
</script>
