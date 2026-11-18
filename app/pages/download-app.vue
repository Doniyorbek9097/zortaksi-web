<template>
  <div class="min-h-[40vh]" />
</template>

<script setup lang="ts">
import { isFlutterWebView } from '~/utils/appEmbed'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: "Ilovani o'rnatish — Zo'r Taksi",
  description: "ZorTaksi PWA ilovasini brauzerdan o'rnatish.",
})

onMounted(() => {
  if (isFlutterWebView()) {
    void navigateTo('/', { replace: true })
    return
  }
  const { openAppInstall } = useAppInstallAction()
  openAppInstall()
})
</script>