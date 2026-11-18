<template>
  <div class="min-h-[40vh]" />
</template>

<script setup lang="ts">
import { isFlutterWebView, shouldShowApkDownload } from '~/utils/appEmbed'

definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: "Ilovani o'rnatish — Zo'r Taksi",
  description: "ZorTaksi PWA ilovasini brauzerdan o'rnatish.",
})

onMounted(() => {
  const back = '/admin/dashboard'
  if (!shouldShowApkDownload() || isFlutterWebView()) {
    void navigateTo(back, { replace: true })
    return
  }
  const { openAppInstall } = useAppInstallAction()
  openAppInstall()
  nextTick(() => void navigateTo(back))
})
</script>