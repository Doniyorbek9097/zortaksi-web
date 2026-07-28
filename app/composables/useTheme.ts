export type ThemeName = 'light' | 'dark'

/** PWA / browser chrome — layout `bg-slate-50` / `dark:bg-slate-950` bilan mos */
export const THEME_CHROME = {
  light: '#f8fafc',
  dark: '#020617',
} as const

type TgWebApp = {
  colorScheme?: ThemeName
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  setBottomBarColor?: (color: string) => void
}

function removeMetaAll(name: string) {
  if (!import.meta.client) return
  document.querySelectorAll(`meta[name="${name}"]`).forEach((el) => el.remove())
}

function appendMeta(name: string, content: string, media?: string) {
  if (!import.meta.client) return
  const el = document.createElement('meta')
  el.setAttribute('name', name)
  el.setAttribute('content', content)
  if (media) el.setAttribute('media', media)
  document.head.appendChild(el)
}

/**
 * Status / bottom navigation bar (Android PWA).
 * Telefon dark rejimda bo'lsa ham app light bo'lsa — pastki nav bar ochiq bo'lishi uchun
 * theme-color ikkala prefers-color-scheme ga ham APP rangida yoziladi.
 */
export function applyBrowserChrome(value: ThemeName) {
  if (!import.meta.client) return

  const color = THEME_CHROME[value]
  const root = document.documentElement

  // `only` — brauzer OS dark rejimiga qarab chrome ni majburan dark qilmasin
  root.style.colorScheme = value === 'light' ? 'only light' : 'only dark'
  root.style.backgroundColor = color
  if (document.body) document.body.style.backgroundColor = color

  removeMetaAll('theme-color')
  removeMetaAll('color-scheme')
  removeMetaAll('apple-mobile-web-app-status-bar-style')

  // OS light/dark qaysi bo'lsa ham — content = app theme (bottom nav shu rangga o'tadi)
  appendMeta('theme-color', color, '(prefers-color-scheme: light)')
  appendMeta('theme-color', color, '(prefers-color-scheme: dark)')
  // Ba'zi WebView lar media'sizni oladi
  appendMeta('theme-color', color)

  appendMeta('color-scheme', value === 'light' ? 'light' : 'dark')
  appendMeta(
    'apple-mobile-web-app-status-bar-style',
    value === 'dark' ? 'black-translucent' : 'default',
  )

  const tg = (window as Window & { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
  try {
    tg?.setHeaderColor?.(color)
    tg?.setBackgroundColor?.(color)
    tg?.setBottomBarColor?.(color)
  } catch {
    /* Telegram versiyasi API ni qo‘llab-quvvatlamasligi mumkin */
  }
}

export const useTheme = () => {
  // Cookie orqali saqlaymiz — SSR ham, klient ham bir xil qiymatni ko'radi.
  // Birinchi kirishda default: light
  const theme = useCookie<ThemeName>('zt-theme', {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: true,
  })

  const setTheme = (value: ThemeName) => {
    theme.value = value
    applyBrowserChrome(value)
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

  const initTheme = () => {
    if (!import.meta.client) return

    const hasSaved = document.cookie
      .split('; ')
      .some((c) => c.startsWith('zt-theme='))

    // Birinchi marta — light (OS / Telegram dark ga ergashmaydi)
    if (!hasSaved) {
      theme.value = 'light'
    }

    applyBrowserChrome(theme.value === 'light' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme, initTheme, applyBrowserChrome }
}
