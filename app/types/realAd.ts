export type RealAdVote = 'like' | 'dislike'

export interface IRealAd {
  id: string
  title: string
  productPrice: string
  ctaLabel: string
  productUrl: string
  videoPath: string
  videoUrl: string
  sortOrder: number
  active: boolean
  likesCount: number
  dislikesCount: number
  myVote?: RealAdVote | null
  createdAt?: string
  updatedAt?: string
}
