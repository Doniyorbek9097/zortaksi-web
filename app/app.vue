<template>
  <div class="theme-page safe-app min-h-screen w-full">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <PwaInstallModal
      v-model:open="open"
      :ios-hint="iosHint"
      @install="install"
      @later="remindLater"
    />
  </div>
</template>

<script setup lang="ts">
const { theme, initTheme } = useTheme()
const { open, iosHint, install, remindLater } = usePwaInstall()

useHead({
  htmlAttrs: {
    class: computed(() => (theme.value === 'dark' ? 'dark' : '')),
  },
})

onMounted(() => initTheme())
</script>

<style>

</style>
