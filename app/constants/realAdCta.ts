export const REAL_AD_CTA_OPTIONS = [
  'Xarid qilish',
  'Sotib olish',
  'Ilovani yuklab olish',
  "Ro'yxatga yozilish",
  'Saytga kirish',
] as const

export type RealAdCtaLabel = (typeof REAL_AD_CTA_OPTIONS)[number]

export const DEFAULT_REAL_AD_CTA_LABEL: RealAdCtaLabel = 'Xarid qilish'

export function resolveRealAdCtaLabel(raw?: string | null): RealAdCtaLabel {
  const v = String(raw || '').trim()
  if ((REAL_AD_CTA_OPTIONS as readonly string[]).includes(v)) {
    return v as RealAdCtaLabel
  }
  return DEFAULT_REAL_AD_CTA_LABEL
}
