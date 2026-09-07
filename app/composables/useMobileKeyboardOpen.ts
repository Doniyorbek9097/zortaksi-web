/**
 * Mobil klaviatura ochilganini visualViewport orqali aniqlash.
 */
export function useMobileKeyboardOpen() {
  const keyboardOpen = ref(false)
  let baseline = 0

  const measure = () => {
    if (!import.meta.client) return
    const vv = window.visualViewport
    const h = vv?.height ?? window.innerHeight
    if (!baseline || h > baseline - 48) {
      baseline = h
    }
    keyboardOpen.value = baseline - h > 96
  }

  const resetBaseline = () => {
    baseline = 0
    measure()
  }

  const scheduleMeasure = () => {
    measure()
    requestAnimationFrame(measure)
    setTimeout(measure, 120)
    setTimeout(measure, 320)
  }

  let cleanup: (() => void) | null = null

  onMounted(() => {
    measure()
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', measure)
      vv.addEventListener('scroll', measure)
    }
    window.addEventListener('orientationchange', resetBaseline)
    cleanup = () => {
      vv?.removeEventListener('resize', measure)
      vv?.removeEventListener('scroll', measure)
      window.removeEventListener('orientationchange', resetBaseline)
    }
  })

  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = null
  })

  return { keyboardOpen, scheduleMeasure, measure }
}
