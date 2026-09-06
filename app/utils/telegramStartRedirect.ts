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

export function scheduleTelegramStartRedirect(router: Router): void {
  if (!import.meta.client || !isTelegramMiniApp()) return

  const tryRedirect = () => applyTelegramStartRedirect(router)

  // start_param ayrim Telegram clientlarda kechikib keladi.
  // Shu sabab bir necha marta va biroz uzoqroq tekshiramiz.
  tryRedirect()
  for (const ms of [30, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000]) {
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
