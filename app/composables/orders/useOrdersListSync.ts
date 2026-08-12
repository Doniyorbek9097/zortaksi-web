import type { Ref } from 'vue'
import type { useOrderStore } from '~/stores/order.store'

type QueryParams = () => {
  limit: number
  search?: string
  botGroupId?: string
  text?: string
  scope?: 'mine'
}

/**
 * Ro'yxat sync: poll, infinite scroll va "ko'rilgan" badge kuzatuvchisi.
 * Chatdan qaytganda ro'yxat/scroll saqlanadi (to'liq qayta load qilinmaydi).
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

  // LIVE + catch-up: page>1 da ham yangilarni boshiga qo'shadi (scroll buzilmaydi)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  // --- Infinite scroll (IntersectionObserver) ---
  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  /** Ro'yxatda ko'rinadigan buyurtmalar — badge dan chiqarish */
  const listRoot = ref<HTMLElement | null>(null)
  let seenObserver: IntersectionObserver | null = null
  const observedSeenEls = new WeakSet<Element>()

  const saveScroll = () => {
    if (!import.meta.client) return
    orderStore.ordersListScrollY =
      window.scrollY || document.documentElement.scrollTop || 0
  }

  const restoreScroll = () => {
    if (!import.meta.client) return
    const y = orderStore.ordersListScrollY
    if (y == null || y <= 0) return
    window.scrollTo(0, y)
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
      // Chatdan qaytish — pagination + scroll; filtr server bilan mos
      await nextTick()
      restoreScroll()
      setTimeout(restoreScroll, 50)
      setTimeout(restoreScroll, 150)
      void orderStore.syncLatest(queryParams())
    } else {
      // Filtr o'zgargan yoki bo'sh cache — serverdan filterlab yuklash
      await load()
    }

    pollTimer = setInterval(() => {
      void orderStore.syncLatest(queryParams())
    }, 10000)

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    if (sentinel.value) observer.observe(sentinel.value)
    bindSeenObserver()
  })

  // Sentinel v-if bilan paydo bo'lsa/yo'qolsa — qayta kuzatamiz
  watch(sentinel, (el) => {
    if (observer && el) observer.observe(el)
  })

  watch(
    () => displayOrders.value.map((o) => o._id).join(','),
    () => bindSeenObserver(),
  )

  onBeforeUnmount(() => {
    saveScroll()
    if (pollTimer) clearInterval(pollTimer)
    if (observer) observer.disconnect()
    if (seenObserver) seenObserver.disconnect()
  })

  return {
    sentinel,
    listRoot,
    saveScroll,
  }
}
