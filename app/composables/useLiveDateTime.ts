import { formatLiveDateTimeLabel } from '~/utils/liveDateTime'
import { isFlutterWebView } from '~/utils/appEmbed'

function resolveGreeting(date: Date): string {
  const h = date.getHours()
  if (h < 6) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

/** Dashboard salomlashish ostidagi jonli sana/vaqt */
export function useLiveDateTime(updateMs?: number) {
  const intervalMs =
    updateMs ??
    (import.meta.client && isFlutterWebView() ? 30_000 : 1000)
  const now = useState('live-date-time', () => new Date())

  const liveDateTimeLabel = computed(() => formatLiveDateTimeLabel(now.value))
  const greeting = computed(() => resolveGreeting(now.value))
  const isNight = computed(() => /tun|kech/i.test(greeting.value))

  let timer: ReturnType<typeof setInterval> | undefined

  const tick = () => {
    now.value = new Date()
  }

  if (import.meta.client) {
    onMounted(() => {
      tick()
      timer = setInterval(tick, intervalMs)
    })
    onUnmounted(() => {
      if (timer) clearInterval(timer)
    })
  }

  return { label: liveDateTimeLabel, liveDateTimeLabel, greeting, isNight, now }
}
