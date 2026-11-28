import {
  PWA_SPLASH_BACKGROUND,
  THEME_CHROME,
  detectPwaStandaloneClient,
  htmlColorSchemeCss,
  type ThemeName,
  type ThemePreference,
} from '~/utils/themeChrome'

export { PWA_SPLASH_BACKGROUND }

export function readThemePreferenceFromCookie(): ThemePreference {
  if (!import.meta.client) return 'system'
  try {
    const match = document.cookie.match(/(?:^|;\s*)zt-theme=([^;]+)/)
    const raw = match ? decodeURIComponent(match[1]).trim() : 'system'
    if (raw === 'dark' || raw === 'light') return raw
  } catch {
    /* */
  }
  return 'system'
}

export function resolveEffectiveThemeName(
  pref: ThemePreference,
  systemDark?: boolean,
): ThemeName {
  const system =
    systemDark ??
    (import.meta.client
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false)
  if (pref === 'dark') return 'dark'
  if (pref === 'light') return 'light'
  return system ? 'dark' : 'light'
}

/** Birinchi paint — `dark` klassi va fon (SessionGate / layout flash oldini olish) */
export function applyRootThemeBootstrap(pref?: ThemePreference): ThemeName {
  if (!import.meta.client) return 'light'
  const preference = pref ?? readThemePreferenceFromCookie()
  const mode = resolveEffectiveThemeName(preference)
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.dataset.ztTheme = mode
  const bg = THEME_CHROME[mode]
  root.style.backgroundColor = bg
  if (document.body) document.body.style.backgroundColor = bg
  root.style.colorScheme = htmlColorSchemeCss(mode, detectPwaStandaloneClient())
  return mode
}