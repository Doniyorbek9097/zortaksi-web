<template>
  <footer class="shrink-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
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
      <div v-else class="flex items-center gap-2">
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
          :placeholder="disabled ? 'Yozish uchun ulanish kutilmoqda...' : 'Xabar yozing...'"
          class="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none [&::-webkit-search-cancel-button]:hidden"
          @touchstart.passive="unlockDraft"
          @mousedown="unlockDraft"
          @keydown.enter.prevent="send"
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

      <p v-if="micError" class="mt-1.5 px-1 text-[11px] font-bold text-red-500">{{ micError }}</p>
    </form>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { CHAT_PHOTO_MAX_INPUT, isChatPhotoFile, prepareChatPhoto } from '~/utils/prepareChatPhoto'

const text = defineModel<string>({ default: '' })

const props = defineProps<{ disabled?: boolean }>()

const emit = defineEmits<{
  send: [text: string]
  voice: [blob: Blob, duration: number]
  photo: [file: File]
  attach: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
/** Autofill (password/card/address) panelini kamaytirish — fokusdan oldin readonly */
const draftLocked = ref(true)

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
let mimeType = 'audio/webm'

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60)
  const s = seconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return ''
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) return 'audio/ogg;codecs=opus'
  return ''
}

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

/** requestData() dan keyin dataavailable kelishini kutadi (asosiy handler chunk qo'shadi). */
const flushRecorderData = (recorder: MediaRecorder): Promise<void> =>
  new Promise((resolve) => {
    if (recorder.state !== 'recording') {
      resolve()
      return
    }
    const finish = () => {
      recorder.removeEventListener('dataavailable', onData)
      resolve()
    }
    const onData = () => finish()
    recorder.addEventListener('dataavailable', onData)
    try {
      recorder.requestData()
    } catch {
      finish()
    }
  })

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
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mimeType = pickMime() || 'audio/webm'
    chunks = []
    mediaRecorder = mimeType
      ? new MediaRecorder(mediaStream, { mimeType })
      : new MediaRecorder(mediaStream)

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.start(250)
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
    await flushRecorderData(recorder)
    const stopped = waitForRecorderStop(recorder)
    recorder.stop()
    await stopped
    // Ba'zi brauzerlarda oxirgi chunk stop'dan keyin keladi
    await new Promise<void>((r) => queueMicrotask(r))
  } catch {
    cancelRecording()
    return
  }

  const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
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
