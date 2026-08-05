/**
 * Pastki tabbar orqali asosiy sahifaga o'tganda boshqa tablarning
 * og'ir Pinia / media xotirasini bo'shatadi.
 * Ichki navigatsiya (masalan order → chat) da saqlanadi.
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
    if (!isDriverMainTab(toPath)) return
    if (normalizePath(from.path) === toPath) return

    releaseOtherDriverTabs(toPath)
  })
})
