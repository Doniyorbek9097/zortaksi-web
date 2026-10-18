import type { PostCampaign } from '~/stores/post.store'
import {
  DEFAULT_POST_INTERVAL_MIN,
  POST_INTERVAL_PRESET_MINUTES,
} from '~/stores/post.store'

/** Tanlangan yoki eng yaqin preset daqiqa */
export function snapPostIntervalMin(raw: unknown): number {
  const m = Math.round(Number(raw) || 0)
  const presets = POST_INTERVAL_PRESET_MINUTES as readonly number[]
  if (presets.includes(m)) return m
  let best = DEFAULT_POST_INTERVAL_MIN
  let diff = Infinity
  for (const p of presets) {
    const d = Math.abs(p - m)
    if (d < diff) {
      diff = d
      best = p
    }
  }
  return best
}

export function campaignIntervalMin(campaign: PostCampaign): number {
  const fromMin = campaign.intervalMin ?? campaign.postsAfterThreshold
  if (Number.isFinite(fromMin) && fromMin > 0) return Math.round(fromMin)
  const sec = Number(campaign.intervalSec)
  if (Number.isFinite(sec) && sec >= 60) return Math.round(sec / 60)
  return DEFAULT_POST_INTERVAL_MIN
}

/** Kartochka sarlavhasi: guruhlar + interval */
export function campaignGroupsMetaLabel(campaign: PostCampaign, compact = false): string {
  const g = campaign.groupIds?.length ?? 0
  const n = campaignIntervalMin(campaign)
  if (compact) return `${g}g · ${n}d`
  return `${g} guruh · ${n} daq`
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
