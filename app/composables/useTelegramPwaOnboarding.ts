import { TG_PWA_INSTALL_DISMISS_SESSION } from '~/utils/telegramOpenBrowser'
import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isIosDevice, isMobileDevice } from '~/utils/devicePlatform'
import {
  detectInstalledWebApp,
  hasDeferredPwaInstall,
  initPwaInstallCapture,
  mobileNeedsPwaShell,
  onPwaInstallReady,
  reloadIntoPwaShell,
  resetPwaInstallDismissed,
  triggerDeferredPwaInstall,
} from '~/utils/pwaInstall'

const showPwaInstall = ref(false)
const iosInstallHint = ref(false)
const openFromHomeHint = ref(false)
const installPromptReady = ref(false)
const pwaInstallDialogSuppressed = ref(false)
let booted = false

function dismissed(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function dismiss(key: string) {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* */
  }
}

export function useTelegramPwaOnboarding() {
  const nuxtApp = useNuxtApp()
  const pwa = computed(() => nuxtApp.$pwa)

  const canNativeInstall = computed(() => {
    if (installPromptReady.value || hasDeferredPwaInstall()) return true
    const pin = pwa.value
    if (!pin) return false
    const flag = pin.showInstallPrompt as boolean | { value?: boolean }
    return flag === true || flag?.value === true
  })

  async function refreshGates() {
    if (!import.meta.client) return
    if (isFlutterWebView() || isPwaStandalone()) {
      showPwaInstall.value = false
      openFromHomeHint.value = false
      return
    }

    if (!mobileNeedsPwaShell()) {
      showPwaInstall.value = false
      pwaInstallDialogSuppressed.value = false
      return
    }

    if (pwaInstallDialogSuppressed.value) {
      showPwaInstall.value = false
      return
    }

    if (dismissed(TG_PWA_INSTALL_DISMISS_SESSION)) {
      showPwaInstall.value = false
      return
    }

    resetPwaInstallDismissed()

    if (await detectInstalledWebApp()) {
      openFromHomeHint.value = true
      showPwaInstall.value = true
      return
    }

    openFromHomeHint.value = false
    showPwaInstall.value = true
  }

  function dismissPwaInstall() {
    dismiss(TG_PWA_INSTALL_DISMISS_SESSION)
    pwaInstallDialogSuppressed.value = false
    iosInstallHint.value = false
    showPwaInstall.value = false
  }

  async function installPwaAndGo() {
    if (openFromHomeHint.value) {
      showPwaInstall.value = false
      reloadIntoPwaShell('/driver/dashboard')
      return
    }

    pwaInstallDialogSuppressed.value = true
    showPwaInstall.value = false

    const own = await triggerDeferredPwaInstall()
    if (own?.outcome === 'accepted') {
      reloadIntoPwaShell('/driver/dashboard')
      return
    }
    if (own?.outcome === 'dismissed') {
      pwaInstallDialogSuppressed.value = false
      void refreshGates()
      return
    }

    const pin = pwa.value
    if (canNativeInstall.value && pin?.install) {
      try {
        const choice = await pin.install()
        if (choice?.outcome === 'accepted' || isPwaStandalone()) {
          reloadIntoPwaShell('/driver/dashboard')
          return
        }
        if (choice?.outcome === 'dismissed') {
          pwaInstallDialogSuppressed.value = false
          void refreshGates()
          return
        }
      } catch {
        pwaInstallDialogSuppressed.value = false
        void refreshGates()
        return
      }
    }

    pwaInstallDialogSuppressed.value = false

    if (isIosDevice()) {
      iosInstallHint.value = true
      showPwaInstall.value = true
      return
    }

    if (isMobileDevice()) {
      iosInstallHint.value = false
    }

    void refreshGates()
  }

  function bootOnboarding() {
    if (booted) return
    booted = true
    initPwaInstallCapture()
    onPwaInstallReady(() => {
      installPromptReady.value = true
      void refreshGates()
    })
    window.addEventListener('appinstalled', () => {
      pwaInstallDialogSuppressed.value = false
      showPwaInstall.value = false
    })
    void refreshGates()
    const delays = [80, 400, 1200, 2500, 5000]
    for (const ms of delays) {
      setTimeout(() => void refreshGates(), ms)
    }
  }

  return {
    showPwaInstall,
    iosInstallHint,
    openFromHomeHint,
    canNativeInstall,
    bootOnboarding,
    refreshGates,
    dismissPwaInstall,
    installPwaAndGo,
  }
}