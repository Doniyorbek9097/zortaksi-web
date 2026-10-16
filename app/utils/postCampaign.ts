import type { PostCampaign } from '~/stores/post.store'
import { DEFAULT_POSTS_AFTER } from '~/stores/post.store'

export function campaignPostsAfter(campaign: PostCampaign): number {
  const n = campaign.postsAfterThreshold ?? campaign.intervalMin
  return Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_POSTS_AFTER
}

/** Kartochka sarlavhasi: guruhlar + qayta yuborish sharti */
export function campaignGroupsMetaLabel(campaign: PostCampaign, compact = false): string {
  const g = campaign.groupIds?.length ?? 0
  const n = campaignPostsAfter(campaign)
  if (compact) return `${g}g · ${n}x`
  return `${g} guruh · ${n} xabar`
}

export function campaignEditPath(campaignId: string) {
  const id = String(campaignId || '').trim()
  if (!id) return '/driver/campaigns'
  return `/driver/campaigns/${encodeURIComponent(id)}/edit`
}

export function formatCampaignCountdown(windowEndsAt?: string | null): string {
  if (!windowEndsAt) return '—'
  const ms = new Date(windowEndsAt).getTime() - Date.now()
  if (ms <= 0) return 'Tugadi'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 0) return `${h}s ${m}d`
  return `${m} daq`
}

export function formatCampaignDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${mi}`
}

export function campaignHasWindowStats(campaign: PostCampaign) {
  return !!campaign.active
}
