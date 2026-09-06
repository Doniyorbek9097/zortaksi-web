/**
 * Mobil klaviatura ochilganda fixed layout — header/composer ko'rinishi saqlanadi.
 */
export function useVisualViewportFrame() {
  const frameTop = ref(0)
  const frameHeight = ref(0)

  let cleanup: (() => void) | null = null

  const sync = () => {
    if (!import.meta.client) return
    const vv = window.visualViewport
    if (vv) {
      frameTop.value = vv.offsetTop
      frameHeight.value = vv.height
      return
    }
    frameTop.value = 0
    frameHeight.value = window.innerHeight
  }

  onMounted(() => {
    sync()
    const vv = window.visualViewport
    if (!vv) return
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('orientationchange', sync)
    cleanup = () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('orientationchange', sync)
    }
  })

  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = null
  })

  const frameStyle = computed(() => ({
    top: `${frameTop.value}px`,
    left: '0',
    right: '0',
    width: '100%',
    height: `${frameHeight.value || (import.meta.client ? window.innerHeight : 0)}px`,
  }))

  return { frameStyle }
}
