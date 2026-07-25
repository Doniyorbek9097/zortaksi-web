/** Brauzer/Telegram WebView uchun ovoz yozish — MIME va audio constraintlar. */

export const VOICE_RECORD_BITRATE = 96_000

const IOS_UA = /iPad|iPhone|iPod/i

export function isIosLike(): boolean {
  if (typeof navigator === 'undefined') return false
  return IOS_UA.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** MediaRecorder uchun eng yaxshi MIME (iOS → mp4, Android → webm/opus). */
export function pickVoiceMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = isIosLike()
    ? [
        'audio/mp4',
        'audio/mp4;codecs=mp4a',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ]
    : [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ]
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return ''
}

/** Aniq ovoz: ortiqcha noise suppression o'chirilgan, mono 48 kHz. */
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

export function voiceBlobExtension(mime: string): string {
  const m = (mime || '').toLowerCase()
  if (m.includes('ogg')) return 'ogg'
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'm4a'
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3'
  if (m.includes('wav')) return 'wav'
  return 'webm'
}

/** Blob MIME brauzer defaultlari bilan moslashtirish. */
export function normalizeVoiceBlob(blob: Blob, recordedMime: string): Blob {
  const mime = recordedMime || blob.type || pickVoiceMimeType() || 'audio/webm'
  if (blob.type === mime) return blob
  return new Blob([blob], { type: mime })
}

export function buildVoiceRecorderOptions(mimeType: string): MediaRecorderOptions {
  const opts: MediaRecorderOptions = {}
  if (mimeType) opts.mimeType = mimeType
  if (mimeType && !mimeType.includes('mp4')) {
    opts.audioBitsPerSecond = VOICE_RECORD_BITRATE
  }
  return opts
}
