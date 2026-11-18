<template>
  <div class="theme-page safe-app min-h-screen w-full">
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <PwaTelegramPwaOnboarding />
  </div>
</template>

<script setup lang="ts">
import { applyBrowserChrome, THEME_CHROME } from '~/composables/useTheme'
import { isPwaStandalone } from '~/utils/appEmbed'

const { effectiveTheme, initTheme } = useTheme()
const { script } = useAppScript()

const chromeColor = computed(() => THEME_CHROME[effectiveTheme.value])

useHead({
  htmlAttrs: {
    class: computed(() => (effectiveTheme.value === 'dark' ? 'dark' : '')),
    lang: computed(() => (script.value === 'latin' ? 'uz-Latn' : 'uz-Cyrl')),
    style: computed(() => {
      if (import.meta.client && isPwaStandalone()) return undefined
      const mode = effectiveTheme.value
      const scheme = mode === 'light' ? 'only light' : 'only dark'
      return `color-scheme: ${scheme}; background-color: ${chromeColor.value}`
    }),
  },
  bodyAttrs: {
    style: computed(() =>
      import.meta.client && isPwaStandalone() ? undefined : `background-color: ${chromeColor.value}`,
    ),
  },
})

watch(
  effectiveTheme,
  (mode) => {
    applyBrowserChrome(mode)
  },
  { flush: 'post' },
)

onMounted(() => {
  initTheme()
  applyBrowserChrome(effectiveTheme.value)
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

/* Telegram Mini App — gorizontal scroll va siljishni bloklash */
html[data-zt-embed='telegram'] {
  --zt-safe-top: 0px !important;
  --zt-safe-bottom: 0px !important;
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100%;
}

html[data-zt-embed='telegram'] body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* PWA — kontent to'liq ekran (tizim pastki paneli ostiga kirmaydi) */
html[data-zt-pwa='1'] body,
html[data-zt-pwa='1'] .theme-page {
  min-height: 100dvh;
  min-height: 100svh;
}

/* Yaqinlashtirish va matnni ko'chirib olish */
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body,
.theme-page {
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
}

p,
span,
li,
td,
th,
label,
h1,
h2,
h3,
h4,
h5,
h6,
.select-text,
[data-selectable='true'] {
  -webkit-user-select: text;
  user-select: text;
}

button,
a[role='button'],
nav,
.ptr-badge,
[aria-hidden='true'] {
  -webkit-user-select: none;
  user-select: none;
}
</style>
