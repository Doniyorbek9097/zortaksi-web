const TERMS_STORAGE_KEY = 'zortaksi_terms_v1'

/** Ro'yxatdan o'tishda bir marta qabul qilingan shartlar (qayta kirishda checkbox yashirin) */
export function hasStoredTermsConsent(): boolean {
  if (!import.meta.client) return false
  try {
    return localStorage.getItem(TERMS_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function storeTermsConsent(): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(TERMS_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}
