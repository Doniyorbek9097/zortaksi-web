/**
 * Overlay/dialog ochiq bo'lganda history.pushState;
 * Telegram/browser Back → onClose (oyna yopiladi, sahifa emas).
 */
import {
  watch,
  onMounted,
  onBeforeUnmount,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'

type Options = {
  /** history.state kaliti (stack uchun unique) */
  key?: string
}

function currentHistoryUrl(): string {
  if (!import.meta.client) return '/'
  return window.location.pathname + window.location.search + window.location.hash
}

function stripOverlayState(key: string) {
  const st = history.state as Record<string, unknown> | null
  if (!st || typeof st !== 'object' || !(key in st)) return
  const { [key]: _removed, ...rest } = st
  history.replaceState(rest, '', currentHistoryUrl())
}

export function useHistoryBackClose(
  open: MaybeRefOrGetter<boolean>,
  onClose: () => void,
  options: Options = {},
) {
  const key = options.key || 'ztOverlay'
  let pushed = false
  let closingViaPop = false

  /** navigateTo oldidan — history.back() yangi sahifani yeb qo'ymasligi uchun */
  const disarm = () => {
    if (!import.meta.client) return
    if (pushed) {
      stripOverlayState(key)
    }
    pushed = false
  }

  const onPopState = () => {
    if (!toValue(open) || !pushed) return
    closingViaPop = true
    pushed = false
    onClose()
    queueMicrotask(() => {
      closingViaPop = false
    })
  }

  watch(
    () => toValue(open),
    (val) => {
      if (!import.meta.client) return
      if (val) {
        if (!pushed) {
          const url = currentHistoryUrl()
          history.pushState({ ...((history.state as object) || {}), [key]: true, t: Date.now() }, '', url)
          pushed = true
          window.dispatchEvent(new Event('zt-history-layer'))
        }
        return
      }
      // Manual yopish — history.back() o'rniga state tozalash (router race oldini oladi)
      if (pushed && !closingViaPop) {
        stripOverlayState(key)
      }
      pushed = false
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('popstate', onPopState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPopState)
    disarm()
  })

  return { disarm }
}
