import type { Ref } from 'vue'
import type { useOrderStore } from '~/stores/order.store'
import { shouldSaveDriverListScroll } from '~/utils/driverScrollNav'

type QueryParams = () => {
  limit: number
  search?: string
  botGroupId?: string
  text?: string
  scope?: 'mine'
}

const POLL_MS = 45_000

/**
 * Ro'yxat sync: poll (visibility-aware), infinite scroll va "ko'rilgan" badge.
 */
export function useOrdersListSync(options: {
  orderStore: ReturnType<typeof useOrderStore>
  displayOrders: Ref<Array<{ _id: string }>>
  queryParams: QueryParams
  load: () => unknown
  loadMore: () => unknown
  hydrateFilter: () => void
}) {
  const { orderStore, displayOrders, queryParams, load, loadMore, hydrateFilter } = options

  let pollTimer: ReturnType<typeof setInterval> | null = null

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

  const restoreScroll = () => {
    if (!import.meta.client) return
    const y = orderStore.ordersListScrollY
    if (y == null || y <= 0) return
    window.scrollTo(0, y)
  }

  const syncIfVisible = () => {
    if (!import.meta.client) return
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

  const onVisibility = () => {
    if (!document.hidden) syncIfVisible()
  }

  onMounted(async () => {
    orderStore.startRecentMinuteTicker()
    hydrateFilter()

    const q = queryParams()
    const wantSearch = String(q.search || '').trim()
    const wantBotGroup = String(q.botGroupId || '').trim()
    const wantText = String(q.text || '').trim()
    const hasCachedList = orderStore.orders.length > 0
    const sameServerFilter =
      String(orderStore.listSearch || '') === wantSearch &&
      String(orderStore.listBotGroupId || '') === wantBotGroup &&
      String(orderStore.listText || '') === wantText &&
      orderStore.listScope === 'all'

    if (hasCachedList && sameServerFilter) {
      await nextTick()
      restoreScroll()
      setTimeout(restoreScroll, 80)
      syncIfVisible()
    } else {
      await load()
    }

    pollTimer = setInterval(syncIfVisible, POLL_MS)
    document.addEventListener('visibilitychange', onVisibility)

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '520px' },
    )
    if (sentinel.value) observer.observe(sentinel.value)
    bindSeenObserver()
  })

  watch(sentinel, (el) => {
    if (observer && el) observer.observe(el)
  })

  // Faqat uzunlik o'zgarsa — to'liq id join emas
  watch(
    () => displayOrders.value.length,
    () => bindSeenObserver(),
  )

  onBeforeUnmount(() => {
    saveScroll()
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    document.removeEventListener('visibilitychange', onVisibility)
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
