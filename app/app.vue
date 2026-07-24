<template>
  <div class="theme-page safe-app min-h-screen w-full">
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <PwaInstallModal
      v-model:open="open"
      :ios-hint="iosHint"
      :manual-hint="manualHint"
      @install="install"
      @later="remindLater"
    />
  </div>
</template>

<script setup lang="ts">
import { THEME_CHROME, applyBrowserChrome } from '~/composables/useTheme'

const { theme, initTheme } = useTheme()
const { open, iosHint, manualHint, install, remindLater } = usePwaInstall()

const chromeColor = computed(() =>
  theme.value === 'light' ? THEME_CHROME.light : THEME_CHROME.dark,
)

useHead({
  htmlAttrs: {
    class: computed(() => (theme.value === 'dark' ? 'dark' : '')),
    style: computed(() => `color-scheme: ${theme.value === 'light' ? 'light' : 'dark'}; background-color: ${chromeColor.value}`),
  },
  meta: [
    { name: 'theme-color', content: chromeColor },
    { name: 'color-scheme', content: computed(() => (theme.value === 'light' ? 'light' : 'dark')) },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: computed(() => (theme.value === 'dark' ? 'black-translucent' : 'default')),
    },
  ],
  bodyAttrs: {
    style: computed(() => `background-color: ${chromeColor.value}`),
  },
})

watch(theme, (value) => {
  applyBrowserChrome(value === 'light' ? 'light' : 'dark')
})

onMounted(() => initTheme())
</script>

<style>

</style>
