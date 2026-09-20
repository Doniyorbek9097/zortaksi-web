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

/** iOS / Telegram WebView klaviaturasini uyg'otish */
function primeMobileKeyboard() {
  if (!import.meta.client) return
  try {
    const probe = document.createElement('input')
    probe.type = 'text'
    probe.setAttribute('inputmode', 'text')
    probe.setAttribute('autocomplete', 'off')
    probe.setAttribute('aria-hidden', 'true')
    probe.tabIndex = -1
    Object.assign(probe.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '1px',
      height: '1px',
      opacity: '0',
      border: 'none',
      padding: '0',
      margin: '0',
      pointerEvents: 'none',
    })
    document.body.appendChild(probe)
    probe.focus()
    probe.blur()
    probe.remove()
  } catch {
    /* */
  }
}

function focusWithKeyboard(el: Focusable | null, unlock?: () => void): boolean {
  if (!el || el.disabled) return false

  prepareTelegramViewport()
  unlock?.()

  try {
    el.readOnly = false
  } catch {
    /* */
  }

  primeMobileKeyboard()

  const focusOnce = () => {
    try {
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
    } catch {
      /* */
    }
    try {
      el.focus({ preventScroll: true })
    } catch {
      try {
        el.focus()
      } catch {
        /* */
      }
    }
    try {
      const len = el.value.length
      el.setSelectionRange(len, len)
    } catch {
      /* */
    }
  }

  focusOnce()
  return document.activeElement === el
}

/** Taxi chaqirish — textarea / telefon maydoniga fokus (Telegram Mini App) */
export function usePassengerTaxiFocus(opts: {
  step: Ref<string>
  bootstrapped: Ref<boolean>
  routeTextareaRef: Ref<HTMLTextAreaElement | null>
  phoneInputRef: Ref<HTMLInputElement | null>
  unlockFields: () => void
}) {
  const { step, bootstrapped, routeTextareaRef, phoneInputRef, unlockFields } = opts
  let timers: ReturnType<typeof setTimeout>[] = []

  function clearTimers() {
    for (const id of timers) clearTimeout(id)
    timers = []
  }

  function scheduleFocus(target: 'route' | 'phone') {
    clearTimers()
    const delays = [0, 50, 120, 250, 450, 700, 1000, 1500]

    const attempt = () => {
      if (target === 'route' && step.value !== 'route') return
      if (target === 'phone' && step.value !== 'phone') return
      const el =
        target === 'route' ? routeTextareaRef.value : phoneInputRef.value
      focusWithKeyboard(el, unlockFields)
    }

    nextTick(() => {
      requestAnimationFrame(() => {
        attempt()
      })
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
    { flush: 'post', immediate: true },
  )

  onMounted(() => {
    prepareTelegramViewport()
    window.addEventListener('zt:passenger-taxi-focus-route', scheduleRouteFocus)
    window.addEventListener('zt:passenger-taxi-focus-phone', schedulePhoneFocus)
    if (bootstrapped.value) {
      if (step.value === 'route') scheduleRouteFocus()
      if (step.value === 'phone') schedulePhoneFocus()
    }
  })

  onBeforeUnmount(() => {
    clearTimers()
    window.removeEventListener('zt:passenger-taxi-focus-route', scheduleRouteFocus)
    window.removeEventListener('zt:passenger-taxi-focus-phone', schedulePhoneFocus)
  })

  return {
    scheduleRouteFocus,
    schedulePhoneFocus,
  }
}
