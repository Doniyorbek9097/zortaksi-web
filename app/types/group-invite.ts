export type GroupInviteLeaderboardRow = {
  rank: number
  id: string
  name: string
  username: string
  avatar?: string
  invites: number
  bonus: number
  isMe?: boolean
}

export type GroupInviteLeaderboardData = {
  available: boolean
  regionSlug: string
  regionTitle: string
  groupTitle: string
  groupOpenUrl?: string
  rewardPerInvite: number
  leaderboard: GroupInviteLeaderboardRow[]
  me: {
    rank: number | null
    invites: number
    bonus: number
    inTop: boolean
  }
}
