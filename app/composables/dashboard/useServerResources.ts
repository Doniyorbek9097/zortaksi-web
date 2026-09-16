export interface ServerResourceStats {
  memory: {
    totalBytes: number
    usedBytes: number
    freeBytes: number
    usedPercent: number
    totalGb: number
    usedGb: number
    freeGb: number
  }
  cpu: {
    cores: number
    model: string
    usedPercent: number
  }
  hostname: string
  platform: string
  updatedAt: string
}

/** Admin dashboard — server RAM/CPU (har 3s yangilanadi) */
export function useServerResources(pollMs = 3000) {
  const stats = ref<ServerResourceStats | null>(null)
  const loading = ref(false)
  const error = ref('')

  let timer: ReturnType<typeof setInterval> | null = null
  let inflight = false

  const fetchResources = async () => {
    if (inflight) return
    inflight = true
    try {
      if (!stats.value) loading.value = true
      const res = await useApi('/admin/server-resources', { method: 'GET' })
      if (res?.success) {
        stats.value = res.data as ServerResourceStats
        error.value = ''
      } else {
        error.value = String(res?.message || 'Resurslar yuklanmadi')
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err?.response?.data?.message || 'Resurslar yuklanmadi'
    } finally {
      loading.value = false
      inflight = false
    }
  }

  const start = () => {
    void fetchResources()
    if (timer) clearInterval(timer)
    timer = setInterval(() => void fetchResources(), pollMs)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    stats,
    loading,
    error,
    refresh: fetchResources,
  }
}
