<template>
  <footer
    class="shrink-0 z-30 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
    :style="{ paddingBottom: 'var(--zt-safe-bottom, 0px)' }"
  >
    <form
      class="mx-auto w-full max-w-2xl px-3 py-2.5"
      autocomplete="off"
      novalidate
      @submit.prevent="send"
    >
      <!-- Recording holati -->
      <div v-if="recording" class="flex items-center gap-3">
        <button
          type="button"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-red-500 text-white active:scale-95 transition-all"
          aria-label="Bekor"
          @click="cancelRecording"
        >
          <font-awesome-icon icon="fa-solid fa-times" />
        </button>

        <div class="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span class="flex items-end gap-0.5 h-5">
            <span
              v-for="n in 18"
              :key="n"
              class="w-0.5 rounded-full bg-red-500 animate-pulse"
              :style="{ height: `${bars[n % bars.length]}px`, animationDelay: `${(n % 6) * 80}ms` }"
            />
          </span>
          <span class="ml-auto text-[12px] font-bold tabular-nums text-slate-500 dark:text-slate-400">{{ formattedTime }}</span>
        </div>

        <button
          type="button"
          :disabled="seconds < 1"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-sky-500 text-white active:scale-95 transition-all disabled:opacity-40"
          aria-label="Yuborish"
          @click="stopAndSend"
        >
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
        </button>
      </div>

      <!-- Oddiy holat -->
      <div v-else class="relative">
        <div
          v-if="showSlashMenu"
          class="absolute bottom-full left-0 right-0 mb-1.5 z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden max-h-[min(52vh,280px)]"
        >
          <p class="px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Admin komandalar
          </p>
          <ul class="overflow-y-auto max-h-[min(48vh,248px)]">
            <li
              v-for="(item, idx) in filteredSlashCommands"
              :key="`${item.cmd}-${idx}`"
            >
              <button
                type="button"
                class="w-full px-3 py-2.5 flex items-start gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                :class="idx === slashHighlight ? 'bg-sky-50 dark:bg-sky-950/40' : ''"
                @click="pickSlashCommand(item.cmd)"
              >
                <span class="shrink-0 text-[12px] font-black font-mono text-sky-600 dark:text-sky-400">
                  {{ item.cmd }}
                </span>
                <span class="min-w-0 text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-snug">
                  {{ item.label }}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="disabled"
          class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Rasm biriktirish"
          @click="pickImage"
        >
          <font-awesome-icon icon="fa-solid fa-paperclip" />
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          tabindex="-1"
          @change="onFileChange"
        >

        <input
          v-model="text"
          type="search"
          name="zortaksi-chat-message"
          inputmode="text"
          enterkeyhint="send"
          autocomplete="off"
          autocorrect="on"
          autocapitalize="sentences"
          spellcheck="true"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          data-bwignore="true"
          :readonly="draftLocked"
          :disabled="disabled"
          :placeholder="inputPlaceholder"
          class="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none [&::-webkit-search-cancel-button]:hidden"
          @touchstart.passive="unlockDraft"
          @mousedown="unlockDraft"
          @keydown.enter.prevent="onEnter"
          @keydown.down.prevent="onSlashDown"
          @keydown.up.prevent="onSlashUp"
          @focus="unlockDraft"
        >

        <button
          v-if="text.trim()"
          type="submit"
          :disabled="disabled"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-sky-500 text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Yuborish"
        >
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
        </button>
        <button
          v-else
          type="button"
          :disabled="disabled"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-sky-500 text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Ovozli xabar"
          @click="startRecording"
        >
          <font-awesome-icon icon="fa-solid fa-microphone" />
        </button>
        </div>
      </div>

      <p v-if="micError" class="mt-1.5 px-1 text-[11px] font-bold text-red-500">{{ micError }}</p>
    </form>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import type { AdminSlashCommandItem } from '~/types/adminCommands'
import { CHAT_PHOTO_MAX_INPUT, isChatPhotoFile, prepareChatPhoto } from '~/utils/prepareChatPhoto'
import {
  buildVoiceRecorderOptions,
  canRecordVoice,
  getVoiceAudioConstraints,
  normalizeVoiceBlob,
  pickVoiceMimeType,
} from '~/utils/voiceRecording'

const text = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
    slashCommands?: AdminSlashCommandItem[]
  }>(),
  { disabled: false, placeholder: '', slashCommands: () => [] },
)

const emit = defineEmits<{
  send: [text: string]
  voice: [blob: Blob, duration: number]
  photo: [file: File]
  attach: []
}>()

const inputPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  if (props.disabled) return 'Ulanish kutilmoqda...'
  return 'Xabar yozing...'
})

const fileInput = ref<HTMLInputElement | null>(null)
/** Autofill (password/card/address) panelini kamaytirish — fokusdan oldin readonly */
const draftLocked = ref(true)
const slashHighlight = ref(0)

const filteredSlashCommands = computed(() => {
  const list = props.slashCommands ?? []
  if (!list.length) return []
  const raw = text.value
  if (!raw.startsWith('/')) return []
  const q = raw.trim().toLowerCase()
  if (q === '/') return list.slice(0, 16)
  return list
    .filter((item) => item.cmd.toLowerCase().startsWith(q))
    .slice(0, 16)
})

const showSlashMenu = computed(
  () => !props.disabled && filteredSlashCommands.value.length > 0,
)

watch(filteredSlashCommands, (list) => {
  if (!list.length) slashHighlight.value = 0
  else if (slashHighlight.value >= list.length) slashHighlight.value = 0
})

const pickSlashCommand = (cmd: string) => {
  text.value = cmd
  slashHighlight.value = 0
  unlockDraft()
}

const onSlashDown = () => {
  if (!showSlashMenu.value) return
  const max = filteredSlashCommands.value.length
  slashHighlight.value = (slashHighlight.value + 1) % max
}

const onSlashUp = () => {
  if (!showSlashMenu.value) return
  const max = filteredSlashCommands.value.length
  slashHighlight.value = (slashHighlight.value - 1 + max) % max
}

const onEnter = () => {
  if (showSlashMenu.value && filteredSlashCommands.value[slashHighlight.value]) {
    pickSlashCommand(filteredSlashCommands.value[slashHighlight.value].cmd)
    return
  }
  send()
}

const unlockDraft = () => {
  draftLocked.value = false
}

const pickImage = () => {
  if (props.disabled) return
  fileInput.value?.click()
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !isChatPhotoFile(file)) return
  if (file.size > CHAT_PHOTO_MAX_INPUT) {
    micError.value = 'Rasm 20 MB dan katta bo\'lmasligi kerak'
    return
  }
  micError.value = ''
  try {
    const prepared = await prepareChatPhoto(file)
    emit('photo', prepared)
  } catch (err: any) {
    micError.value = err?.message || 'Rasmni tayyorlab bo\'lmadi'
  }
}

const send = () => {
  if (props.disabled) return
  const value = text.value.trim()
  if (!value) return
  emit('send', value)
  text.value = ''
}

const recording = ref(false)
const seconds = ref(0)
const micError = ref('')
const bars = [6, 12, 18, 10, 14, 8, 16, 11]
let timer: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let mediaStream: MediaStream | null = null
let chunks: BlobPart[] = []
let mimeType = ''

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const stopTracks = () => {
  mediaStream?.getTracks().forEach((t) => t.stop())
  mediaStream = null
  mediaRecorder = null
  chunks = []
}

const waitForRecorderStop = (recorder: MediaRecorder): Promise<void> =>
  new Promise((resolve) => {
    if (recorder.state === 'inactive') {
      resolve()
      return
    }
    recorder.addEventListener('stop', () => resolve(), { once: true })
  })

const startRecording = async () => {
  if (props.disabled) return
  micError.value = ''
  if (!canRecordVoice()) {
    micError.value = 'Bu brauzer ovoz yozishni qo\'llab-quvvatlamaydi'
    return
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(getVoiceAudioConstraints())
    // Avvalo OGG; bo'lmasa webm — server baribir OGG ga o'tkazadi
    mimeType = pickVoiceMimeType()
    chunks = []
    const opts = buildVoiceRecorderOptions(mimeType)
    mediaRecorder = mimeType
      ? new MediaRecorder(mediaStream, opts)
      : new MediaRecorder(mediaStream)
    if (!mimeType && mediaRecorder.mimeType) mimeType = mediaRecorder.mimeType

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    // Timeslicesiz — stop paytida bitta to'liq chunk
    mediaRecorder.start()
    recording.value = true
    seconds.value = 0
    timer = setInterval(() => (seconds.value += 1), 1000)
  } catch (err: any) {
    stopTracks()
    micError.value = err?.name === 'NotAllowedError'
      ? 'Mikrofon ruxsati berilmadi'
      : 'Mikrofonni yoqib bo\'lmadi'
  }
}

const cancelRecording = () => {
  clearTimer()
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.ondataavailable = null
    mediaRecorder.onstop = null
    try { mediaRecorder.stop() } catch { /* */ }
  }
  stopTracks()
  recording.value = false
  seconds.value = 0
}

const stopAndSend = async () => {
  const dur = seconds.value
  clearTimer()
  const recorder = mediaRecorder
  if (!recorder || recorder.state === 'inactive') {
    cancelRecording()
    return
  }

  try {
    const stopped = waitForRecorderStop(recorder)
    recorder.stop()
    await stopped
    await new Promise<void>((r) => requestAnimationFrame(() => r()))
  } catch {
    cancelRecording()
    return
  }

  const raw = new Blob(chunks, { type: mimeType || recorder.mimeType || 'audio/ogg' })
  const blob = normalizeVoiceBlob(raw, mimeType || recorder.mimeType || 'audio/ogg')
  stopTracks()
  recording.value = false
  seconds.value = 0
  if (dur >= 1 && blob.size > 0) emit('voice', blob, dur)
}

onBeforeUnmount(() => {
  clearTimer()
  cancelRecording()
})
</script>
