import { normalizeAppScript, useAppScript } from '~/composables/useAppScript'

/** Birinchi kirishda standart yozuv — Lotin (cookie ga yoziladi). */
export default defineNuxtPlugin(() => {
  const { script, setScript } = useAppScript()

  const hasCookie = document.cookie
    .split(';')
    .some((part) => part.trim().startsWith('zt-script='))

  if (!hasCookie) {
    setScript('latin')
    return
  }

  const normalized = normalizeAppScript(script.value)
  if (script.value !== normalized) {
    setScript(normalized)
  }
})
