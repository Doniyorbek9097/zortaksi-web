import { isPwaStandalone } from '~/utils/appEmbed'
import { notifyFlutterChrome } from '~/utils/flutterChromeBridge'
import { applyDeviceStatusBarChrome, scheduleThemeColorRepaint } from '~/utils/themeColorMeta'
import { applyRootThemeBootstrap } from '~/utils/themeBoot'
import {
  STATUS_BAR_CHROME,
  TABBAR_CHROME,
  THEME_CHROME,
  type ThemeName,
  type ThemePreference,
} from '~/utils/themeChrome'

export type { ThemeName, ThemePreference }
export { THEME_CHROME }

type TgWebApp = {
  colorScheme?: ThemeName
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  setBottomBarColor?: (color: string) => void
}

let systemMqHooked = false

export function systemPrefersDark(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(pref: ThemePreference, systemDark = false): ThemeName {
  if (pref === 'system') return systemDark ? 'dark' : 'light'
  return pref
}

function hookSystemColorScheme(
  systemDark: Ref<boolean>,
  onChange: () => void,
) {
  if (!import.meta.client || systemMqHooked) return
  systemMqHooked = true
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mq.matches
  mq.addEventListener('change', () => {
    systemDark.value = mq.matches
    onChange()
  })
}

/** Brauzer/Telegram/Flutter — PWA tizim paneliga tegmaydi */
export function applyBrowserChrome(value: ThemeName) {
  if (!import.meta.client) return

  const color = THEME_CHROME[value]
  const statusBarColor = STATUS_BAR_CHROME[value]
  const navColor = TABBAR_CHROME[value]
  const root = document.documentElement
  const inPwa = isPwaStandalone()

  root.dataset.ztTheme = value
  root.style.backgroundColor = color
  if (document.body) document.body.style.backgroundColor = color

  if (inPwa) {
    root.style.colorScheme = systemPrefersDark() ? 'only dark' : 'only light'
    applyDeviceStatusBarChrome()
  } else {
    root.style.colorScheme = value === 'light' ? 'only light' : 'only dark'
    scheduleThemeColorRepaint(value, statusBarColor, color)
  }

  root.dataset.ztChromeNav = navColor

  const tg = (window as Window & { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
  try {
    tg?.setHeaderColor?.(color)
    tg?.setBackgroundColor?.(color)
    tg?.setBottomBarColor?.(color)
  } catch {
    /* */
  }

  notifyFlutterChrome(
    { mode: value, status: color, nav: TABBAR_CHROME[value] },
    0,
  )
}

let reactiveChromeBound = false
let visibilityChromeBound = false

export const useTheme = () => {
  const theme = useCookie<ThemePreference>('zt-theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: true,
  })

  const systemPrefersDarkState = useState('zt-system-prefers-dark', () => false)

  const effectiveTheme = computed<ThemeName>(() =>
    resolveTheme(theme.value, systemPrefersDarkState.value),
  )

  const syncChrome = () => {
    applyBrowserChrome(effectiveTheme.value)
  }

  const setTheme = (value: ThemePreference) => {
    theme.value = value === 'dark' || value === 'light' ? value : 'system'
    syncChrome()
  }

  const toggleTheme = () => {
    setTheme(effectiveTheme.value === 'dark' ? 'light' : 'dark')
  }

  const initTheme = () => {
    if (!import.meta.client) return
    applyRootThemeBootstrap(theme.value)
    hookSystemColorScheme(systemPrefersDarkState, () => {
      syncChrome()
      if (isPwaStandalone()) applyDeviceStatusBarChrome()
    })
    syncChrome()
    if (!visibilityChromeBound) {
      visibilityChromeBound = true
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return
        syncChrome()
        if (isPwaStandalone()) applyDeviceStatusBarChrome()
      })
    }
  }

  if (!reactiveChromeBound) {
    reactiveChromeBound = true
    watch(effectiveTheme, () => syncChrome(), { flush: 'post' })
    watch(theme, () => syncChrome())
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
