export type ThemeName = 'light' | 'dark'
export type ThemePreference = ThemeName | 'system'

function telegramMiniAppColorScheme(): ThemeName | null {
  if (typeof window === 'undefined') return null
  if (document.documentElement.dataset.ztEmbed === 'telegram') {
    /* platform aniqlanadi — pastdagi WebApp tekshiruvi */
  }
  try {
    const tg = (
      window as Window & {
        Telegram?: {
          WebApp?: {
            colorScheme?: string
            initData?: string
            platform?: string
          }
        }
      }
    ).Telegram?.WebApp
    if (!tg) return null
    const initData = String(tg.initData || '').trim()
    const platform = String(tg.platform || '').trim().toLowerCase()
    const inMiniApp =
      initData.length > 0 ||
      (!!platform && platform !== 'unknown') ||
      document.documentElement.dataset.ztEmbed === 'telegram'
    if (!inMiniApp) return null
    const tgScheme = String(tg.colorScheme || '').trim().toLowerCase()
    if (tgScheme === 'dark') return 'dark'
    if (tgScheme === 'light') return 'light'
  } catch {
    /* */
  }
  return null
}

/** Qurilma rejimi; Telegram — faqat haqiqiy Mini App ichida */
export function readDevicePrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  const tgScheme = telegramMiniAppColorScheme()
  if (tgScheme === 'dark') return true
  if (tgScheme === 'light') return false
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

/** Android/iOS PWA splash ekrani — doim qorong‘u fon */
export const PWA_SPLASH_BACKGROUND = '#020617'

/** Sahifa foni — layout `bg-slate-50` / `dark:bg-slate-950` */
export const THEME_CHROME: Record<ThemeName, string> = {
  light: '#f8fafc',
  dark: '#020617',
}

/** Android PWA status bar foni — yorug‘; iconlar tizim dark (qora) bo‘ladi */
export const STATUS_BAR_CHROME: Record<ThemeName, string> = {
  light: '#f8fafc',
  dark: '#020617',
}


/** Tabbar fon — `bg-white dark:bg-slate-950` */
export const TABBAR_CHROME: Record<ThemeName, string> = {
  light: '#ffffff',
  dark: '#020617',
}

/** iOS PWA status bar — light fonda qora iconlar, dark fonda oq */
export const IOS_STATUS_BAR_STYLE: Record<ThemeName, 'default' | 'black' | 'black-translucent'> = {
  light: 'default',
  dark: 'black',
}

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return 0
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function isLightChromeColor(hex: string): boolean {
  return hexLuminance(hex) > 0.6
}

/** `light dark` — `.dark` klassi va foydalanuvchi/tizim tanlovi */
export function htmlColorSchemeCss(_mode?: ThemeName): string {
  return 'light dark'
}

export function detectPwaStandaloneClient(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return true
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}
