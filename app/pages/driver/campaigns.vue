<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-4 space-y-4">
    <header class="flex items-center justify-between gap-3 sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="min-w-0">
        <h1 class="text-lg font-black text-slate-900 dark:text-white">E'lonlar</h1>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
          Saqlangan xabarlar va avto-yuborish
        </p>
      </div>
      <NuxtLink
        to="/driver/post"
        class="inline-flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/25 active:scale-95 transition-transform"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="text-[10px]" />
        E'lon joylash
      </NuxtLink>
    </header>

    <div v-if="loading && !store.campaigns.length" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!sortedCampaigns.length"
      icon="fa-solid fa-bullhorn"
      title="Saqlangan e'lon yo'q"
      subtitle="Yangi e'lon yaratish uchun «E'lon joylash» tugmasini bosing"
      tone="amber"
    />

    <div v-else class="space-y-3">
      <PostCampaignCard
        v-for="c in sortedCampaigns"
        :key="c.id"
        :campaign="c"
        :busy="store.campaignBusyId === c.id"
        flat
        @start="onStart(c)"
        @stop="onStop(c)"
        @edit="onEdit(c)"
        @delete="onAskDelete(c)"
      />
    </div>

    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">
      {{ success }}
    </p>
    <p v-if="store.error" class="text-center text-[12px] font-bold text-rose-500">
      {{ store.error }}
    </p>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="E'lonni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.name}» o'chirilsinmi?` : ''"
      confirm-text="O'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="!!store.campaignBusyId"
      @confirm="onConfirmDelete"
      @cancel="deleteOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { usePostStore, type PostCampaign } from '~/stores/post.store'
import { useAuthStore } from '~/stores/auth.store'
import PostCampaignCard from '~/components/post/CampaignCard.vue'

definePageMeta({ layout: 'driver' })

const store = usePostStore()
const authStore = useAuthStore()

const success = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<PostCampaign | null>(null)

const loading = computed(() => store.isCampaignsLoading || store.isCampaignStatsLoading)

const sortedCampaigns = computed(() => {
  const list = [...store.campaigns]
  list.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return String(b.id).localeCompare(String(a.id))
  })
  return list
})

const POST_TARIFF_PAYMENT_PATH = '/driver/payment?tab=tariff&next=/driver/campaigns'

const requireTariffForPost = (): boolean => {
  if (store.isAdmin || authStore.tariffActive) return true
  navigateTo(POST_TARIFF_PAYMENT_PATH)
  return false
}

const loadData = async () => {
  if (!authStore.user || !authStore.sessionReady) {
    try { await authStore.getMe() } catch { /* */ }
  }
  store.hydrateActiveCampaignCache()
  await store.refreshCampaignData()
}

const onStart = async (c: PostCampaign) => {
  if (!requireTariffForPost()) return
  success.value = ''
  try {
    await store.startCampaign(c.id)
    success.value = `«${c.name}» boshlandi`
  } catch { /* */ }
}

const onStop = async (c: PostCampaign) => {
  success.value = ''
  try {
    await store.stopCampaign(c.id)
    success.value = `«${c.name}» to'xtatildi`
  } catch { /* */ }
}

const onEdit = (c: PostCampaign) => {
  navigateTo(`/driver/campaigns/${encodeURIComponent(c.id)}/edit`)
}

const onAskDelete = (c: PostCampaign) => {
  deleteTarget.value = c
  deleteOpen.value = true
}

const onConfirmDelete = async () => {
  const c = deleteTarget.value
  if (!c) return
  success.value = ''
  try {
    await store.deleteCampaign(c.id)
    deleteOpen.value = false
    deleteTarget.value = null
    success.value = `«${c.name}» o'chirildi`
  } catch { /* */ }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

watch(
  () => [authStore.sessionReady, authStore.user?.userId] as const,
  ([ready, uid]) => {
    if (ready && uid) void loadData()
  },
  { immediate: true },
)

watch(
  () => !!store.activeCampaign?.active,
  (hasActive) => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    if (!hasActive) return
    pollTimer = setInterval(() => {
      void store.refreshCampaignData()
    }, 30_000)
  },
  { immediate: true },
)

onMounted(() => {
  void loadData()
})

onActivated(() => {
  void loadData()
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

usePullToRefresh(async () => {
  await store.refreshCampaignData()
})
</script>
