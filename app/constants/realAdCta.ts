export const REAL_AD_CTA_OPTIONS = [
  'Xarid qilish',
  'Sotib olish',
  'Ilovani yuklab olish',
  "Ro'yxatga yozilish",
  'Saytga kirish',
] as const

export const REAL_AD_CTA_MAX_LENGTH = 48

export const DEFAULT_REAL_AD_CTA_LABEL = 'Xarid qilish'

/** Ko'rsatish / forma — bo'sh bo'lsa standart matn */
export function resolveRealAdCtaLabel(raw?: string | null): string {
  const v = String(raw || '').trim()
  if (!v) return DEFAULT_REAL_AD_CTA_LABEL
  return v.length > REAL_AD_CTA_MAX_LENGTH ? v.slice(0, REAL_AD_CTA_MAX_LENGTH) : v
}
