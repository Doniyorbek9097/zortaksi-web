import { shouldShowApkDownload } from '~/utils/appEmbed'

/** APK yuklash tugmasi — Flutter WebView va PWA da yashirin */
export function useApkDownload() {
  const showDownloadButton = ref(false)

  const refresh = () => {
    showDownloadButton.value = shouldShowApkDownload()
  }

  onMounted(() => {
    refresh()
    requestAnimationFrame(refresh)
    setTimeout(refresh, 300)
  })

  return { showDownloadButton, refresh }
}
