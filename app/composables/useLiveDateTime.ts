import { formatLiveDateTimeLabel } from '~/utils/liveDateTime'

function resolveGreeting(date: Date): string {
  const h = date.getHours()
  if (h < 6) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

/** Dashboard salomlashish ostidagi jonli sana/vaqt */
export function useLiveDateTime(updateMs = 1000) {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined

  const label = computed(() => formatLiveDateTimeLabel(now.value))
  const greeting = computed(() => resolveGreeting(now.value))
  const isNight = computed(() => /tun|kech/i.test(greeting.value))

  const tick = () => {
    now.value = new Date()
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, updateMs)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { label, greeting, isNight, now }
}
