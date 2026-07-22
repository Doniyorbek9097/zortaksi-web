/**
 * Yangi buyurtma / kiruvchi chat — Web Audio bilan qisqa signal.
 * Profil → Bildirishnoma ovozi orqali yoqiladi/o'chiriladi (localStorage).
 */

const STORAGE_KEY = 'zortaksi_notify_sound'

let audioCtx: AudioContext | null = null
let unlocked = false
let lastPlayAt = 0

/** SSR-safe enabled state (default: yoqilgan) */
const soundEnabled = ref(true)

function readStored(): boolean {
  if (!import.meta.client) return true
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === null) return true
    return v === '1' || v === 'true'
  } catch {
    return true
  }
}

function writeStored(on: boolean) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function isNotifySoundEnabled() {
  return soundEnabled.value
}

export function setNotifySoundEnabled(on: boolean) {
  soundEnabled.value = on
  writeStored(on)
  if (on) {
    unlockNotifySound()
    // Yoqilganda qisqa preview
    lastPlayAt = 0
    playChatSound()
  }
}

function getCtx(): AudioContext | null {
  if (!import.meta.client) return null
  const AC = window.AudioContext || (window as any).webkitAudioContext
  if (!AC) return null
  if (!audioCtx) audioCtx = new AC()
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

/** Birinchi foydalanuvchi gestidan keyin ovoz ishlaydi */
export function unlockNotifySound() {
  if (!import.meta.client || unlocked) return
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume().then(() => {
    unlocked = true
  })
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    volume = 0.18,
    type = 'sine' as OscillatorType,
  }: {
    frequency: number
    start: number
    duration: number
    volume?: number
    type?: OscillatorType
  }
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function canPlay(minGapMs = 400) {
  if (!soundEnabled.value) return false
  const now = Date.now()
  if (now - lastPlayAt < minGapMs) return false
  lastPlayAt = now
  return true
}

/** Yangi buyurtma — ikki marta aniqroq signal */
export function playOrderSound() {
  if (!import.meta.client || !canPlay(600)) return
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, { frequency: 880, start: t, duration: 0.12, volume: 0.2, type: 'triangle' })
  tone(ctx, { frequency: 1175, start: t + 0.14, duration: 0.16, volume: 0.22, type: 'triangle' })
}

/** Chatda kimdir yozdi — yumshoq ping */
export function playChatSound() {
  if (!import.meta.client || !canPlay(500)) return
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, { frequency: 740, start: t, duration: 0.1, volume: 0.16, type: 'sine' })
  tone(ctx, { frequency: 980, start: t + 0.11, duration: 0.12, volume: 0.14, type: 'sine' })
}

/** Profil toggle + ovoz API */
export function useNotifySound() {
  if (import.meta.client) {
    soundEnabled.value = readStored()
    const unlock = () => unlockNotifySound()
    window.addEventListener('pointerdown', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  const soundOn = computed({
    get: () => soundEnabled.value,
    set: (v: boolean) => setNotifySoundEnabled(v),
  })

  return {
    soundOn,
    soundEnabled,
    isNotifySoundEnabled,
    setNotifySoundEnabled,
    playOrderSound,
    playChatSound,
    unlockNotifySound,
  }
}

// Plugin/socket ishga tushganda saqlangan qiymatni o'qiydi
if (import.meta.client) {
  soundEnabled.value = readStored()
}
