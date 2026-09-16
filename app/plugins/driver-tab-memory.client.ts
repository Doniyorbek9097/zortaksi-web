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
  isPanelTabbarPath,
  isPanelTabbarSwitch,
  normalizePath,
  type DriverMainTab,
  type PanelTabbarPath,
} from '~/utils/driverTabRoutes'
import {
  markDriverScrollLeave,
  peekDriverScrollLeave,
  finishDriverScrollLeave,
  markOrdersTabSwitchEntry,
} from '~/utils/driverScrollNav'

function releasePanelTabMemory(tab: PanelTabbarPath) {
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
    case '/driver/campaigns':
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
    releasePanelTabMemory(tab)
  }
  releaseSessionMediaCache()
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()

  router.beforeEach((to, from) => {
    const fromPath = normalizePath(from.path)
    const toPath = normalizePath(to.path)

    if (isPanelTabbarSwitch(fromPath, toPath)) {
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
    try {
      const orderStore = useOrderStore()
      const toPath = normalizePath(to.path)
      const fromPath = normalizePath(from.path)
      const tabSwitch = peekDriverScrollLeave() === 'tab-switch'

      // Order → chat: ro'yxat va scroll saqlanadi (trim scroll pozitsiyasini buzardi)
      if (/^\/driver\/chat\//.test(toPath) && fromPath.startsWith('/driver/orders')) {
        releaseSessionMediaCache()
        return
      }

      if (fromPath === toPath) return

      if (isPanelTabbarSwitch(fromPath, toPath)) {
        if (isPanelTabbarPath(fromPath)) {
          releasePanelTabMemory(fromPath)
        }
        releaseSessionMediaCache()

        if (tabSwitch) {
          if (toPath === '/driver/orders') {
            orderStore.clearOrdersListScroll()
            markOrdersTabSwitchEntry()
          }
          window.scrollTo(0, 0)
        }
        return
      }

      if (!isDriverMainTab(toPath)) return

      releaseOtherDriverTabs(toPath)

      if (tabSwitch) {
        if (toPath === '/driver/orders') {
          orderStore.clearOrdersListScroll()
          markOrdersTabSwitchEntry()
        }
        window.scrollTo(0, 0)
      }
    } finally {
      queueMicrotask(() => finishDriverScrollLeave())
    }
  })
})
