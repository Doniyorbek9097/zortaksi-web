/**
 * Haydovchi dashboard — faol e'lon kampaniyasi va polling.
 */
import { useAuthStore } from '~/stores/auth.store'
import { usePostStore, type PostCampaign } from '~/stores/post.store'

const POLL_MS = 30_000

export function useDriverPostCampaign() {
  const authStore = useAuthStore()
  const postStore = usePostStore()

  const loading = computed(() => postStore.isCampaignsLoading || postStore.isCampaignStatsLoading)
  const activeCampaign = computed(() => postStore.activeCampaign)
  const showCard = computed(() => !!activeCampaign.value || loading.value)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const startCampaign = async (c: PostCampaign) => {
    await postStore.startCampaign(c.id)
  }

  const stopCampaign = async (c: PostCampaign) => {
    await postStore.stopCampaign(c.id)
  }

  const deleteCampaign = async (c: PostCampaign) => {
    await postStore.deleteCampaign(c.id)
  }

  /** Kampaniya ma'lumotlarini yuklash */
  const loadCampaign = async () => {
    if (!authStore.user || !authStore.sessionReady) {
      try {
        await authStore.getMe()
      } catch {
        /* */
      }
    }
    postStore.hydrateActiveCampaignCache()
    await postStore.refreshCampaignData()
  }

  /** Faol kampaniya bo'lsa — 30s da yangilash */
  const startPolling = () => {
    pollTimer = setInterval(() => {
      if (postStore.activeCampaign?.active) {
        void postStore.refreshCampaignData()
      }
    }, POLL_MS)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  watch(
    () => [authStore.sessionReady, authStore.user?.userId, authStore.isAuthenticated] as const,
    ([ready, uid, authed]) => {
      if ((ready && uid) || authed) void loadCampaign()
    },
    { immediate: true },
  )

  onActivated(() => {
    void loadCampaign()
  })

  return {
    postStore,
    loading,
    activeCampaign,
    showCard,
    startCampaign,
    stopCampaign,
    deleteCampaign,
    loadCampaign,
    startPolling,
    stopPolling,
  }
}
