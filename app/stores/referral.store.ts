import { defineStore } from 'pinia'

export interface ReferralSummary {
  referralCode: string
  link: string
  adText: string
  rewardPerInvite: number
  totalInvites: number
  totalBonusEarned: number
}

export interface JoinedUser {
  id: string
  name: string
  username: string
  avatar?: string
  active: boolean
  date: string
}

export interface LeaderboardRow {
  rank: number
  id?: string
  name: string
  username: string
  avatar?: string
  invites: number
  bonus: number
}

export const useReferralStore = defineStore('referral', () => {
  const summary = ref<ReferralSummary | null>(null)
  const joined = ref<JoinedUser[]>([])
  const leaderboard = ref<LeaderboardRow[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const fetchAll = async () => {
    try {
      isLoading.value = true
      error.value = ''
      const [meRes, joinedRes, boardRes] = await Promise.all([
        useApi('/referral/me'),
        useApi('/referral/joined'),
        useApi('/referral/leaderboard', { params: { limit: 10 } }),
      ])
      if (meRes.success) summary.value = meRes.data
      if (joinedRes.success) joined.value = joinedRes.data ?? []
      if (boardRes.success) leaderboard.value = boardRes.data ?? []
    } catch (e: any) {
      error.value = e?.response?.data?.message || 'Referal ma\'lumotlari yuklanmadi'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    summary,
    joined,
    leaderboard,
    isLoading,
    error,
    fetchAll,
  }
})
