import { scheduleTelegramStartRedirect } from '~/utils/telegramStartRedirect'

/** Telegram Mini App: start_param → buyurtma chat */
export default defineNuxtPlugin({
  name: 'telegram-start',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return
    scheduleTelegramStartRedirect(useRouter())
  },
})
