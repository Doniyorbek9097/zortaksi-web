<template>
  <div class="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div class="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-sky-500" />
      <span class="text-xs font-semibold tracking-wide">Tekshirilmoqda…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: false })

const route = useRoute()
const authStore = useAuthStore()

const orderId = computed(() => String(route.query.orderId || '').trim())

const chatOpenTarget = computed(() => ({
  path: '/driver/chat/open',
  query: {
    open: String(route.query.open || 'order'),
    orderId: orderId.value,
    ...(String(route.query.fromGroup || '').trim() === '1' ? { fromGroup: '1' } : {}),
  },
}))

const patchUserFromAccess = (data: {
  active?: boolean
  verified?: boolean
  tariffExpireAt?: string | Date | null
}) => {
  if (!authStore.user) return
  authStore.user = {
    ...authStore.user,
    ...(data.active != null ? { active: !!data.active } : {}),
    ...(data.verified != null ? { verified: !!data.verified } : {}),
    ...(data.tariffExpireAt !== undefined ? { tariffExpireAt: data.tariffExpireAt } : {}),
  }
}

onMounted(async () => {
  if (!orderId.value) {
    await navigateTo('/driver/dashboard', { replace: true })
    return
  }

  const nextPath = `/driver/chat/open?open=order&orderId=${encodeURIComponent(orderId.value)}&fromGroup=1`

  try {
    const res = await useApi('/me/order-take-access', { timeout: 10_000 })

    if (res?.allowed) {
      patchUserFromAccess(res)
      await navigateTo(chatOpenTarget.value, { replace: true })
      return
    }

    if (res?.code === 'NOT_VERIFIED') {
      await navigateTo({ path: '/auth', query: { next: nextPath } }, { replace: true })
      return
    }

    await navigateTo(
      { path: '/driver/payment', query: { tab: 'tariff', next: nextPath } },
      { replace: true },
    )
  } catch {
    await navigateTo('/driver/dashboard', { replace: true })
  }
})
</script>
