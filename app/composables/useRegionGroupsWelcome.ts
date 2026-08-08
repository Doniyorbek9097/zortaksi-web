import { openTelegramExternalUrl } from '~/utils/telegramLinks'
import { isTariffActive } from '~/utils/tariffActive'

export type DriverRegionGroupSide = {
  kind: 'public' | 'private'
  title: string
  hint: string
  username?: string
  openUrl?: string
  isMember: boolean
  canJoinViaApp: boolean
  manualJoinUrl?: string
  canJoin: boolean
}

export type DriverRegionGroups = {
  regionSlug: string
  regionTitle: string
  telegramSessionOk: boolean
  public: DriverRegionGroupSide | null
  private: DriverRegionGroupSide | null
}

const groups = ref<DriverRegionGroups | null>(null)
const open = ref(false)
const loading = ref(false)
const joiningPrivate = ref(false)
const error = ref('')

export function useRegionGroupsWelcome() {
  const authStore = useAuthStore()

  const canShow = computed(() => {
    if (!import.meta.client || !authStore.sessionReady) return false
    if (authStore.user?.role === 'admin') return false
    if (!isTariffActive(authStore.user)) return false
    return !!String(authStore.user?.regionSlug || '').trim()
  })

  const needsWelcome = computed(() => {
    const g = groups.value
    if (!g) return false
    return !!(g.private?.canJoin || g.public?.openUrl)
  })

  const show = (data: DriverRegionGroups) => {
    groups.value = data
    open.value = true
    error.value = ''
  }

  const close = () => {
    open.value = false
    error.value = ''
  }

  const fetchGroups = async (): Promise<DriverRegionGroups | null> => {
    if (!canShow.value) return null
    loading.value = true
    error.value = ''
    try {
      const res = await useApi('/me/region/groups')
      const data = (res?.data ?? null) as DriverRegionGroups | null
      if (data) groups.value = data
      return data
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || ''
      return null
    } finally {
      loading.value = false
    }
  }

  const loadAndShowIfNeeded = async () => {
    if (!canShow.value) return
    const data = groups.value ?? (await fetchGroups())
    if (!data) return
    const needsPrivateJoin = !!(data.private?.canJoin || data.private?.manualJoinUrl)
    const needsPublicManual =
      !data.telegramSessionOk && !!data.public?.openUrl && !data.public?.isMember
    if (needsPrivateJoin || needsPublicManual) {
      show(data)
    }
  }

  const openPublicGroup = () => {
    const url = groups.value?.public?.openUrl
    if (!url) return
    openTelegramExternalUrl(url)
  }

  const openPrivateGroupManually = () => {
    const url = groups.value?.private?.manualJoinUrl
    if (!url) return
    openTelegramExternalUrl(url)
  }

  const joinPrivateGroup = async () => {
    if (joiningPrivate.value) return

    if (groups.value?.private?.manualJoinUrl) {
      openPrivateGroupManually()
      return
    }

    joiningPrivate.value = true
    error.value = ''
    try {
      const res = await useApi('/me/region/join-private', { method: 'POST', timeout: 60_000 })
      const data = (res?.data ?? null) as DriverRegionGroups | null
      if (data) {
        groups.value = data
        if (data.private?.manualJoinUrl) {
          openTelegramExternalUrl(data.private.manualJoinUrl)
        }
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message || e?.message || "Guruhga qo'shilib bo'lmadi"
    } finally {
      joiningPrivate.value = false
    }
  }

  return {
    groups,
    open,
    loading,
    joiningPrivate,
    error,
    canShow,
    needsWelcome,
    show,
    close,
    fetchGroups,
    loadAndShowIfNeeded,
    openPublicGroup,
    openPrivateGroupManually,
    joinPrivateGroup,
  }
}
