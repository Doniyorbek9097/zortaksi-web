import {
  captureTelegramStartParam,
  resolveTelegramStartNavigation,
} from '~/utils/telegramStartParam'

/** Telegram start_param kechikib kelishi mumkin — bir necha marta yo'naltirish */
export default defineNuxtPlugin({
  name: 'telegram-start',
  enforce: 'pre',
  setup() {
    if (!import.meta.client) return

    const router = useRouter()

    const tryOpenFromStartParam = () => {
      captureTelegramStartParam()
      const target = resolveTelegramStartNavigation(router.currentRoute.value)
      if (target) void router.replace(target)
    }

    tryOpenFromStartParam()
    requestAnimationFrame(tryOpenFromStartParam)
    setTimeout(tryOpenFromStartParam, 0)
    setTimeout(tryOpenFromStartParam, 80)
    setTimeout(tryOpenFromStartParam, 250)
    setTimeout(tryOpenFromStartParam, 600)
  },
})
