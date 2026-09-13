/**
 * Haydovchi dashboard — promo bannerlar ro'yxati.
 */
import type { IBanner } from '~/types/banner'
import { readSessionCache, writeSessionCache } from './useSessionCache'

const CACHE_KEY = 'zt:dashboard-banners'

export function usePromoBanners() {
  const banners = ref<IBanner[]>([])

  const hydrateFromCache = () => {
    const cached = readSessionCache<IBanner[]>(CACHE_KEY)
    if (Array.isArray(cached)) banners.value = cached
  }

  const fetchBanners = async () => {
    try {
      const res = await useApi<{ success: boolean; data: { banners: IBanner[] } }>('/banners')
      if (res?.success && res.data?.banners) {
        banners.value = res.data.banners
        writeSessionCache(CACHE_KEY, banners.value)
      }
    } catch {
      /* banner yo'q bo'lishi mumkin */
    }
  }

  return { banners, hydrateFromCache, fetchBanners }
}
