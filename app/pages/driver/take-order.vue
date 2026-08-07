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

const chatOpenPath = computed(() => {
  const q = { ...route.query, access: '1' } as Record<string, string>
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(q)) {
    if (value != null && String(value).trim()) params.set(key, String(value))
  }
  const tail = params.toString()
  return tail ? `/driver/chat/open?${tail}` : '/driver/chat/open'
})

const chatOpenTarget = computed(() => {
  const q = { ...route.query, access: '1' } as Record<string, string>
  return {
    path: '/driver/chat/open',
    query: q,
  }
})

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
  const next = chatOpenPath.value

  try {
    const res = await useApi('/me/order-take-access', { timeout: 10_000 })

    if (res?.allowed) {
      patchUserFromAccess(res)
      await navigateTo(chatOpenTarget.value, { replace: true })
      return
    }

    if (res?.code === 'NOT_VERIFIED') {
      await navigateTo({ path: '/auth', query: { next } }, { replace: true })
      return
    }

    await navigateTo(
      { path: '/driver/payment', query: { tab: 'tariff', next } },
      { replace: true },
    )
  } catch {
    await navigateTo('/driver/dashboard', { replace: true })
  }
})
</script>
