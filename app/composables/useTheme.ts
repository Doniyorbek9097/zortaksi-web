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

function upsertMeta(name: string, content: string) {
  if (!import.meta.client) return
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Status bar, navigation bar, iOS / Telegram chrome */
export function applyBrowserChrome(value: ThemeName) {
  if (!import.meta.client) return

  const color = THEME_CHROME[value]
  const root = document.documentElement

  root.style.colorScheme = value
  root.style.backgroundColor = color
  if (document.body) document.body.style.backgroundColor = color

  upsertMeta('theme-color', color)
  upsertMeta('color-scheme', value)
  upsertMeta(
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
  // Bu <html> ga `dark` klassini server tomonda ham qo'yish imkonini beradi
  // (flash yo'q) va mavzu almashtirish har doim ishlaydi.
  const theme = useCookie<ThemeName>('zt-theme', {
    default: () => 'dark',
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

  /**
   * Faqat foydalanuvchi hali mavzuni tanlamagan bo'lsa (cookie yo'q) —
   * Telegram WebApp yoki qurilma tizim sozlamasiga qarab boshlang'ich
   * mavzuni aniqlaydi. Aks holda saqlangan tanlovga tegmaydi.
   */
  const initTheme = () => {
    if (!import.meta.client) return

    const hasSaved = document.cookie
      .split('; ')
      .some((c) => c.startsWith('zt-theme='))

    if (!hasSaved) {
      const tg = (window as Window & {
        Telegram?: { WebApp?: TgWebApp }
      }).Telegram?.WebApp

      if (tg?.colorScheme) {
        theme.value = tg.colorScheme
      } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        theme.value = 'light'
      }
    }

    applyBrowserChrome(theme.value === 'light' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme, initTheme, applyBrowserChrome }
}
