/**
 * Guruh taklifi TOP 10 — haydovchi va admin dashboard uchun.
 */
import type { GroupInviteLeaderboardData } from '~/types/group-invite'
import { readSessionCache, writeSessionCache } from './useSessionCache'

type Options = {
  /** sessionStorage kaliti (admin/haydovchi alohida) */
  cacheKey: string
  /** true bo'lsa faqat faol tarifda yuklaydi */
  requireActiveTariff?: boolean
  tariffActive?: () => boolean
}

export function useGroupInviteLeaderboard(opts: Options) {
  const data = ref<GroupInviteLeaderboardData | null>(null)
  const loading = ref(false)

  const hydrateFromCache = () => {
    const cached = readSessionCache<GroupInviteLeaderboardData>(opts.cacheKey)
    if (cached?.available) data.value = cached
  }

  const saveCache = () => {
    if (data.value) writeSessionCache(opts.cacheKey, data.value)
  }

  const fetchLeaderboard = async (fetchOpts?: { background?: boolean }) => {
    if (opts.requireActiveTariff && opts.tariffActive && !opts.tariffActive()) return

    if (!fetchOpts?.background && !data.value) loading.value = true

    try {
      const res = await useApi<{ success: boolean; data: GroupInviteLeaderboardData }>(
        '/group-invite/leaderboard',
      )
      if (res?.success && res.data) {
        data.value = res.data
        saveCache()
      }
    } catch (e) {
      console.warn('[Dashboard] group invite leaderboard:', e)
    } finally {
      loading.value = false
    }
  }

  return { data, loading, hydrateFromCache, fetchLeaderboard }
}
