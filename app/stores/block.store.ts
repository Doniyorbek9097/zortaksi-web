import { defineStore } from 'pinia'

export type BlockType = 'sender' | 'group'

export interface BlockRow {
  id: string
  type: BlockType
  targetId: string
  title?: string
  username?: string
  blockedBy: string
  createdAt?: string
}

const toRow = (r: any): BlockRow => ({
  id: String(r.id || r._id),
  type: r.type === 'group' ? 'group' : 'sender',
  targetId: String(r.targetId || ''),
  title: r.title ? String(r.title) : undefined,
  username: r.username ? String(r.username) : undefined,
  blockedBy: String(r.blockedBy || ''),
  createdAt: r.createdAt ? String(r.createdAt) : undefined,
})

export const useBlockStore = defineStore('adminBlocks', () => {
  const items = ref<BlockRow[]>([])
  const isLoading = ref(false)
  const unblockingId = ref<string | null>(null)

  const fetchBlocks = async (type?: BlockType) => {
    try {
      isLoading.value = true
      const q = type ? `?type=${encodeURIComponent(type)}` : ''
      const response = await useApi(`/blocks${q}`)
      if (response.success) {
        items.value = (response.data?.items ?? []).map(toRow)
      }
      return response
    } catch (error) {
      console.error('FetchBlocks error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const unblock = async (row: BlockRow) => {
    const path =
      row.type === 'group'
        ? `/blocks/group/${encodeURIComponent(row.targetId)}`
        : `/blocks/sender/${encodeURIComponent(row.targetId)}`
    try {
      unblockingId.value = row.id
      const response = await useApi(path, { method: 'DELETE' })
      if (response.success) {
        items.value = items.value.filter((x) => x.id !== row.id)
      }
      return response
    } catch (error) {
      console.error('Unblock error:', error)
      throw error
    } finally {
      unblockingId.value = null
    }
  }

  return {
    items,
    isLoading,
    unblockingId,
    fetchBlocks,
    unblock,
  }
})
