<template>
  <BaseConfirmDialog
    v-model="showOpenBrowser"
    title="Ilovani to'liq ishlatish"
    :description="browserCopy.title"
    message="Telegram ichida ba'zi funksiyalar cheklangan. Quyidagi tugma orqali Chrome yoki Safari'da oching — keyin ilovani qurilmaga o'rnatishingiz mumkin."
    :confirm-text="browserCopy.action"
    cancel-text="Telegramda davom etish"
    variant="primary"
    @confirm="openInSystemBrowser"
    @cancel="dismissOpenBrowser"
  >
    <div class="mt-3 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
      <font-awesome-icon :icon="browserCopy.icon" class="text-2xl" />
      <font-awesome-icon icon="fa-solid fa-mobile-screen" class="text-xl opacity-70" />
    </div>
  </BaseConfirmDialog>

  <BaseConfirmDialog
    v-model="showPwaInstall"
    title="Ilovani o'rnatib olish"
    description="Zo'r Taksi — PWA"
    :message="installMessage"
    confirm-text="Ilovani o'rnatib olish"
    cancel-text="Keyinroq"
    variant="success"
    :loading="installing"
    :close-on-confirm="false"
    @confirm="onInstallConfirm"
    @cancel="dismissPwaInstall"
  >
    <div
      v-if="iosInstallHint"
      class="mt-3 rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
    >
      <p class="font-bold mb-1">Safari'da:</p>
      <p>1. Pastdagi <b>Ulashish</b> tugmasini bosing</p>
      <p>2. <b>«Bosh ekranga qo'shish»</b> ni tanlang</p>
      <p>3. <b>Qo'shish</b> — ilova asosiy ekranda ochiladi</p>
    </div>
  </BaseConfirmDialog>
</template>

<script setup lang="ts">
import { useTelegramPwaOnboarding } from '~/composables/useTelegramPwaOnboarding'

const {
  showOpenBrowser,
  showPwaInstall,
  iosInstallHint,
  browserCopy,
  canNativeInstall,
  bootOnboarding,
  openInSystemBrowser,
  dismissOpenBrowser,
  dismissPwaInstall,
  installPwaAndGo,
} = useTelegramPwaOnboarding()

const installing = ref(false)

const installMessage = computed(() => {
  if (iosInstallHint.value) {
    return "Quyidagi qadamlarni bajaring. Tayyor bo'lgach ilova bosh ekrandan ochiladi."
  }
  if (canNativeInstall.value) {
    return "Bir marta bosing — ilova qurilmangizga o'rnatiladi va tezkor kirish uchun bosh ekranga qo'shiladi."
  }
  return "Ilovani o'rnatish uchun tugmani bosing. Brauzer so'rovini tasdiqlang."
})

async function onInstallConfirm() {
  installing.value = true
  try {
    await installPwaAndGo()
    if (!iosInstallHint.value) {
      showPwaInstall.value = false
    }
  } finally {
    installing.value = false
  }
}

const nuxtApp = useNuxtApp()

onMounted(() => {
  bootOnboarding()
  watch(
    () => nuxtApp.$pwa?.isPWAInstalled,
    (installed) => {
      if (installed) {
        showPwaInstall.value = false
        void navigateTo('/driver/dashboard')
      }
    },
  )
  watch(
    () => nuxtApp.$pwa?.showInstallPrompt,
    () => {
      if (showPwaInstall.value) return
      bootOnboarding()
    },
  )
})
</script>