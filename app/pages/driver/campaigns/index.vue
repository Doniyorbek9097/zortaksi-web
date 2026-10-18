<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-4 space-y-4">
    <header class="flex items-center justify-between gap-3 sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="min-w-0">
        <h1 class="text-lg font-black text-slate-900 dark:text-white">E'lonlar</h1>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
          Zor Taksi — guruhlarga avtomatik tarqatish
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

    <div
      v-else-if="!sortedCampaigns.length"
      class="flex flex-col items-center justify-center text-center min-h-[55vh] px-4"
    >
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/35 mb-4"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-2xl" />
      </div>
      <p class="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
        Zo'r Taksi
      </p>
      <h2 class="text-base font-black text-slate-900 dark:text-white max-w-sm leading-snug">
        Reklamangizni guruhlarga tarqatishni Zo'r Taksi orqali avtomatlashtirib qo'ying
      </h2>
      <p class="mt-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
        Vaqt va kuchingizni tejang — bir marta sozlasangiz, e'lonlar tanlangan guruhlarga o'zi ketadi.
      </p>
      <p class="mt-2 text-[12px] font-bold text-amber-700/90 dark:text-amber-300/90 max-w-xs">
        Buning uchun e'loningizni joylashtiring
      </p>
      <NuxtLink
        to="/driver/post"
        class="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform"
      >
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-sm" />
        E'loningizni joylashtiring
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <PostCampaignBoardCard
        v-for="c in sortedCampaigns"
        :key="c.id"
        :campaign="c"
        :busy="store.campaignBusyId === c.id"
        @start="onStart(c)"
        @stop="onStop(c)"
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
import PostCampaignBoardCard from '~/components/post/CampaignBoardCard.vue'
import { usePanelShellLayout } from '~/composables/layout/usePanelShellLayout'

definePageMeta({ layout: 'driver', keepalive: true })

usePanelShellLayout()

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

const POST_TARIFF_PAYMENT_PATH = '/driver/payment?tab=post-tariff&next=/driver/campaigns'

const requireTariffForPost = (): boolean => {
  if (store.isAdmin || authStore.postTariffActive) return true
  navigateTo(POST_TARIFF_PAYMENT_PATH)
  return false
}

const listBooted = ref(false)

const loadData = async (opts?: { silent?: boolean }) => {
  if (!authStore.user || !authStore.sessionReady) {
    try { await authStore.getMe() } catch { /* */ }
  }
  store.hydrateActiveCampaignCache()
  const silent = opts?.silent === true && listBooted.value && store.campaigns.length > 0
  await store.refreshCampaignData({ silent })
  listBooted.value = true
}

const onStart = async (c: PostCampaign) => {
  if (!requireTariffForPost()) return
  success.value = ''
  store.error = ''
  try {
    await store.startCampaign(c.id)
    success.value = `«${c.name}» boshlandi`
  } catch { /* store.error */ }
}

const onStop = async (c: PostCampaign) => {
  success.value = ''
  try {
    await store.stopCampaign(c.id)
    success.value = `«${c.name}» to'xtatildi`
  } catch { /* */ }
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
  void loadData({ silent: true })
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

usePullToRefresh(async () => {
  await store.refreshCampaignData()
})
</script>
