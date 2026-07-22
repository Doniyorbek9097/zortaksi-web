import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'

export type PostTab = 'mine' | 'ads'

export interface PostGroup {
  id: string
  title: string
  username?: string
  accessHash?: string
  membersCount?: number
  isAdmin: boolean
  viaUserbotId: string
  connections: number
  price: number
  free: boolean
}

export const AD_PRICE = 2000

export const usePostStore = defineStore('post', () => {
  const authStore = useAuthStore()

  const tab = ref<PostTab>('mine')
  const mineGroups = ref<PostGroup[]>([])
  const adsGroups = ref<PostGroup[]>([])
  const selected = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref('')

  const isAdmin = computed(() => authStore.user?.role === 'admin')
  const balance = computed(() => authStore.user?.balance ?? 0)

  const groups = computed(() => (tab.value === 'mine' ? mineGroups.value : adsGroups.value))

  const selectedList = computed(() => groups.value.filter(g => selected.value.has(g.id)))

  const pricePerGroup = computed(() => {
    if (tab.value === 'mine') return 0
    if (isAdmin.value) return 0
    return AD_PRICE
  })

  const totalCost = computed(() => pricePerGroup.value * selected.value.size)

  const maxSelectable = computed(() => {
    if (pricePerGroup.value <= 0) return Infinity
    return Math.floor(balance.value / pricePerGroup.value)
  })

  const fetchMine = async (force = false) => {
    const res = await useApi('/groups/mine', {
      params: force ? { force: '1' } : undefined,
      timeout: 120_000,
    })
    if (res.success) mineGroups.value = res.data.groups ?? []
  }

  const fetchAds = async (force = false) => {
    if (!isAdmin.value) {
      adsGroups.value = []
      return
    }
    const res = await useApi('/groups/ads', {
      params: force ? { force: '1' } : undefined,
      timeout: 180_000,
    })
    if (res.success) adsGroups.value = res.data.groups ?? []
  }

  const load = async (force = false) => {
    try {
      isLoading.value = true
      error.value = ''
      await fetchMine(force)
      if (isAdmin.value) await fetchAds(force)
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Guruhlar yuklanmadi'
    } finally {
      isLoading.value = false
    }
  }

  const setTab = (t: PostTab) => {
    if (t === 'ads' && !isAdmin.value) return
    tab.value = t
    selected.value = new Set()
  }

  const toggle = (id: string) => {
    const next = new Set(selected.value)
    if (next.has(id)) {
      next.delete(id)
      selected.value = next
      return
    }
    // Balans yetmasa — belgilashni to'xtatish
    if (pricePerGroup.value > 0 && next.size >= maxSelectable.value) {
      error.value = `Balans yetarli emas. Har bir guruh ${pricePerGroup.value.toLocaleString('ru-RU')} so'm`
      return
    }
    error.value = ''
    next.add(id)
    selected.value = next
  }

  const selectAllVisible = (list: PostGroup[]) => {
    const next = new Set<string>()
    let count = 0
    for (const g of list) {
      if (pricePerGroup.value > 0 && count >= maxSelectable.value) break
      next.add(g.id)
      count++
    }
    selected.value = next
    if (pricePerGroup.value > 0 && list.length > maxSelectable.value) {
      error.value = `Balans faqat ${maxSelectable.value} ta guruhga yetadi`
    } else {
      error.value = ''
    }
  }

  const clearSelection = () => {
    selected.value = new Set()
  }

  const broadcast = async (text: string) => {
    try {
      isSending.value = true
      error.value = ''
      const res = await useApi('/groups/broadcast', {
        method: 'POST',
        body: {
          mode: tab.value,
          groupIds: [...selected.value],
          text,
        },
      })
      if (res.success) {
        selected.value = new Set()
        await authStore.getMe()
      }
      return res
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Yuborish amalga oshmadi'
      throw e
    } finally {
      isSending.value = false
    }
  }

  return {
    tab,
    mineGroups,
    adsGroups,
    selected,
    isLoading,
    isSending,
    error,
    isAdmin,
    balance,
    groups,
    selectedList,
    pricePerGroup,
    totalCost,
    maxSelectable,
    load,
    setTab,
    toggle,
    selectAllVisible,
    clearSelection,
    broadcast,
  }
})
