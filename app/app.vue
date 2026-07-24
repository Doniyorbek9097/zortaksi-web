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
    // `only` — OS dark bo'lsa ham app light da pastki system nav bar ochiq qoladi
    style: computed(() => {
      const scheme = theme.value === 'light' ? 'only light' : 'only dark'
      return `color-scheme: ${scheme}; background-color: ${chromeColor.value}`
    }),
  },
  bodyAttrs: {
    style: computed(() => `background-color: ${chromeColor.value}`),
  },
})

// theme-color meta faqat applyBrowserChrome orqali (media query + unconditional)

watch(
  theme,
  (value) => {
    applyBrowserChrome(value === 'light' ? 'light' : 'dark')
  },
  { flush: 'post' },
)

onMounted(() => {
  initTheme()
  // PWA standalone: Nuxt head / manifest dan keyin qayta sync
  requestAnimationFrame(() => {
    applyBrowserChrome(theme.value === 'light' ? 'light' : 'dark')
  })
  setTimeout(() => {
    applyBrowserChrome(theme.value === 'light' ? 'light' : 'dark')
  }, 100)
})
</script>

<style>

</style>
