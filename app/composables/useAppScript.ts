import type { ScriptType } from '~/components/profile/ScriptToggle.vue'

/** Cookie / eski qiymatlarni standart Lotin ga normalizatsiya */
export function normalizeAppScript(value: unknown): ScriptType {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === 'cyrillic' || v === 'cyrl' || v === 'kirill' || v === 'кирилл') {
    return 'cyrillic'
  }
  return 'latin'
}

/**
 * Ilova yozuvi: Lotin / Kirill.
 * Birinchi kirishda standart — Lotin.
 */
export function useAppScript() {
  const raw = useCookie<string | null>('zt-script', {
    default: () => 'latin',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: true,
  })

  const script = computed<ScriptType>({
    get: () => normalizeAppScript(raw.value),
    set: (value) => {
      raw.value = normalizeAppScript(value)
    },
  })

  const setScript = (value: ScriptType) => {
    script.value = normalizeAppScript(value)
  }

  const toggleScript = () =>
    setScript(script.value === 'cyrillic' ? 'latin' : 'cyrillic')

  const isCyrillic = computed(() => script.value === 'cyrillic')

  return { script, setScript, toggleScript, isCyrillic }
}
