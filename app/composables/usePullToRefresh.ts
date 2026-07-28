/**
 * Sahifa pull-to-refresh handlerini ro'yxatdan o'tkazadi.
 * Layoutdagi BasePullToRefresh shu callbackni chaqiradi.
 */
type RefreshFn = () => void | Promise<void>

const currentHandler = shallowRef<RefreshFn | null>(null)

export function usePullToRefresh(handler: RefreshFn) {
  onMounted(() => {
    currentHandler.value = handler
  })
  onActivated(() => {
    currentHandler.value = handler
  })
  onBeforeUnmount(() => {
    if (currentHandler.value === handler) currentHandler.value = null
  })
  onDeactivated(() => {
    if (currentHandler.value === handler) currentHandler.value = null
  })
}

export async function runPullToRefresh() {
  const fn = currentHandler.value
  if (fn) {
    await fn()
    return
  }
  // Default: joriy route ma'lumotlarini yangilash
  try {
    await refreshNuxtData()
  } catch {
    /* */
  }
}
