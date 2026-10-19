import type { Ref } from 'vue'

export function useTariffCountdown(input: {
  expireAt: Ref<string | Date | null | undefined>
  startedAt: Ref<string | Date | null | undefined>
  expireDays: Ref<number>
  nowMs: Ref<number>
}) {
  const expireMs = computed(() => {
    const raw = input.expireAt.value
    if (!raw) return null
    const t = new Date(raw).getTime()
    return Number.isNaN(t) ? null : t
  })

  const startMs = computed(() => {
    const raw = input.startedAt.value
    if (!raw) return null
    const t = new Date(raw).getTime()
    return Number.isNaN(t) ? null : t
  })

  const hasDeadline = computed(() => expireMs.value != null)

  const remainingMs = computed(() => {
    if (expireMs.value == null) return 0
    return Math.max(0, expireMs.value - input.nowMs.value)
  })

  const pad2 = (n: number) => String(n).padStart(2, '0')

  const units = computed(() => {
    const ms = remainingMs.value
    const totalSec = Math.floor(ms / 1000)
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec % 86400) / 3600)
    const minutes = Math.floor((totalSec % 3600) / 60)
    const seconds = totalSec % 60
    return [
      { key: 'd', value: pad2(days), label: 'Kun' },
      { key: 'h', value: pad2(hours), label: 'Soat' },
      { key: 'm', value: pad2(minutes), label: 'Daq' },
      { key: 's', value: pad2(seconds), label: 'Sek' },
    ]
  })

  const remainingLabel = computed(() => {
    const ms = remainingMs.value
    if (ms <= 0) return 'Muddati tugadi'
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    if (days > 0) return `${days} kun qoldi`
    if (hours > 0) return `${hours} soat qoldi`
    const minutes = Math.floor((ms % 3600000) / 60000)
    if (minutes > 0) return `${minutes} daqiqa qoldi`
    return '1 daqiqadan kam'
  })

  const progressPct = computed(() => {
    const end = expireMs.value
    if (end == null) return 0
    const start =
      startMs.value ?? end - Math.max(1, input.expireDays.value) * 86400000
    const total = Math.max(1, end - start)
    const left = Math.max(0, end - input.nowMs.value)
    return Math.min(100, Math.max(0, (left / total) * 100))
  })

  return { hasDeadline, remainingMs, units, remainingLabel, progressPct }
}

export function useLiveNowMs() {
  const nowMs = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    if (!import.meta.client) return
    timer = setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return nowMs
}
