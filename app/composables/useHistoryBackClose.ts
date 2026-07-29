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
          history.pushState({ [key]: true, t: Date.now() }, '')
          pushed = true
          window.dispatchEvent(new Event('zt-history-layer'))
        }
        return
      }
      // Manual yopish — history yozuvini olib tashlash
      if (pushed && !closingViaPop) {
        pushed = false
        const st = history.state as Record<string, unknown> | null
        if (st && st[key]) {
          history.back()
        }
      } else {
        pushed = false
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    window.addEventListener('popstate', onPopState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPopState)
    if (pushed && toValue(open) && !closingViaPop) {
      pushed = false
      const st = history.state as Record<string, unknown> | null
      if (st && st[key]) {
        history.back()
      }
    }
  })

  return { disarm }
}
