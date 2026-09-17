<template>
  <div class="flex items-center gap-2.5 min-w-[200px] py-1">
    <button
      type="button"
      class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-sky-500/15 text-sky-500 active:scale-95 transition-all disabled:opacity-50"
      :aria-label="playing ? 'To\'xtatish' : 'Tinglash'"
      :disabled="loading"
      data-no-swipe
      @click.stop="toggle"
    >
      <font-awesome-icon
        v-if="loading"
        icon="fa-solid fa-spinner"
        class="animate-spin text-sm"
      />
      <font-awesome-icon
        v-else
        :icon="playing ? 'fa-solid fa-pause' : 'fa-solid fa-play'"
        class="text-sm"
      />
    </button>

    <div class="flex-1 min-w-0">
      <div
        class="h-1 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 cursor-pointer"
        @click.stop="seek"
      >
        <div
          class="h-full rounded-full bg-sky-500 transition-[width] duration-100"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-1 text-[10px] font-bold text-slate-400 tabular-nums">
        {{ timeLabel }}
      </p>
    </div>

    <audio
      ref="audioEl"
      class="hidden"
      preload="none"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @pause="playing = false"
      @play="playing = true"
    />
  </div>
</template>

<script setup lang="ts">
import { buildApiUrl } from '~/utils/buildApiUrl'
import { resolveAuthToken } from '~/utils/activeAccount'
import { getAuthCookieOptions } from '~/utils/authCookie'

const props = defineProps<{
  orderId: string
}>()

const config = useRuntimeConfig()
const cookie = useCookie('auth_token', { ...getAuthCookieOptions() })

const audioEl = ref<HTMLAudioElement | null>(null)
const loading = ref(false)
const playing = ref(false)
const current = ref(0)
const total = ref(0)
const src = ref('')

const progress = computed(() => {
  if (!total.value) return 0
  return Math.min(100, (current.value / total.value) * 100)
})

const formatSec = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

const timeLabel = computed(() => {
  if (loading.value) return 'Yuklanmoqda...'
  if (!src.value) return 'Ovozli xabar'
  return `${formatSec(current.value)} / ${formatSec(total.value || 0)}`
})

const ensureSrc = async () => {
  if (src.value) return
  const id = String(props.orderId || '').trim()
  if (!id) return

  loading.value = true
  try {
    const token = resolveAuthToken(cookie.value)
    const url = buildApiUrl(config.public.baseUrl, `/orders/${id}/voice`)
    const res = await fetch(url, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Ovoz yuklanmadi')
    const blob = await res.blob()
    if (!blob.size) throw new Error('Bo\'sh fayl')
    src.value = URL.createObjectURL(blob)
    if (audioEl.value) {
      audioEl.value.src = src.value
    }
  } finally {
    loading.value = false
  }
}

const toggle = async () => {
  if (loading.value) return
  await ensureSrc()
  const a = audioEl.value
  if (!a) return
  if (playing.value) {
    a.pause()
    return
  }
  try {
    await a.play()
  } catch {
    /* ignore */
  }
}

const seek = async (e: MouseEvent) => {
  await ensureSrc()
  const a = audioEl.value
  if (!a || !total.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  a.currentTime = ratio * total.value
}

const onTimeUpdate = () => {
  if (audioEl.value) current.value = audioEl.value.currentTime
}

const onLoadedMetadata = () => {
  if (audioEl.value && Number.isFinite(audioEl.value.duration)) {
    total.value = audioEl.value.duration
  }
}

const onEnded = () => {
  playing.value = false
  current.value = 0
}

onBeforeUnmount(() => {
  if (src.value.startsWith('blob:')) {
    URL.revokeObjectURL(src.value)
  }
})
</script>
