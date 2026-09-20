import type { Ref } from 'vue'
import { getTelegramWebApp } from '~/utils/telegramWebApp'

type Focusable = HTMLTextAreaElement | HTMLInputElement

function prepareTelegramViewport() {
  try {
    const tg = getTelegramWebApp() as {
      ready?: () => void
      expand?: () => void
    } | null
    tg?.ready?.()
    tg?.expand?.()
  } catch {
    /* */
  }
}

function isVisible(el: Focusable): boolean {
  return el.offsetParent !== null || el.getClientRects().length > 0
}

function focusField(el: Focusable | null): boolean {
  if (!el || el.disabled || !isVisible(el)) return false
  if (document.activeElement === el) return true

  try {
    el.focus({ preventScroll: true })
  } catch {
    try {
      el.focus()
    } catch {
      return false
    }
  }

  try {
    const len = el.value.length
    el.setSelectionRange(len, len)
  } catch {
    /* */
  }

  return document.activeElement === el
}

/** Taxi chaqirish — qadam o'zgarganda bir marta fokus (klaviatura tebranmasin) */
export function usePassengerTaxiFocus(opts: {
  step: Ref<string>
  bootstrapped: Ref<boolean>
  routeTextareaRef: Ref<HTMLTextAreaElement | null>
  phoneInputRef: Ref<HTMLInputElement | null>
}) {
  const { step, bootstrapped, routeTextareaRef, phoneInputRef } = opts
  let retryTimer: ReturnType<typeof setTimeout> | null = null

  function clearRetry() {
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  }

  function focusForCurrentStep() {
    if (!bootstrapped.value) return
    clearRetry()

    const current = step.value
    if (current !== 'route' && current !== 'phone') return

    const el =
      current === 'route' ? routeTextareaRef.value : phoneInputRef.value
    if (!el) return

    const attempt = () => {
      if (step.value !== current) return
      if (focusField(el)) return
      retryTimer = window.setTimeout(() => {
        retryTimer = null
        if (step.value === current) focusField(el)
      }, 200)
    }

    nextTick(() => {
      requestAnimationFrame(attempt)
    })
  }

  watch([bootstrapped, step], ([ready]) => {
    if (!ready) return
    focusForCurrentStep()
  }, { flush: 'post' })

  onMounted(() => {
    prepareTelegramViewport()
  })

  onBeforeUnmount(() => {
    clearRetry()
  })

  return {
    focusForCurrentStep,
  }
}
