export type ThemeName = 'light' | 'dark'

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
    if (hasSaved) return

    const tg = (window as Window & {
      Telegram?: { WebApp?: { colorScheme?: ThemeName } }
    }).Telegram?.WebApp

    if (tg?.colorScheme) {
      setTheme(tg.colorScheme)
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
    // else: standart 'dark' saqlanadi
  }

  return { theme, setTheme, toggleTheme, initTheme }
}
