<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-2">
    <AppDownloadGuide back-path="/admin/dashboard" />
  </div>
</template>

<script setup lang="ts">
import { shouldShowApkDownload } from '~/utils/appEmbed'

definePageMeta({ layout: 'admin' })

useSeoMeta({
  title: "Ilovani yuklab olish — Zo'r Taksi",
  description: 'ZorTaksi Android ilovasini yuklab olish va o\'rnatish bo\'yicha qo\'llanma.',
})

onMounted(() => {
  if (!shouldShowApkDownload()) {
    void navigateTo('/admin/dashboard', { replace: true })
  }
})
</script>
