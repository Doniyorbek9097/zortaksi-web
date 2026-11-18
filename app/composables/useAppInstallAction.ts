import { shouldShowApkDownload } from '~/utils/appEmbed'
import { useTelegramPwaOnboarding } from '~/composables/useTelegramPwaOnboarding'

/** Brauzerdagi «yuklab olish» — PWA o‘rnatish dialogi */
export function useAppInstallAction() {
  const { requestPwaInstall } = useTelegramPwaOnboarding()

  function openAppInstall() {
    if (!import.meta.client) return
    if (!shouldShowApkDownload()) return
    requestPwaInstall()
  }

  return { openAppInstall }
}