import type { Ref } from 'vue'

/** Virtual ro'yxat qatori — o'z balandligi bilan */
export type VirtualRow<T = unknown> = {
  key: string
  height: number
  data: T
}

/**
 * Hujjat (window) scroll uchun virtual ro'yxat.
 * Faqat ko'rinadigan qatorlar DOM da — uzoq ro'yxatlarda RAM tejash.
 */
export function useWindowVirtualRows(
  rows: Ref<VirtualRow[]>,
  overscan = 4,
) {
  const scrollY = ref(0)
  const viewportHeight = ref(800)

  const offsets = computed(() => {
    const list = rows.value
    const o = [0]
    for (let i = 0; i < list.length; i++) {
      o.push(o[i] + list[i].height)
    }
    return o
  })

  const totalHeight = computed(() => {
    const len = rows.value.length
    return len ? offsets.value[len] : 0
  })

  const range = computed(() => {
    const list = rows.value
    const len = list.length
    if (!len) {
      return { start: 0, end: 0, paddingTop: 0, paddingBottom: 0, visible: [] as { row: VirtualRow; index: number }[] }
    }

    const y = scrollY.value
    const vh = viewportHeight.value
    const offs = offsets.value
    const bottom = y + vh

    let start = 0
    while (start < len && offs[start + 1] <= y) start++
    start = Math.max(0, start - overscan)

    let end = start
    while (end < len && offs[end] < bottom) end++
    end = Math.min(len, end + overscan)

    return {
      start,
      end,
      paddingTop: offs[start],
      paddingBottom: totalHeight.value - offs[end],
      visible: list.slice(start, end).map((row, i) => ({
        row,
        index: start + i,
      })),
    }
  })

  let onScroll: (() => void) | null = null
  let onResize: (() => void) | null = null

  onMounted(() => {
    if (!import.meta.client) return
    onScroll = () => {
      scrollY.value = window.scrollY || document.documentElement.scrollTop || 0
    }
    onResize = () => {
      viewportHeight.value = window.innerHeight || 800
    }
    onScroll()
    onResize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  })

  onBeforeUnmount(() => {
    if (!import.meta.client || !onScroll || !onResize) return
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  })

  return { range, totalHeight }
}
