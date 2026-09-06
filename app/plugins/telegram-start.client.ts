import { scheduleTelegramStartRedirect, mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

/** Telegram Mini App: start_param → buyurtma chat (SDK dan oldin ham hash orqali) */
export default defineNuxtPlugin({
  name: 'telegram-start',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return
    if (!mightBeTelegramMiniApp()) return
    scheduleTelegramStartRedirect(useRouter())
  },
})
