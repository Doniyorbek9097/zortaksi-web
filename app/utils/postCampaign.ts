import type { PostCampaign } from '~/stores/post.store'

export function formatCampaignDateTime(raw?: string | Date | null): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm} ${hh}:${mi}`
}

export function formatCampaignCountdown(raw?: string | Date | null): string {
  if (!raw) return ''
  const ms = new Date(raw).getTime() - Date.now()
  if (Number.isNaN(ms) || ms <= 0) return 'tugadi'
  const totalMin = Math.ceil(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h} soat ${m} daq`
  return `${m} daqiqa`
}

export function campaignHasWindowStats(campaign: PostCampaign): boolean {
  return (
    campaign.active ||
    (campaign.windowSent ?? 0) > 0 ||
    (campaign.windowTotalPlanned ?? 0) > 0
  )
}
