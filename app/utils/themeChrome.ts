export type ThemeName = 'light' | 'dark'
export type ThemePreference = ThemeName | 'system'

/** Sahifa foni — layout `bg-slate-50` / `dark:bg-slate-950` */
export const THEME_CHROME: Record<ThemeName, string> = {
  light: '#f8fafc',
  dark: '#020617',
}

/** Android PWA status bar — yorug‘ fon, qora iconlar (faqat #fff ba’zan oq icon beradi) */
export const STATUS_BAR_CHROME: Record<ThemeName, string> = {
  light: '#e8eef5',
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
