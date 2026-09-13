import type { PostCampaign } from '~/stores/post.store'

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
  return (
    campaign.active &&
    (campaign.windowTotalPlanned != null ||
      campaign.windowSent != null ||
      campaign.windowRemaining != null)
  )
}
