export interface IBanner {
  id: string
  name: string
  targetUrl: string
  imagePath: string
  imageUrl: string
  sortOrder: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}
