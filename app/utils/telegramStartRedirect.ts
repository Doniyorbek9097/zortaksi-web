import type { Router } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import {
  captureTelegramStartParam,
  readTelegramStartParam,
  resolveTelegramStartNavigation,
  routeFromTelegramStartParam,
} from '~/utils/telegramStartParam'
import { resolveHomePath } from '~/utils/userRole'

export function isTelegramMiniApp(): boolean {
  if (!import.meta.client) return false
  if (document.documentElement.dataset.ztEmbed === 'telegram') return true
  try {
    const tg = (
      window as Window & {
        Telegram?: { WebApp?: { initData?: string; platform?: string } }
      }
    ).Telegram?.WebApp
    if (tg?.initData) return true
    const p = String(tg?.platform || '')
    return !!p && p !== 'unknown'
  } catch {
    return false
  }
}

/** SDK yuklanishidan oldin ham hash orqali aniqlash (start_param erta redirect) */
export function mightBeTelegramMiniApp(): boolean {
  if (!import.meta.client) return false
  if (isTelegramMiniApp()) return true
  try {
    const h = String(window.location.hash || '')
    const s = String(window.location.search || '')
    if (/tgWebApp/i.test(h) || /tgWebApp/i.test(s)) return true
    if (/start_param|tgWebAppStartParam/i.test(h) || /start_param/i.test(s)) return true
  } catch {
    /* */
  }
  return false
}

export function peekTelegramStartRoute(): RouteLocationRaw | null {
  return routeFromTelegramStartParam(readTelegramStartParam())
}

/** start_param → chat/open; topilmasa dashboard (faqat / da) */
export function applyTelegramStartRedirect(router: Router): boolean {
  captureTelegramStartParam()
  const target = resolveTelegramStartNavigation(router.currentRoute.value)
  if (target) {
    void router.replace(target)
    return true
  }
  return false
}

const TELEGRAM_START_REDIRECT_PATHS = new Set([
  '/',
  '/auth',
  '/login',
  '/register',
  '/driver/dashboard',
])

export function scheduleTelegramStartRedirect(router: Router): void {
  if (!import.meta.client || !mightBeTelegramMiniApp()) return

  const tryRedirect = () => {
    const path = router.currentRoute.value.path
    if (!TELEGRAM_START_REDIRECT_PATHS.has(path)) return false
    return applyTelegramStartRedirect(router)
  }

  // Hash dan start_param ko'pincha SDK dan oldin mavjud — darhol redirect
  tryRedirect()
  for (const ms of [16, 50, 120, 250, 500, 900, 1500, 2500, 4000]) {
    setTimeout(tryRedirect, ms)
  }

  // Fallback: faqat ancha kutgandan keyin va hanuz root'da turganda.
  setTimeout(() => {
    if (tryRedirect()) return
    const path = router.currentRoute.value.path
    if (path !== '/') return
    if (readTelegramStartParam()) return

    try {
      const auth = useAuthStore()
      if (!auth.user) return
      void router.replace(resolveHomePath(auth.user))
    } catch {
      void router.replace('/driver/dashboard')
    }
  }, 6500)
}
