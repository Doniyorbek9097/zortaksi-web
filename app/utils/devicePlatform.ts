/** Mobil OS — PWA / brauzer yo'riqnomasi uchun */

export type MobilePlatform = 'android' | 'ios' | 'other'

export function detectMobilePlatform(): MobilePlatform {
  if (!import.meta.client) return 'other'
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

export function isAndroidDevice(): boolean {
  return detectMobilePlatform() === 'android'
}

export function isIosDevice(): boolean {
  return detectMobilePlatform() === 'ios'
}

export function isMobileDevice(): boolean {
  return detectMobilePlatform() !== 'other'
}