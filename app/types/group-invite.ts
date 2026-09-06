export type GroupInviteLeaderboardRow = {
  rank: number
  id: string
  name: string
  username: string
  avatar?: string
  groupTitle: string
  invites: number
  bonus: number
  isMe?: boolean
}

export type GroupInviteLeaderboardData = {
  available: boolean
  rewardPerInvite: number
  totalInviters: number
  totalInvites: number
  groupOpenUrl?: string
  leaderboard: GroupInviteLeaderboardRow[]
  me: {
    rank: number | null
    invites: number
    bonus: number
    inTop: boolean
    groupTitle: string
  }
}
