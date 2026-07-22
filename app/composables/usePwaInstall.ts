const REMIND_KEY = 'pwa_remind_later_until'

export const usePwaInstall = () => {
  const open = ref(false)
  const iosHint = ref(false)

  const isStandalone = () => {
    if (!import.meta.client) return true
    const mq = window.matchMedia('(display-mode: standalone)').matches
    const ios = (navigator as any).standalone === true
    return mq || ios
  }

  const isIos = () => {
    if (!import.meta.client) return false
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
  }

  const reminded = () => {
    const until = Number(localStorage.getItem(REMIND_KEY) || 0)
    return Date.now() < until
  }

  const remindLater = () => {
    localStorage.setItem(REMIND_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000))
    open.value = false
  }

  const getPwa = () => (useNuxtApp() as any).$pwa

  const maybeShow = () => {
    if (!import.meta.client) return
    if (isStandalone()) return
    if (reminded()) return

    const pwa = getPwa()
    if (pwa?.showInstallPrompt) {
      open.value = true
      iosHint.value = false
      return
    }

    if (isIos()) {
      open.value = true
      iosHint.value = true
    }
  }

  const install = async () => {
    if (iosHint.value) return
    try {
      await getPwa()?.install?.()
    } catch {
      /* user dismissed */
    }
    open.value = false
  }

  onMounted(() => {
    setTimeout(maybeShow, 1800)
    const stop = watch(
      () => getPwa()?.showInstallPrompt,
      (v) => {
        if (v && !isStandalone() && !reminded()) {
          open.value = true
          iosHint.value = false
        }
      }
    )
    onUnmounted(() => stop())
  })

  return { open, iosHint, install, remindLater, isStandalone }
}
