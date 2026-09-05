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

const { effectiveTheme, initTheme } = useTheme()
const { script } = useAppScript()
const { open, iosHint, manualHint, install, remindLater } = usePwaInstall()

const chromeColor = computed(() =>
  effectiveTheme.value === 'light' ? THEME_CHROME.light : THEME_CHROME.dark,
)

useHead({
  htmlAttrs: {
    class: computed(() => (effectiveTheme.value === 'dark' ? 'dark' : '')),
    lang: computed(() => (script.value === 'latin' ? 'uz-Latn' : 'uz-Cyrl')),
    style: computed(() => {
      const scheme = effectiveTheme.value === 'light' ? 'only light' : 'only dark'
      return `color-scheme: ${scheme}; background-color: ${chromeColor.value}`
    }),
  },
  bodyAttrs: {
    style: computed(() => `background-color: ${chromeColor.value}`),
  },
})

watch(
  effectiveTheme,
  (value) => {
    applyBrowserChrome(value)
  },
  { flush: 'post' },
)

onMounted(() => {
  initTheme()
  requestAnimationFrame(() => {
    applyBrowserChrome(effectiveTheme.value)
  })
  setTimeout(() => {
    applyBrowserChrome(effectiveTheme.value)
  }, 100)
})
</script>

<style>
/*
  Default 0 — Flutter/Android WebView host SafeArea beradi.
  Haqiqiy qiymat plugins/safe-area.client.ts da qo'yiladi.
*/
:root {
  --zt-safe-top: 0px;
  --zt-safe-bottom: 0px;
}

/* Flutter / system WebView — hech qachon pastki pad ochilmasin */
html[data-zt-embed='webview'] {
  --zt-safe-top: 0px !important;
  --zt-safe-bottom: 0px !important;
}
</style>
