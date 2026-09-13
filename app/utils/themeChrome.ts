export type ThemeName = 'light' | 'dark'
export type ThemePreference = ThemeName | 'system'

/** PWA / status bar — layout `bg-slate-50` / `dark:bg-slate-950` */
export const THEME_CHROME: Record<ThemeName, string> = {
  light: '#f8fafc',
  dark: '#020617',
}

/** Tabbar fon — `bg-white dark:bg-slate-950` */
export const TABBAR_CHROME: Record<ThemeName, string> = {
  light: '#ffffff',
  dark: '#020617',
}
