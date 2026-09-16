type ByteStats = {
  totalBytes: number
  usedBytes: number
  freeBytes: number
  usedPercent: number
  totalGb: number
  usedGb: number
  freeGb: number
}

export interface ServerResourceStats {
  memory: ByteStats
  cpu: {
    cores: number
    model: string
    usedPercent: number
  }
  disk: ByteStats
  hostname: string
  platform: string
  updatedAt: string
}

/** Admin dashboard — server RAM/CPU/Disk (har 3s yangilanadi) */
export function useServerResources(pollMs = 3000) {
  const stats = ref<ServerResourceStats | null>(null)
  const loading = ref(false)
  const maintaining = ref(false)
  const maintenanceMessage = ref('')
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

  const runMaintenance = async () => {
    if (maintaining.value) return null
    maintaining.value = true
    maintenanceMessage.value = ''
    error.value = ''
    try {
      const res = await useApi('/admin/server-maintenance', { method: 'POST' })
      if (res?.success) {
        maintenanceMessage.value =
          String(res.data?.message || 'Keshlar tozalandi.')
        setTimeout(() => void fetchResources(), 3000)
        return res
      }
      error.value = String(res?.message || 'Server bo\'shatilmadi')
      return res
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err?.response?.data?.message || 'Server bo\'shatilmadi'
      throw e
    } finally {
      maintaining.value = false
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    stats,
    loading,
    maintaining,
    maintenanceMessage,
    error,
    refresh: fetchResources,
    runMaintenance,
  }
}
