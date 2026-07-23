const REMIND_KEY = 'pwa_remind_later_until'

export const usePwaInstall = () => {
  const open = ref(false)
  const iosHint = ref(false)
  const manualHint = ref(false)
  const canNativeInstall = ref(false)

  const getPwa = () => useNuxtApp().$pwa

  const isStandalone = () => {
    if (!import.meta.client) return true
    const mq = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = (navigator as any).standalone === true
    return mq || iosStandalone || !!getPwa()?.isPWAInstalled
  }

  const isIos = () => {
    if (!import.meta.client) return false
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
  }

  const isTelegram = () => {
    if (!import.meta.client) return false
    const ua = navigator.userAgent
    return /Telegram/i.test(ua) || !!(window as any).TelegramWebviewProxy
  }

  const isAndroid = () => {
    if (!import.meta.client) return false
    return /android/i.test(navigator.userAgent)
  }

  const reminded = () => {
    try {
      const until = Number(localStorage.getItem(REMIND_KEY) || 0)
      return Date.now() < until
    } catch {
      return false
    }
  }

  const remindLater = () => {
    try {
      localStorage.setItem(REMIND_KEY, String(Date.now() + 3 * 24 * 60 * 60 * 1000))
    } catch {
      /* ignore */
    }
    open.value = false
  }

  const maybeShow = () => {
    if (!import.meta.client) return
    if (isStandalone()) return
    if (reminded()) return

    const pwa = getPwa()
    const promptReady = !!(pwa?.showInstallPrompt || canNativeInstall.value)

    if (promptReady) {
      open.value = true
      iosHint.value = false
      manualHint.value = false
      return
    }

    if (isIos()) {
      open.value = true
      iosHint.value = true
      manualHint.value = false
      return
    }

    // Android / Telegram: show entry UI even before beforeinstallprompt settles
    // (Telegram WebView often cannot install — instructions mention opening in browser)
    if (isAndroid() || isTelegram()) {
      open.value = true
      iosHint.value = false
      manualHint.value = true
    }
  }

  const install = async () => {
    if (iosHint.value || manualHint.value) return
    try {
      await getPwa()?.install?.()
    } catch {
      /* user dismissed */
    }
    open.value = false
  }

  onMounted(() => {
    // Show soon on entry; also re-check after SW / beforeinstallprompt settle
    const t1 = window.setTimeout(maybeShow, 900)
    const t2 = window.setTimeout(maybeShow, 2800)

    const stop = watch(
      () => getPwa()?.showInstallPrompt,
      (v) => {
        canNativeInstall.value = !!v
        if (v && !isStandalone() && !reminded()) {
          open.value = true
          iosHint.value = false
          manualHint.value = false
        }
      },
      { immediate: true }
    )

    onUnmounted(() => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      stop()
    })
  })

  return {
    open,
    iosHint,
    manualHint,
    install,
    remindLater,
    isStandalone,
    isTelegram,
  }
}
