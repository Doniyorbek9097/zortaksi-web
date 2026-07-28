import { createScriptObserver } from '~/utils/scriptDom'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const { script } = useAppScript()
  const observer = createScriptObserver(() =>
    script.value === 'latin' ? 'latin' : 'cyrillic'
  )

  watch(
    script,
    () => {
      observer.refresh()
    },
    { flush: 'post' }
  )

  onNuxtReady(() => {
    observer.start()
  })
})
