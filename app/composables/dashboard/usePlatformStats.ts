/**
 * Haydovchi dashboard — platforma statistikasi (/dashboard/stats).
 */
import { readSessionCache, writeSessionCache } from './useSessionCache'

const CACHE_KEY = 'zt:dashboard-platform-stats'

export type PlatformStatColor = 'blue' | 'amber' | 'green' | 'violet' | 'emerald' | 'pink'

export interface PlatformStatItem {
  value: number
  label: string
  icon: string
  color: PlatformStatColor
}

interface PlatformNumbers {
  ordersToday: number
  ordersLastHour: number
  ordersTotal: number
  totalDrivers: number
  activeDrivers: number
  tariffsCount: number
}

const emptyPlatform = (): PlatformNumbers => ({
  ordersToday: 0,
  ordersLastHour: 0,
  ordersTotal: 0,
  totalDrivers: 0,
  activeDrivers: 0,
  tariffsCount: 0,
})

/** Stat kartalar ro'yxati — UI uchun tayyor */
function buildStatItems(data: PlatformNumbers): PlatformStatItem[] {
  return [
    { value: data.ordersToday, label: 'Bugun', icon: 'fa-solid fa-clipboard-list', color: 'blue' },
    { value: data.ordersLastHour, label: '1 soat', icon: 'fa-solid fa-bolt', color: 'amber' },
    { value: data.ordersTotal, label: 'Jami buyurtma', icon: 'fa-solid fa-chart-line', color: 'green' },
    { value: data.totalDrivers, label: 'Haydovchilar', icon: 'fa-solid fa-users', color: 'violet' },
    { value: data.activeDrivers, label: 'Faol', icon: 'fa-solid fa-user-check', color: 'emerald' },
    { value: data.tariffsCount, label: 'Tariflar', icon: 'fa-solid fa-tags', color: 'pink' },
  ]
}

export function usePlatformStats() {
  const platform = ref<PlatformNumbers>(emptyPlatform())
  const loading = ref(false)
  const ready = ref(false)

  const stats = computed(() => buildStatItems(platform.value))

  /** Keshdan tez yuklash */
  const hydrateFromCache = () => {
    const cached = readSessionCache<Partial<PlatformNumbers>>(CACHE_KEY)
    if (!cached) return
    platform.value = {
      ordersToday: Number(cached.ordersToday || 0),
      ordersLastHour: Number(cached.ordersLastHour || 0),
      ordersTotal: Number(cached.ordersTotal || 0),
      totalDrivers: Number(cached.totalDrivers || 0),
      activeDrivers: Number(cached.activeDrivers || 0),
      tariffsCount: Number(cached.tariffsCount || 0),
    }
    ready.value = true
  }

  /** API dan yangilash */
  const fetchStats = async (opts?: { background?: boolean }) => {
    if (!opts?.background && !ready.value) loading.value = true
    try {
      const res = await useApi('/dashboard/stats')
      if (res?.success && res.data) {
        platform.value = {
          ordersToday: Number(res.data.ordersToday || 0),
          ordersLastHour: Number(res.data.ordersLastHour || 0),
          ordersTotal: Number(res.data.ordersTotal || 0),
          totalDrivers: Number(res.data.totalDrivers || 0),
          activeDrivers: Number(res.data.activeDrivers || 0),
          tariffsCount: Number(res.data.tariffsCount || 0),
        }
        ready.value = true
        writeSessionCache(CACHE_KEY, platform.value)
      }
    } catch (e) {
      console.warn('[Dashboard] stats:', e)
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, ready, hydrateFromCache, fetchStats }
}
