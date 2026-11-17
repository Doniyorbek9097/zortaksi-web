import { useTelegramPwaOnboarding } from '~/composables/useTelegramPwaOnboarding'

/** Telegram / PWA onboarding — sahifa renderidan oldin gate yangilash */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  useTelegramPwaOnboarding().bootOnboarding()
})