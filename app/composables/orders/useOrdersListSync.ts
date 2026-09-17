import type { Ref } from 'vue'
import type { useOrderStore } from '~/stores/order.store'
import {
  consumeOrdersTabSwitchEntry,
  shouldSaveDriverListScroll,
} from '~/utils/driverScrollNav'
type QueryParams = () => {
  limit: number
  search?: string
  botGroupId?: string
  listenerUserIds?: string
  text?: string
  scope?: 'mine'
}

const POLL_MS = 45_000
const VIEWPORT_BOTTOM_SLACK = 96
const FILL_VIEWPORT_MAX = 10

/**
 * Ro'yxat sync: poll (visibility-aware), infinite scroll va "ko'rilgan" badge.
 * Chatlar sahifasi kabi — kesh bo'lsa darhol ko'rsatiladi, fon da yangilanadi.
 */
export function useOrdersListSync(options: {
  orderStore: ReturnType<typeof useOrderStore>
  displayOrders: Ref<Array<{ _id: string }>>
  queryParams: QueryParams
  load: () => unknown
  loadMore: () => unknown
  hydrateFilter: () => void
}) {
  const { orderStore, displayOrders, queryParams, loadMore, hydrateFilter } = options

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let pageActive = true

  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  const listRoot = ref<HTMLElement | null>(null)
  let seenObserver: IntersectionObserver | null = null
  const observedSeenEls = new WeakSet<Element>()

  const persistScroll = () => {
    if (!import.meta.client) return
    orderStore.ordersListScrollY =
      window.scrollY || document.documentElement.scrollTop || 0
  }

  const saveScroll = () => {
    if (!shouldSaveDriverListScroll()) return
    persistScroll()
  }

  const scrollWindowTo = (top: number) => {
    if (!import.meta.client) return
    window.scrollTo(0, Math.max(0, top))
  }

  const restoreScroll = () => {
    if (!import.meta.client) return
    const y = orderStore.ordersListScrollY

    const apply = () => {
      if (y != null && y > 0) {
        scrollWindowTo(y)
        return
      }

      const anchorId = orderStore.ordersListAnchorOrderId
      if (!anchorId) {
        scrollWindowTo(0)
        return
      }
      const el = document.querySelector(
        `.order-seen-anchor[data-order-id="${anchorId}"]`,
      ) as HTMLElement | null
      if (!el) return
      const top =
        el.getBoundingClientRect().top +
        (window.scrollY || document.documentElement.scrollTop || 0)
      scrollWindowTo(top)
    }

    apply()
    requestAnimationFrame(apply)
  }

  const restoreListScroll = (fromTabSwitch: boolean) => {
    if (fromTabSwitch) {
      orderStore.clearOrdersListScroll()
      scrollWindowTo(0)
      return
    }
    if (orderStore.ordersListScrollY > 0 || orderStore.ordersListAnchorOrderId) {
      restoreScroll()
    } else {
      scrollWindowTo(0)
    }
  }

  const syncIfVisible = () => {
    if (!import.meta.client || !pageActive) return
    if (document.hidden) return
    void orderStore.syncLatest(queryParams())
  }

  const bindSeenObserver = () => {
    if (!import.meta.client) return
    if (!seenObserver) {
      seenObserver = new IntersectionObserver(
        (entries) => {
          const ids: string[] = []
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const id = (entry.target as HTMLElement).dataset.orderId
            if (id) ids.push(id)
            seenObserver?.unobserve(entry.target)
          }
          if (ids.length) orderStore.markOrdersSeen(ids)
        },
        { threshold: 0.35, rootMargin: '0px 0px -8% 0px' },
      )
    }
    nextTick(() => {
      const root = listRoot.value
      if (!root) return
      root.querySelectorAll('.order-seen-anchor[data-order-id]').forEach((el) => {
        if (observedSeenEls.has(el)) return
        observedSeenEls.add(el)
        seenObserver?.observe(el)
      })
    })
  }

  const sentinelInView = () => {
    const el = sentinel.value
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.top <= window.innerHeight + 520
  }

  const viewportNotScrollable = () => {
    if (!import.meta.client) return false
    const doc = document.documentElement
    return doc.scrollHeight <= window.innerHeight + VIEWPORT_BOTTOM_SLACK
  }

  const shouldPrefetchMore = () => {
    if (!import.meta.client || !pageActive || !orderStore.hasMore) return false
    if (!orderStore.orders.length) return false
    return sentinelInView() || viewportNotScrollable()
  }

  const waitForListReady = async () => {
    for (let i = 0; i < 12; i++) {
      if (!displayOrders.value.length) return
      if (sentinel.value || listRoot.value) return
      await nextTick()
      await new Promise((r) => setTimeout(r, 40))
    }
  }

  const tryLoadMore = async () => {
    if (orderStore.isLoading || orderStore.isLoadingMore || !orderStore.hasMore) return
    await loadMore()
  }

  let fillViewportTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleFillViewport = () => {
    if (!import.meta.client || !pageActive) return
    if (fillViewportTimer) clearTimeout(fillViewportTimer)
    fillViewportTimer = setTimeout(() => {
      fillViewportTimer = null
      void fillViewport()
    }, 0)
  }

  const fillViewport = async () => {
    if (!orderStore.hasMore) return
    await waitForListReady()
    let guard = 0
    while (guard < FILL_VIEWPORT_MAX && shouldPrefetchMore() && orderStore.hasMore) {
      if (orderStore.isLoading || orderStore.isLoadingMore) {
        await new Promise((r) => setTimeout(r, 80))
        continue
      }
      const before = orderStore.orders.length
      await tryLoadMore()
      await nextTick()
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
      guard += 1
      if (orderStore.orders.length === before) break
    }
  }

  const onSentinelIntersect = (entries: IntersectionObserverEntry[]) => {
    if (!entries[0]?.isIntersecting) return
    void (async () => {
      await tryLoadMore()
      await nextTick()
      await fillViewport()
    })()
  }

  const onVisibility = () => {
    if (!document.hidden) syncIfVisible()
  }

  /** Chatlar kabi: kesh bo'lsa darhol ko'rsatish, fon da silent yangilash */
  const bootOrdersList = async (fromTabSwitch = false) => {
    hydrateFilter()
    const q = queryParams()
    const pageParams = { page: 1, ...q }
    const hasCached = orderStore.isOrdersListReadyForParams(pageParams)

    if (hasCached) {
      void orderStore.fetchOrders(pageParams, { silent: true })
      await nextTick()
      restoreListScroll(fromTabSwitch)
      return
    }

    if (fromTabSwitch) orderStore.clearOrdersListScroll()
    await orderStore.fetchOrders(pageParams)
    await nextTick()
    restoreListScroll(fromTabSwitch)
  }

  const startPoll = () => {
    if (!pollTimer) {
      pollTimer = setInterval(syncIfVisible, POLL_MS)
    }
    document.addEventListener('visibilitychange', onVisibility)
  }

  const stopPoll = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    document.removeEventListener('visibilitychange', onVisibility)
  }

  const pageMounted = ref(false)

  const activateOrdersPage = async (fromTabSwitch = false) => {
    pageActive = true
    await bootOrdersList(fromTabSwitch)

    startPoll()
    syncIfVisible()
    bindSeenObserver()

    if (observer && sentinel.value) observer.observe(sentinel.value)

    if (!fromTabSwitch) {
      if (orderStore.orders.length) {
        scheduleFillViewport()
      } else {
        await fillViewport()
      }
    }
  }

  onMounted(() => {
    orderStore.startRecentMinuteTicker()
    observer = new IntersectionObserver(onSentinelIntersect, { rootMargin: '520px' })
    if (sentinel.value) observer.observe(sentinel.value)
    void activateOrdersPage(false).finally(() => {
      pageMounted.value = true
    })
  })

  onActivated(async () => {
    if (!pageMounted.value) return
    const fromTabSwitch = consumeOrdersTabSwitchEntry()
    await activateOrdersPage(fromTabSwitch)
  })

  onDeactivated(() => {
    pageActive = false
    saveScroll()
    stopPoll()
    if (fillViewportTimer) clearTimeout(fillViewportTimer)
    fillViewportTimer = null
  })

  watch(sentinel, (el) => {
    if (observer && el) observer.observe(el)
    if (el) scheduleFillViewport()
  })

  watch(
    () => orderStore.isLoading || orderStore.isLoadingMore,
    (busy, prevBusy) => {
      if (prevBusy && !busy) scheduleFillViewport()
    },
  )

  watch(
    () => displayOrders.value.length,
    (len, prev) => {
      bindSeenObserver()
      if (prev != null && len > prev) {
        scheduleFillViewport()
      }
    },
  )

  onBeforeUnmount(() => {
    saveScroll()
    stopPoll()
    if (fillViewportTimer) clearTimeout(fillViewportTimer)
    fillViewportTimer = null
    orderStore.stopRecentMinuteTicker()
    if (observer) observer.disconnect()
    if (seenObserver) seenObserver.disconnect()
  })

  return {
    sentinel,
    listRoot,
    saveScroll,
    persistScroll,
  }
}
