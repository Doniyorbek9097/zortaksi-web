/** Layoutdagi PTR — route meta orqali boshqariladi */
export function usePullToRefreshRoute() {
  const route = useRoute()

  return computed(() => {
    const meta = route.meta.pullToRefresh
    if (meta === false) {
      return { disabled: true, scrollSelector: '' }
    }
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      const sel = typeof meta.scrollSelector === 'string' ? meta.scrollSelector : ''
      return { disabled: false, scrollSelector: sel }
    }
    return { disabled: false, scrollSelector: '' }
  })
}
