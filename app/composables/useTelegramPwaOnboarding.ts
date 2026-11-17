import {
  browserLabelForPlatform,
  consumeTelegramBrowserEntry,
  isTelegramWebContext,
  openCurrentSiteInSystemBrowser,
  TG_BROWSER_DISMISS_SESSION,
  TG_PWA_FROM_SESSION,
} from '~/utils/telegramOpenBrowser'
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

const showOpenBrowser = ref(false)
const showPwaInstall = ref(false)
const iosInstallHint = ref(false)
const openFromHomeHint = ref(false)
const installPromptReady = ref(false)

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
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const browserCopy = computed(() => browserLabelForPlatform())

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
      showOpenBrowser.value = false
      showPwaInstall.value = false
      openFromHomeHint.value = false
      return
    }

    if (isTelegramWebContext() && !dismissed(TG_BROWSER_DISMISS_SESSION)) {
      showPwaInstall.value = false
      openFromHomeHint.value = false
      showOpenBrowser.value = true
      return
    }

    showOpenBrowser.value = false
    void consumeTelegramBrowserEntry()

    if (!mobileNeedsPwaShell() || isTelegramWebContext()) {
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

  function openInSystemBrowser() {
    openCurrentSiteInSystemBrowser()
    showOpenBrowser.value = false
  }

  function dismissOpenBrowser() {
    dismiss(TG_BROWSER_DISMISS_SESSION)
    showOpenBrowser.value = false
  }

  async function installPwaAndGo() {
    if (openFromHomeHint.value) {
      reloadIntoPwaShell('/driver/dashboard')
      return
    }

    const own = await triggerDeferredPwaInstall()
    if (own?.outcome === 'accepted') {
      showPwaInstall.value = false
      reloadIntoPwaShell('/driver/dashboard')
      return
    }

    const pin = pwa.value
    if (canNativeInstall.value && pin?.install) {
      try {
        const choice = await pin.install()
        if (choice?.outcome === 'accepted' || isPwaStandalone()) {
          showPwaInstall.value = false
          reloadIntoPwaShell('/driver/dashboard')
          return
        }
      } catch {
        /* */
      }
    }

    if (isIosDevice()) {
      iosInstallHint.value = true
      return
    }

    if (isMobileDevice()) {
      iosInstallHint.value = false
    }
  }

  function bootOnboarding() {
    initPwaInstallCapture()
    onPwaInstallReady(() => {
      installPromptReady.value = true
      void refreshGates()
    })
    void refreshGates()
    const delays = [80, 400, 1200, 2500, 5000]
    for (const ms of delays) {
      setTimeout(() => void refreshGates(), ms)
    }
  }

  return {
    showOpenBrowser,
    showPwaInstall,
    iosInstallHint,
    openFromHomeHint,
    browserCopy,
    canNativeInstall,
    bootOnboarding,
    refreshGates,
    openInSystemBrowser,
    dismissOpenBrowser,
    installPwaAndGo,
  }
}