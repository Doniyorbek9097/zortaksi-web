import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isMobileDevice } from '~/utils/devicePlatform'
import { isTelegramWebContext } from '~/utils/telegramOpenBrowser'

/** PWA o‘rnatish taklifi — faqat shu yo‘llarda */
export const PWA_INSTALL_HOME_PATHS = ['/', '/driver/dashboard'] as const

export function isOnPwaInstallHome(path: string): boolean {
  const p = (path.split('?')[0] || '/').replace(/\/+$/, '') || '/'
  return p === '/' || p === '/driver/dashboard'
}

/** Mobil oddiy brauzer + asosiy sahifa (Telegram / WebView emas) */
export function shouldOfferPwaInstallPrompt(path: string): boolean {
  if (!import.meta.client) return false
  if (!mobileNeedsPwaShell()) return false
  if (isFlutterWebView()) return false
  if (document.documentElement.dataset.ztEmbed === 'webview') return false
  if (document.documentElement.dataset.ztEmbed === 'telegram') return false
  if (isTelegramWebContext()) return false
  if (!isOnPwaInstallHome(path)) return false
  return true
}

const HIDE_INSTALL_KEY = 'vite-pwa:hide-install'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let deferredInstall: BeforeInstallPromptEvent | null = null
const installReadyListeners = new Set<() => void>()

export function isRunningInPwaShell(): boolean {
  return isPwaStandalone()
}

/** Mobil brauzerda PWA majburiy (Flutter/Telegram keyin — composable hal qiladi) */
export function mobileNeedsPwaShell(): boolean {
  if (!import.meta.client) return false
  return isMobileDevice() && !isPwaStandalone()
}

export function resetPwaInstallDismissed(): void {
  try {
    localStorage.removeItem(HIDE_INSTALL_KEY)
  } catch {
    /* */
  }
}

export function initPwaInstallCapture(): void {
  if (!import.meta.client) return
  if ((window as any).__ztPwaCapture) return
  ;(window as any).__ztPwaCapture = true

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredInstall = e as BeforeInstallPromptEvent
    resetPwaInstallDismissed()
    for (const fn of installReadyListeners) {
      try {
        fn()
      } catch {
        /* */
      }
    }
  })

  window.addEventListener('appinstalled', () => {
    deferredInstall = null
    for (const fn of installReadyListeners) {
      try {
        fn()
      } catch {
        /* */
      }
    }
  })
}

export function onPwaInstallReady(cb: () => void): () => void {
  installReadyListeners.add(cb)
  return () => installReadyListeners.delete(cb)
}

export function hasDeferredPwaInstall(): boolean {
  return !!deferredInstall
}

export async function triggerDeferredPwaInstall(): Promise<{ outcome: string } | null> {
  if (!deferredInstall) return null
  try {
    deferredInstall.prompt()
    const choice = await deferredInstall.userChoice
    if (choice.outcome === 'accepted') deferredInstall = null
    return choice
  } catch {
    return null
  }
}

export async function detectInstalledWebApp(): Promise<boolean> {
  if (!import.meta.client) return false
  const nav = navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<Array<{ platform?: string }>>
  }
  if (!nav.getInstalledRelatedApps) return false
  try {
    const apps = await nav.getInstalledRelatedApps()
    return apps.some((a) => String(a.platform || '').toLowerCase() === 'webapp')
  } catch {
    return false
  }
}

/** PWA o'rnatilgach — standalone rejimga o'tish uchun qayta yuklash */
export function reloadIntoPwaShell(path = '/driver/dashboard'): void {
  if (!import.meta.client) return
  const url = new URL(path, window.location.origin)
  window.location.replace(url.toString())
}