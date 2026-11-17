import { ensureTelegramWebAppScript, resolveTelegramWebContext } from '~/utils/telegramOpenBrowser'
import { mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

/** Telegram konteksti SDK dan oldin ham — gate uchun erta tayyorgarlik */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  const blob = `${window.location.hash}${window.location.search}`
  if (
    !mightBeTelegramMiniApp() &&
    !/Telegram/i.test(navigator.userAgent || '') &&
    !/tgWebApp/i.test(blob)
  ) {
    return
  }

  void ensureTelegramWebAppScript()
  void resolveTelegramWebContext(5000)
})