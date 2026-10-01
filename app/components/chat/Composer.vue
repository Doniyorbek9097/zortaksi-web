<template>
  <footer
    class="shrink-0 z-30"
    :class="support ? supportComposerFooterClass : 'bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800'"
    :style="{ paddingBottom: 'var(--zt-safe-bottom, 0px)' }"
  >
    <Transition name="chat-call-bar">
      <ChatCallBar
        v-if="callHref && showCallBar"
        :href="callHref"
        :label="callLabel"
      />
    </Transition>

    <form
      class="mx-auto w-full min-w-0 max-w-2xl px-3"
      :class="callHref
        ? (showCallBar ? 'pb-2.5 pt-0' : 'pb-2.5 pt-[5px]')
        : 'py-2.5'"
      autocomplete="off"
      novalidate
      @submit.prevent="send"
    >
      <!-- Ovoz yozish -->
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
          class="absolute bottom-full left-0 right-0 mb-1.5 z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden max-h-[min(70vh,420px)]"
        >
          <p class="px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Admin komandalar
            <span v-if="slashPickerMode" class="ml-1 normal-case font-bold text-slate-300">
              ({{ filteredSlashCommands.length }})
            </span>
          </p>
          <ul v-if="filteredSlashCommands.length" class="overflow-y-auto overscroll-contain max-h-[min(66vh,380px)]">
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

        <div class="flex items-end gap-2">
        <button
          type="button"
          :disabled="disabled"
          class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :class="support
            ? 'text-violet-600/80 dark:text-violet-300/70 hover:bg-violet-500/10'
            : 'text-slate-500 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'"
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
          class="flex-1 flex items-stretch min-w-0 rounded-2xl overflow-hidden transition-all"
          :class="[
            support ? supportComposerInputClass : 'bg-slate-100 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-sky-500/30',
            disabled ? 'opacity-60' : '',
          ]"
        >
          <button
            v-if="hasSlashCommands"
            type="button"
            :disabled="disabled"
            class="shrink-0 w-[30px] self-stretch rounded-none flex items-center justify-center text-[14px] font-black leading-none transition-colors active:opacity-90 disabled:opacity-40 border-r"
            :class="slashMenuOpen
              ? 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white border-sky-500/30'
              : support
                ? 'bg-violet-200/80 dark:bg-slate-700 text-violet-800 dark:text-violet-200 border-violet-300/70 dark:border-slate-600 hover:bg-violet-300/70 dark:hover:bg-slate-600'
                : 'bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-sky-300 border-sky-200/90 dark:border-slate-600 hover:bg-sky-200/80 dark:hover:bg-slate-600'"
            aria-label="Admin komandalar"
            :aria-expanded="slashMenuOpen"
            @mousedown.prevent
            @click="toggleSlashMenu"
          >
            /
          </button>

          <CommonTelegramHtmlEditor
            ref="textInput"
            v-model="text"
            compact
            hide-hint
            :rows="1"
            :max-height-px="TEXTAREA_MAX_PX"
            :readonly="draftLocked"
            :disabled="disabled"
            :placeholder="inputPlaceholder"
            :editor-class="[
              support
                ? 'text-violet-900 dark:text-violet-50'
                : 'text-slate-900 dark:text-white',
              hasSlashCommands ? 'pl-1 pr-3' : 'pl-2 pr-3',
            ].join(' ')"
            class="flex-1 min-w-0"
            @mousedown="unlockDraft"
            @touchstart.passive="unlockDraft"
            @keydown="onComposerKeydown"
            @focus="onInputFocus"
            @blur="onInputBlur"
          />
        </div>

        <button
          v-if="hasText"
          type="submit"
          :disabled="disabled"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :class="support ? supportComposerSendClass : 'bg-sky-500 text-white'"
          aria-label="Yuborish"
        >
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
        </button>
        <button
          v-else
          type="button"
          :disabled="disabled"
          class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center active:scale-95 transition-all select-none touch-none disabled:opacity-40 disabled:cursor-not-allowed"
          :class="support ? supportComposerSendClass : 'bg-sky-500 text-white'"
          aria-label="Ovozli xabar"
          @pointerdown.prevent="onMicPress"
          @click.prevent
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
import { onBeforeUnmount, onMounted } from 'vue'
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
import { supportComposerFooterClass, supportComposerInputClass, supportComposerSendClass } from '~/utils/supportChatTheme'
import { stripTelegramHtml } from '~/utils/telegramHtml'

const text = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
    slashCommands?: AdminSlashCommandItem[]
    callHref?: string
    callLabel?: string
    support?: boolean
  }>(),
  {
    disabled: false,
    placeholder: '',
    slashCommands: () => [],
    callHref: '',
    callLabel: "Qo'ng'iroq qiling",
    support: false,
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

const TEXTAREA_MAX_PX = 128

/** v-model kechikishi bo'lmasin — birinchi belgida jo'natish tugmasi */
const hasText = ref(false)

const draftPlain = (value: string) => stripTelegramHtml(String(value || '')).trim()

const syncHasText = (value: string) => {
  hasText.value = draftPlain(value).length > 0
}

const fileInput = ref<HTMLInputElement | null>(null)
const textInput = ref<{ focus?: () => void; blur?: () => void } | null>(null)
/** Autofill (password/card/address) panelini kamaytirish — fokusdan oldin readonly */
const draftLocked = ref(true)
const { keyboardOpen, scheduleMeasure } = useMobileKeyboardOpen()
const showCallBar = computed(() => Boolean(props.callHref) && !keyboardOpen.value)
const slashMenuOpen = ref(false)
const slashHighlight = ref(0)
/** / tugmasi orqali ochilganda klaviatura chiqmasin, barcha komandalar ko'rinsin */
const slashPickerMode = ref(false)

const hasSlashCommands = computed(() => (props.slashCommands?.length ?? 0) > 0)

const slashCommandLimit = computed(() => (slashPickerMode.value ? Infinity : 20))

const filteredSlashCommands = computed(() => {
  const list = props.slashCommands ?? []
  if (!list.length || !slashMenuOpen.value) return []

  const raw = draftPlain(text.value)
  const q = raw.trim().toLowerCase()
  const limit = slashCommandLimit.value

  if (!q || q === '/') return list.slice(0, limit)

  if (q.startsWith('/')) {
    return list.filter((item) => item.cmd.toLowerCase().startsWith(q)).slice(0, limit)
  }

  return list
    .filter(
      (item) =>
        item.cmd.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q),
    )
    .slice(0, limit)
})

const showSlashMenu = computed(
  () =>
    !props.disabled &&
    hasSlashCommands.value &&
    slashMenuOpen.value &&
    draftPlain(text.value).startsWith('/'),
)

watch(filteredSlashCommands, (list) => {
  if (!list.length) slashHighlight.value = 0
  else if (slashHighlight.value >= list.length) slashHighlight.value = 0
})

const closeSlashMenu = () => {
  slashMenuOpen.value = false
  slashHighlight.value = 0
  slashPickerMode.value = false
}

const toggleSlashMenu = () => {
  if (props.disabled || !hasSlashCommands.value) return
  if (slashMenuOpen.value && draftPlain(text.value) === '/') {
    closeSlashMenu()
    text.value = ''
    return
  }
  const plain = draftPlain(text.value)
  if (!plain.startsWith('/')) {
    text.value = '/' + plain.replace(/^\/+/, '')
  }
  slashPickerMode.value = true
  slashMenuOpen.value = true
  slashHighlight.value = 0
  nextTick(() => {
    textInput.value?.blur()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  })
}

const onDraftChange = (value: string) => {
  syncHasText(value)
  if (!hasSlashCommands.value) return
  const plain = draftPlain(value)
  if (plain.startsWith('/')) {
    slashMenuOpen.value = true
    if (plain.length > 1) slashPickerMode.value = false
  } else {
    closeSlashMenu()
  }
}

const onComposerKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) onEnterKey(e)
  if (!showSlashMenu.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    onSlashDown()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    onSlashUp()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeSlashMenu()
  }
}

const sendSlashCommand = (cmd: string) => {
  if (props.disabled) return
  const value = String(cmd || '').trim()
  if (!value) return
  closeSlashMenu()
  text.value = ''
  syncHasText('')
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

const onEnterKey = (e: KeyboardEvent) => {
  if (!showSlashMenu.value || !filteredSlashCommands.value[slashHighlight.value]) return
  e.preventDefault()
  sendSlashCommand(filteredSlashCommands.value[slashHighlight.value].cmd)
}

const unlockDraft = () => {
  draftLocked.value = false
}

const onInputFocus = () => {
  unlockDraft()
  slashPickerMode.value = false
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
  if (!draftPlain(value)) return
  closeSlashMenu()
  emit('send', value)
  text.value = ''
  syncHasText('')
}

watch(text, (value) => {
  onDraftChange(value)
})

const recording = ref(false)
const seconds = ref(0)
const micError = ref('')
const bars = [6, 12, 18, 10, 14, 8, 16, 11]
let timer: ReturnType<typeof setInterval> | null = null
let mediaRecorder: MediaRecorder | null = null
let mediaStream: MediaStream | null = null
let chunks: BlobPart[] = []
let mimeType = ''
let micStarting = false

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
  if (props.disabled || recording.value || micStarting) return
  micStarting = true
  micError.value = ''
  if (!canRecordVoice()) {
    micError.value = 'Bu brauzer ovoz yozishni qo\'llab-quvvatlamaydi'
    micStarting = false
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
  } finally {
    micStarting = false
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
  else if (dur > 0 && dur < 1) micError.value = 'Ovoz juda qisqa'
}

const onMicPress = (e: PointerEvent) => {
  if (props.disabled || recording.value) return
  if (e.button !== 0) return
  void startRecording()
}

onBeforeUnmount(() => {
  clearTimer()
  cancelRecording()
})
</script>

<style scoped>
.chat-composer-textarea::placeholder {
  overflow: hidden;
  text-overflow: ellipsis;
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
  max-height: 65px;
  opacity: 1;
  transform: translateY(0);
}
</style>
