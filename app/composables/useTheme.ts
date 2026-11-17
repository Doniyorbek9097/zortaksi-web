import { notifyFlutterChrome } from '~/utils/flutterChromeBridge'
import {
  IOS_STATUS_BAR_STYLE,
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

/** Android PWA ba'zan faqat DOM orqali yangilansa status barni yangilaydi */
function punchThemeColorMeta(color: string) {
  if (!import.meta.client) return
  const nodes = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
  for (const node of nodes) {
    node.setAttribute('content', color)
  }
  if (nodes.length === 0) {
    const el = document.createElement('meta')
    el.name = 'theme-color'
    el.content = color
    document.head.appendChild(el)
  }
}

/**
 * Status / bottom navigation bar (Android PWA).
 */
export function applyBrowserChrome(value: ThemeName) {
  if (!import.meta.client) return

  const color = THEME_CHROME[value]
  const navColor = TABBAR_CHROME[value]
  const root = document.documentElement

  root.dataset.ztTheme = value
  root.style.colorScheme = value === 'light' ? 'only light' : 'only dark'
  root.style.backgroundColor = color
  if (document.body) document.body.style.backgroundColor = color

  root.dataset.ztChromeNav = navColor
  punchThemeColorMeta(color)

  const iosStatus = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  )
  const statusStyle = IOS_STATUS_BAR_STYLE[value]
  if (iosStatus) iosStatus.content = statusStyle

  const tg = (window as Window & { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
  try {
    tg?.setHeaderColor?.(color)
    tg?.setBackgroundColor?.(color)
    tg?.setBottomBarColor?.(color)
  } catch {
    /* */
  }

  // Flutter WebView — darhol native chrome yangilash (async import kechikmasin)
  notifyFlutterChrome(
    { mode: value, status: color, nav: TABBAR_CHROME[value] },
    0,
  )
}

let themeChromeHeadInstalled = false
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

  if (!themeChromeHeadInstalled) {
    themeChromeHeadInstalled = true
    useHead({
      meta: computed(() => {
        const mode = effectiveTheme.value
        const color = THEME_CHROME[mode]
        return [
          {
            key: 'zt-theme-color',
            name: 'theme-color',
            content: color,
            tagPriority: 1,
          },
          {
            key: 'zt-color-scheme',
            name: 'color-scheme',
            content: mode,
            tagPriority: 1,
          },
          {
            key: 'zt-ios-status-bar',
            name: 'apple-mobile-web-app-status-bar-style',
            content: IOS_STATUS_BAR_STYLE[mode],
            tagPriority: 1,
          },
        ]
      }),
    })
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
    hookSystemColorScheme(systemPrefersDarkState, () => {
      if (theme.value === 'system') syncChrome()
    })
    syncChrome()
    if (!visibilityChromeBound) {
      visibilityChromeBound = true
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') syncChrome()
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
