export type ThemeName = 'light' | 'dark'
export type ThemePreference = ThemeName | 'system'

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

export function systemPrefersDark(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(pref: ThemePreference): ThemeName {
  if (pref === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return pref
}

/**
 * Status / bottom navigation bar (Android PWA).
 */
export function applyBrowserChrome(value: ThemeName) {
  if (!import.meta.client) return

  const color = THEME_CHROME[value]
  const root = document.documentElement

  root.style.colorScheme = value === 'light' ? 'only light' : 'only dark'
  root.style.backgroundColor = color
  if (document.body) document.body.style.backgroundColor = color

  removeMetaAll('theme-color')
  removeMetaAll('color-scheme')
  removeMetaAll('apple-mobile-web-app-status-bar-style')

  appendMeta('theme-color', color, '(prefers-color-scheme: light)')
  appendMeta('theme-color', color, '(prefers-color-scheme: dark)')
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
    /* */
  }
}

export const useTheme = () => {
  const theme = useCookie<ThemePreference>('zt-theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: true,
  })

  const effectiveTheme = computed<ThemeName>(() => resolveTheme(theme.value))

  const setTheme = (value: ThemePreference) => {
    theme.value = value === 'dark' || value === 'light' ? value : 'system'
    applyBrowserChrome(resolveTheme(theme.value))
  }

  const toggleTheme = () => {
    const current = resolveTheme(theme.value)
    setTheme(current === 'dark' ? 'light' : 'dark')
  }

  let systemMqBound = false

  const initTheme = () => {
    if (!import.meta.client) return
    applyBrowserChrome(resolveTheme(theme.value))
    if (!systemMqBound) {
      systemMqBound = true
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', () => {
        if (theme.value === 'system') {
          applyBrowserChrome(resolveTheme('system'))
        }
      })
    }
  }

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    initTheme,
    applyBrowserChrome,
    resolveTheme,
  }
}
