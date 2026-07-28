import type { ScriptType } from '~/components/profile/ScriptToggle.vue'

/**
 * Ilova yozuvi: Lotin / Kirill.
 * Birinchi kirishda default — Kirill.
 */
export function useAppScript() {
  const script = useCookie<ScriptType>('zt-script', {
    default: () => 'cyrillic',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    watch: true,
  })

  const setScript = (value: ScriptType) => {
    script.value = value === 'latin' ? 'latin' : 'cyrillic'
  }

  const toggleScript = () =>
    setScript(script.value === 'cyrillic' ? 'latin' : 'cyrillic')

  const isCyrillic = computed(() => script.value !== 'latin')

  return { script, setScript, toggleScript, isCyrillic }
}
