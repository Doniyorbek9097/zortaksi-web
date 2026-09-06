/**
 * Pastki tabbar orqali asosiy sahifaga o'tganda boshqa tablarning
 * og'ir Pinia / media xotirasini bo'shatadi.
 * Chat ochilganda buyurtmalar ro'yxatini yumshoq qisqartirish.
 */
import { useOrderStore } from '~/stores/order.store'
import { useChatStore } from '~/stores/chat.store'
import { usePostStore } from '~/stores/post.store'
import { releaseSessionMediaCache } from '~/composables/useVoiceMedia'
import { TAB_LIST_KEEP } from '~/utils/memoryBudget'
import {
  DRIVER_MAIN_TABS,
  isDriverMainTab,
  normalizePath,
  type DriverMainTab,
} from '~/utils/driverTabRoutes'
import {
  isDriverMainTabSwitch,
  markDriverScrollLeave,
  consumeDriverScrollLeave,
} from '~/utils/driverScrollNav'

function releaseDriverTabMemory(tab: DriverMainTab) {
  const orderStore = useOrderStore()
  const chatStore = useChatStore()
  const postStore = usePostStore()

  switch (tab) {
    case '/driver/orders':
      orderStore.trimListForTabSwitch(TAB_LIST_KEEP)
      break
    case '/driver/chats':
      chatStore.trimChatsForTabSwitch(TAB_LIST_KEEP)
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

  router.beforeEach((to, from) => {
    const fromPath = normalizePath(from.path)
    const toPath = normalizePath(to.path)

    if (isDriverMainTabSwitch(fromPath, toPath)) {
      markDriverScrollLeave('tab-switch')
      const orderStore = useOrderStore()
      const chatStore = useChatStore()
      if (fromPath === '/driver/orders') orderStore.clearOrdersListScroll()
      if (fromPath === '/driver/chats') chatStore.clearChatsListScroll()
    } else {
      markDriverScrollLeave('in-app')
    }
  })

  router.afterEach((to, from) => {
    const toPath = normalizePath(to.path)
    const fromPath = normalizePath(from.path)
    const tabSwitch = consumeDriverScrollLeave() === 'tab-switch'

    // Order → chat: ro'yxat va scroll saqlanadi (trim scroll pozitsiyasini buzardi)
    if (/^\/driver\/chat\//.test(toPath) && fromPath.startsWith('/driver/orders')) {
      releaseSessionMediaCache()
      return
    }

    if (!isDriverMainTab(toPath)) return
    if (fromPath === toPath) return

    releaseOtherDriverTabs(toPath)

    if (tabSwitch) {
      window.scrollTo(0, 0)
    }
  })
})
