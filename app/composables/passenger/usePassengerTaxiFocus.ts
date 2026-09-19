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

function focusWithKeyboard(el: Focusable | null): boolean {
  if (!el || el.disabled) return false

  prepareTelegramViewport()

  try {
    el.readOnly = true
    el.focus({ preventScroll: true })
    window.setTimeout(() => {
      el.readOnly = false
      el.focus({ preventScroll: true })
      try {
        const len = el.value.length
        el.setSelectionRange(len, len)
      } catch {
        /* */
      }
    }, 40)
  } catch {
    try {
      el.focus({ preventScroll: true })
    } catch {
      el.focus()
    }
  }

  return document.activeElement === el
}

/** Taxi chaqirish — textarea / telefon maydoniga fokus (Telegram Mini App) */
export function usePassengerTaxiFocus(opts: {
  step: Ref<string>
  bootstrapped: Ref<boolean>
  routeTextareaRef: Ref<HTMLTextAreaElement | null>
  phoneInputRef: Ref<HTMLInputElement | null>
}) {
  const { step, bootstrapped, routeTextareaRef, phoneInputRef } = opts
  let timers: ReturnType<typeof setTimeout>[] = []

  function clearTimers() {
    for (const id of timers) clearTimeout(id)
    timers = []
  }

  function scheduleFocus(target: 'route' | 'phone') {
    clearTimers()
    const delays = [0, 80, 200, 450, 800, 1300]

    const attempt = () => {
      if (target === 'route' && step.value !== 'route') return
      if (target === 'phone' && step.value !== 'phone') return
      const el =
        target === 'route' ? routeTextareaRef.value : phoneInputRef.value
      focusWithKeyboard(el)
    }

    nextTick(() => {
      requestAnimationFrame(attempt)
    })

    for (const delay of delays) {
      timers.push(window.setTimeout(attempt, delay))
    }
  }

  function scheduleRouteFocus() {
    if (!bootstrapped.value || step.value !== 'route') return
    scheduleFocus('route')
  }

  function schedulePhoneFocus() {
    if (!bootstrapped.value || step.value !== 'phone') return
    scheduleFocus('phone')
  }

  watch(
    () => routeTextareaRef.value,
    (el) => {
      if (el && bootstrapped.value && step.value === 'route') {
        scheduleRouteFocus()
      }
    },
  )

  watch(
    () => phoneInputRef.value,
    (el) => {
      if (el && bootstrapped.value && step.value === 'phone') {
        schedulePhoneFocus()
      }
    },
  )

  watch(
    [bootstrapped, step],
    ([ready, current]) => {
      if (!ready) return
      if (current === 'route') scheduleRouteFocus()
      if (current === 'phone') schedulePhoneFocus()
    },
    { flush: 'post' },
  )

  onMounted(() => {
    prepareTelegramViewport()
    window.addEventListener('zt:passenger-taxi-focus-route', scheduleRouteFocus)
    if (bootstrapped.value && step.value === 'route') {
      scheduleRouteFocus()
    }
  })

  onBeforeUnmount(() => {
    clearTimers()
    window.removeEventListener('zt:passenger-taxi-focus-route', scheduleRouteFocus)
  })

  return {
    scheduleRouteFocus,
    schedulePhoneFocus,
  }
}
