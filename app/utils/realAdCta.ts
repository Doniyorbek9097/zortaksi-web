/** Reals pastki CTA tugma matnlari */
export const REAL_CTA_LABELS = [
  'Xarid qilish',
  'Sotib olish',
  'Ilovani yuklab olish',
  "Ro'yxatga yozilish",
  'Saytga kirish',
] as const

export type RealCtaLabel = (typeof REAL_CTA_LABELS)[number]

export const DEFAULT_REAL_CTA_LABEL: RealCtaLabel = 'Xarid qilish'

export function normalizeRealCtaLabel(raw?: string | null): RealCtaLabel {
  const v = String(raw || '').trim()
  if ((REAL_CTA_LABELS as readonly string[]).includes(v)) return v as RealCtaLabel
  return DEFAULT_REAL_CTA_LABEL
}
