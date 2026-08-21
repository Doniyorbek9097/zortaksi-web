/**
 * Pastki tabbar orqali asosiy sahifaga o'tganda boshqa tablarning
 * og'ir Pinia / media xotirasini bo'shatadi.
 * Chat ochilganda buyurtmalar ro'yxatini yumshoq qisqartirish.
 */
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { usePostStore } from '~/stores/post.store'
import { releaseSessionMediaCache } from '~/composables/useVoiceMedia'
import {
  DRIVER_MAIN_TABS,
  isDriverMainTab,
  normalizePath,
  type DriverMainTab,
} from '~/utils/driverTabRoutes'

function releaseDriverTabMemory(tab: DriverMainTab) {
  const orderStore = useOrderStore()
  const chatStore = useChatStore()
  const postStore = usePostStore()

  switch (tab) {
    case '/driver/orders':
      orderStore.releaseListMemory()
      break
    case '/driver/chats':
      chatStore.releaseTabMemory()
      break
    case '/driver/post':
      postStore.releaseTabMemory()
      break
    default:
      break
  }
}

function releaseOtherDriverTabs(active: DriverMainTab) {
  for (const tab of DRIVER_MAIN_TABS) {
    if (tab === active) continue
    releaseDriverTabMemory(tab)
  }
  releaseSessionMediaCache()
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()

  router.afterEach((to, from) => {
    const toPath = normalizePath(to.path)
    const fromPath = normalizePath(from.path)

    // Order → chat: to'liq release emas, lekin RAM uchun qisqartirish
    if (/^\/driver\/chat\//.test(toPath) && fromPath.startsWith('/driver/orders')) {
      const orderStore = useOrderStore()
      orderStore.trimListForNavigation(15)
      releaseSessionMediaCache()
      return
    }

    if (!isDriverMainTab(toPath)) return
    if (fromPath === toPath) return

    releaseOtherDriverTabs(toPath)
  })
})
