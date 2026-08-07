<template>
  <div class="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-sky-500" />
      <span class="text-xs font-semibold tracking-wide">Tekshirilmoqda…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { ensureAccess } = useOrderTakeAccess()

const orderId = computed(() => String(route.query.orderId || '').trim())

const chatOpenTarget = computed(() => ({
  path: '/driver/chat/open',
  query: {
    open: String(route.query.open || 'order'),
    orderId: orderId.value,
    ...(String(route.query.fromGroup || '').trim() === '1' ? { fromGroup: '1' } : {}),
  },
}))

onMounted(async () => {
  if (!orderId.value) {
    await navigateTo('/driver/orders', { replace: true })
    return
  }

  const fullPath = `/driver/chat/open?open=order&orderId=${encodeURIComponent(orderId.value)}&fromGroup=1`

  const allowed = await ensureAccess(fullPath)
  if (allowed) {
    await navigateTo(chatOpenTarget.value, { replace: true })
  }
})
</script>
