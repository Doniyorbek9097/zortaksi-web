/**
 * Ovoz yozish — imkon qadar OGG/Opus.
 * Brauzer OGG ni qo'llab-quvvatlamasa webm yoziladi, server OGG ga o'tkazadi.
 * Ijro har doim audio/ogg.
 */

export const VOICE_RECORD_BITRATE = 96_000

const OGG_CANDIDATES = [
  'audio/ogg;codecs=opus',
  'audio/ogg; codecs=opus',
  'audio/ogg',
]

const FALLBACK_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
]

/** MediaRecorder MIME — avvalo OGG. */
export function pickVoiceMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const mime of OGG_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  for (const mime of FALLBACK_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return ''
}

export function canRecordVoice(): boolean {
  return !!pickVoiceMimeType() || typeof MediaRecorder !== 'undefined'
}

export function isOggMime(mime: string): boolean {
  return /ogg|opus/i.test(mime || '')
}

/** Aniq ovoz: mono 48 kHz. */
export function getVoiceAudioConstraints(): MediaStreamConstraints {
  return {
    audio: {
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 48_000 },
      echoCancellation: { ideal: true },
      noiseSuppression: { ideal: false },
      autoGainControl: { ideal: true },
    },
  }
}

/** Fayl nomi — har doim .ogg (server Telegram OGG ga keltiradi). */
export function voiceBlobExtension(_mime: string): string {
  return 'ogg'
}

/** Blob MIME — OGG bo'lsa saqlaymiz, aks holda asl (server convert). */
export function normalizeVoiceBlob(blob: Blob, recordedMime: string): Blob {
  const mime = recordedMime || blob.type || 'audio/ogg'
  if (blob.type === mime) return blob
  return new Blob([blob], { type: mime })
}

export function buildVoiceRecorderOptions(mimeType: string): MediaRecorderOptions {
  const opts: MediaRecorderOptions = {}
  if (mimeType) opts.mimeType = mimeType
  opts.audioBitsPerSecond = VOICE_RECORD_BITRATE
  return opts
}
