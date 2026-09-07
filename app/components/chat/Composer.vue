<template>
  <footer
    class="shrink-0 z-30 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
    :style="{ paddingBottom: 'var(--zt-safe-bottom, 0px)' }"
  >
    <Transition name="chat-call-bar">
      <a
        v-if="callHref && showCallBar"
        :href="callHref"
        class="chat-call-bar"
      >
        <span class="chat-call-bar__icon" aria-hidden="true">
          <font-awesome-icon icon="fa-solid fa-phone-volume" class="text-[15px]" />
        </span>
        <span class="chat-call-bar__label">{{ callLabel }}</span>
        <span class="chat-call-bar__action" aria-hidden="true">
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-[12px]" />
        </span>
      </a>
    </Transition>

    <form
      class="mx-auto w-full min-w-0 max-w-2xl px-3"
      :class="callHref && showCallBar ? 'pb-2.5 pt-0' : 'py-2.5'"
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
              v-for="n in VOICE_WAVE_BARS"
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
          <ul v-if="filteredSlashCommands.length" class="overflow-y-auto max-h-[min(48vh,248px)]">
            <li
              v-for="(item, idx) in filteredSlashCommands"
              :key="`${item.cmd}-${idx}`"
            >
              <button
                type="button"
                class="w-full px-3 py-2.5 flex items-start gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                :class="idx === slashHighlight ? 'bg-sky-50 dark:bg-sky-950/40' : ''"
                @click="sendSlashCommand(item.cmd)"
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
          <p
            v-else
            class="px-3 py-3 text-[12px] font-bold text-slate-400 text-center"
          >
            Komanda topilmadi
          </p>
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

        <div
          class="flex-1 flex items-center min-w-0 rounded-full bg-slate-100 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-sky-500/30 transition-all"
          :class="disabled ? 'opacity-60' : ''"
        >
          <button
            v-if="hasSlashCommands"
            type="button"
            :disabled="disabled"
            class="shrink-0 w-9 h-9 ml-1 rounded-full flex items-center justify-center text-[15px] font-black transition-all active:scale-95 disabled:opacity-40 shadow-sm"
            :class="slashMenuOpen
              ? 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sky-500/30 ring-2 ring-sky-400/40'
              : 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 border border-slate-200/80 dark:border-slate-600 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-slate-600'"
            aria-label="Admin komandalar"
            :aria-expanded="slashMenuOpen"
            @click="toggleSlashMenu"
          >
            /
          </button>

          <input
            ref="textInput"
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
            class="flex-1 min-w-0 py-2.5 pr-3 pl-1 bg-transparent text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed appearance-none [&::-webkit-search-cancel-button]:hidden"
            :class="hasSlashCommands ? 'pl-0.5' : 'pl-4'"
            @touchstart.passive="unlockDraft"
            @mousedown="unlockDraft"
            @keydown.enter.prevent="onEnter"
            @keydown.down.prevent="onSlashDown"
            @keydown.up.prevent="onSlashUp"
            @keydown.esc.prevent="closeSlashMenu"
            @input="onTextInput"
            @focus="onInputFocus"
            @blur="onInputBlur"
          >
        </div>

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
import { VOICE_WAVE_BARS } from '~/utils/memoryBudget'
import { useMobileKeyboardOpen } from '~/composables/useMobileKeyboardOpen'

const text = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
    slashCommands?: AdminSlashCommandItem[]
    callHref?: string
    callLabel?: string
  }>(),
  {
    disabled: false,
    placeholder: '',
    slashCommands: () => [],
    callHref: '',
    callLabel: "Qo'ng'iroq qiling",
  },
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
const textInput = ref<HTMLInputElement | null>(null)
/** Autofill (password/card/address) panelini kamaytirish — fokusdan oldin readonly */
const draftLocked = ref(true)
const { keyboardOpen, scheduleMeasure } = useMobileKeyboardOpen()
const showCallBar = computed(() => Boolean(props.callHref) && !keyboardOpen.value)
const slashMenuOpen = ref(false)
const slashHighlight = ref(0)

const hasSlashCommands = computed(() => (props.slashCommands?.length ?? 0) > 0)

const filteredSlashCommands = computed(() => {
  const list = props.slashCommands ?? []
  if (!list.length || !slashMenuOpen.value) return []

  const raw = text.value
  const q = raw.trim().toLowerCase()

  if (!q || q === '/') return list.slice(0, 20)

  if (q.startsWith('/')) {
    return list.filter((item) => item.cmd.toLowerCase().startsWith(q)).slice(0, 20)
  }

  return list
    .filter(
      (item) =>
        item.cmd.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q),
    )
    .slice(0, 20)
})

const showSlashMenu = computed(
  () =>
    !props.disabled &&
    hasSlashCommands.value &&
    slashMenuOpen.value &&
    text.value.startsWith('/'),
)

watch(filteredSlashCommands, (list) => {
  if (!list.length) slashHighlight.value = 0
  else if (slashHighlight.value >= list.length) slashHighlight.value = 0
})

const closeSlashMenu = () => {
  slashMenuOpen.value = false
  slashHighlight.value = 0
}

const toggleSlashMenu = () => {
  if (props.disabled || !hasSlashCommands.value) return
  unlockDraft()
  if (slashMenuOpen.value && text.value === '/') {
    closeSlashMenu()
    text.value = ''
    return
  }
  if (!text.value.startsWith('/')) {
    text.value = '/' + text.value.replace(/^\/+/, '')
  }
  slashMenuOpen.value = true
  slashHighlight.value = 0
  nextTick(() => textInput.value?.focus())
}

const onTextInput = () => {
  if (!hasSlashCommands.value) return
  if (text.value.startsWith('/')) {
    slashMenuOpen.value = true
  } else {
    closeSlashMenu()
  }
}

const sendSlashCommand = (cmd: string) => {
  if (props.disabled) return
  const value = String(cmd || '').trim()
  if (!value) return
  closeSlashMenu()
  text.value = ''
  emit('send', value)
}

const onSlashDown = () => {
  if (!showSlashMenu.value) return
  const max = filteredSlashCommands.value.length
  if (!max) return
  slashHighlight.value = (slashHighlight.value + 1) % max
}

const onSlashUp = () => {
  if (!showSlashMenu.value) return
  const max = filteredSlashCommands.value.length
  if (!max) return
  slashHighlight.value = (slashHighlight.value - 1 + max) % max
}

const onEnter = () => {
  if (showSlashMenu.value && filteredSlashCommands.value[slashHighlight.value]) {
    sendSlashCommand(filteredSlashCommands.value[slashHighlight.value].cmd)
    return
  }
  send()
}

const unlockDraft = () => {
  draftLocked.value = false
}

const onInputFocus = () => {
  unlockDraft()
  scheduleMeasure()
}

const onInputBlur = () => {
  scheduleMeasure()
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
  closeSlashMenu()
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

<style scoped>
.chat-call-bar {
  display: flex;
  width: 100%;
  height: 60px;
  margin-top: -2px;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 0;
  text-decoration: none;
  color: #047857;
  background: linear-gradient(90deg, #ecfdf5 0%, #d1fae5 45%, #ecfdf5 100%);
  background-size: 200% 100%;
  animation: chat-call-bar-shimmer 3.5s ease-in-out infinite;
  box-shadow: inset 0 -1px 0 rgba(16, 185, 129, 0.12);
}

.dark .chat-call-bar {
  color: #6ee7b7;
  background: linear-gradient(90deg, rgba(6, 78, 59, 0.55) 0%, rgba(4, 120, 87, 0.4) 45%, rgba(6, 78, 59, 0.55) 100%);
  background-size: 200% 100%;
  box-shadow: inset 0 -1px 0 rgba(52, 211, 153, 0.15);
}

.chat-call-bar:active {
  filter: brightness(0.96);
}

.chat-call-bar__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(145deg, #34d399, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  animation: chat-call-bar-pulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

.chat-call-bar__label {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.chat-call-bar__action {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #059669;
  background: rgba(255, 255, 255, 0.75);
  flex-shrink: 0;
  animation: chat-call-bar-nudge 2.2s ease-in-out infinite;
}

.dark .chat-call-bar__action {
  color: #6ee7b7;
  background: rgba(15, 23, 42, 0.45);
}

.chat-call-bar-enter-active,
.chat-call-bar-leave-active {
  transition: max-height 0.28s ease, opacity 0.24s ease, transform 0.28s ease;
  overflow: hidden;
}

.chat-call-bar-enter-from,
.chat-call-bar-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(8px);
}

.chat-call-bar-enter-to,
.chat-call-bar-leave-from {
  max-height: 60px;
  opacity: 1;
  transform: translateY(0);
}

@keyframes chat-call-bar-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes chat-call-bar-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); }
  50% { transform: scale(1.06); box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45); }
}

@keyframes chat-call-bar-nudge {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
</style>
