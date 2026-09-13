const SWIPE_REVEAL = 56
const SWIPE_THRESHOLD = 0.65

/**
 * Chapga qisqa surish — chat xabaridagi delete kabi.
 * Chegara o'tganda onTrigger chaqiriladi (tasdiq parentda).
 */
export function useSwipeToDelete(
  onTrigger: () => void,
  options?: { enabled?: () => boolean },
) {
  const translateX = ref(0)
  const dragging = ref(false)
  const startX = ref(0)
  const originX = ref(0)
  const originY = ref(0)
  const axisLocked = ref<'h' | 'v' | null>(null)
  const moved = ref(false)

  const deleteOpacity = computed(() =>
    Math.min(1, -translateX.value / SWIPE_REVEAL),
  )

  const showDeleteHint = computed(() => translateX.value < -4)

  const reset = () => {
    translateX.value = 0
    dragging.value = false
    axisLocked.value = null
    moved.value = false
  }

  const onPointerDown = (e: PointerEvent) => {
    if (options?.enabled && !options.enabled()) return
    dragging.value = true
    moved.value = false
    axisLocked.value = null
    originX.value = e.clientX
    originY.value = e.clientY
    startX.value = e.clientX - translateX.value
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.value) return
    if (options?.enabled && !options.enabled()) return
    const rawDx = e.clientX - originX.value
    const rawDy = e.clientY - originY.value
    if (!axisLocked.value) {
      if (Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return
      axisLocked.value = Math.abs(rawDx) >= Math.abs(rawDy) ? 'h' : 'v'
      if (axisLocked.value === 'v') {
        dragging.value = false
        return
      }
    }
    if (axisLocked.value !== 'h') return
    moved.value = true
    const dx = e.clientX - startX.value
    if (dx < 0) {
      translateX.value = Math.max(-SWIPE_REVEAL, dx)
    } else {
      translateX.value = 0
    }
  }

  const onPointerUp = () => {
    if (!dragging.value && axisLocked.value !== 'h') {
      axisLocked.value = null
      return
    }
    dragging.value = false
    const triggered =
      axisLocked.value === 'h' && translateX.value <= -SWIPE_REVEAL * SWIPE_THRESHOLD
    translateX.value = 0
    axisLocked.value = null
    if (triggered) onTrigger()
  }

  return {
    translateX,
    dragging,
    moved,
    deleteOpacity,
    showDeleteHint,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
