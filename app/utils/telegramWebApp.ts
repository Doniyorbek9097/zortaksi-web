type TgWebAppUser = {
  id?: number
  username?: string
  first_name?: string
  last_name?: string
}

type TgWebApp = {
  initData?: string
  initDataUnsafe?: { user?: TgWebAppUser }
  requestPhoneNumber?: (cb: (ok: boolean, data?: { phone_number?: string }) => void) => void
  MainButton?: {
    setText: (text: string) => void
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  }
}

export function getTelegramWebApp(): TgWebApp | null {
  if (!import.meta.client) return null
  try {
    return (window as Window & { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp || null
  } catch {
    return null
  }
}

export function getTelegramWebAppInitData(): string {
  const tg = getTelegramWebApp()
  return String(tg?.initData || '').trim()
}

export function getTelegramWebAppUser(): TgWebAppUser | null {
  const tg = getTelegramWebApp()
  const user = tg?.initDataUnsafe?.user
  if (!user?.id) return null
  return user
}

export function hapticSuccess() {
  try {
    getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success')
  } catch {
    /* */
  }
}

export function hapticError() {
  try {
    getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error')
  } catch {
    /* */
  }
}
