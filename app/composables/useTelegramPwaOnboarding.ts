import {
  browserLabelForPlatform,
  consumeTelegramBrowserEntry,
  isTelegramWebContext,
  openCurrentSiteInSystemBrowser,
  TG_BROWSER_DISMISS_SESSION,
  TG_PWA_FROM_SESSION,
} from '~/utils/telegramOpenBrowser'
import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isIosDevice } from '~/utils/devicePlatform'

const showOpenBrowser = ref(false)
const showPwaInstall = ref(false)
const iosInstallHint = ref(false)

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
    const pin = pwa.value
    if (!pin) return false
    const flag = pin.showInstallPrompt as boolean | { value?: boolean }
    return flag === true || flag?.value === true
  })

  function refreshGates() {
    if (!import.meta.client) return
    if (isFlutterWebView() || isPwaStandalone()) {
      showOpenBrowser.value = false
      showPwaInstall.value = false
      return
    }

    if (isTelegramWebContext() && !dismissed(TG_BROWSER_DISMISS_SESSION)) {
      showPwaInstall.value = false
      showOpenBrowser.value = true
      return
    }

    showOpenBrowser.value = false

    const fromTelegram = consumeTelegramBrowserEntry()
    if (fromTelegram && !isTelegramWebContext() && !isPwaStandalone()) {
      showPwaInstall.value = true
    } else if (!fromTelegram && !isPwaStandalone() && !isTelegramWebContext()) {
      try {
        if (sessionStorage.getItem(TG_PWA_FROM_SESSION) === '1') {
          showPwaInstall.value = true
        }
      } catch {
        /* */
      }
    }
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
    const pin = pwa.value
    if (canNativeInstall.value && pin?.install) {
      try {
        const choice = await pin.install()
        if (choice?.outcome === 'accepted' || pin.isPWAInstalled) {
          showPwaInstall.value = false
          await router.push('/driver/dashboard')
          return
        }
      } catch {
        /* */
      }
    }

    if (isIosDevice()) {
      iosInstallHint.value = true
    }
  }

  function bootOnboarding() {
    refreshGates()
    const delays = [80, 400, 1200, 2500]
    for (const ms of delays) {
      setTimeout(refreshGates, ms)
    }
  }

  return {
    showOpenBrowser,
    showPwaInstall,
    iosInstallHint,
    browserCopy,
    canNativeInstall,
    bootOnboarding,
    refreshGates,
    openInSystemBrowser,
    dismissOpenBrowser,
    installPwaAndGo,
  }
}