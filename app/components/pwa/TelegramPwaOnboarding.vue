<template>
  <Teleport to="body">
    <Transition name="pwa-gate-fade">
      <div
        v-if="showOpenBrowser"
        class="fixed inset-0 z-[10001] flex flex-col items-center justify-end sm:justify-center bg-slate-900/30 backdrop-blur-[2px] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-browser-title"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-black/20 overflow-hidden"
        >
          <div class="px-6 pt-8 pb-6 text-center">
            <img
              src="/logo.png"
              alt="Zo'r Taksi"
              width="96"
              height="96"
              class="mx-auto mb-5 h-24 w-24 rounded-2xl object-cover drop-shadow-lg"
            />
            <p class="text-xs font-bold uppercase tracking-widest text-sky-400/90 mb-2">
              Majburiy qadam
            </p>
            <h2 id="tg-browser-title" class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {{ browserCopy.title }}
            </h2>
            <p class="mt-2 text-sm text-slate-600 leading-snug max-w-sm mx-auto">
              Telegramda cheklangan — {{ isIosDevice() ? 'Safari' : 'Chrome' }}da oching.
            </p>
            <div class="mt-5 flex items-center justify-center gap-3 text-slate-400">
              <font-awesome-icon :icon="browserCopy.icon" class="text-3xl text-white/90" />
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-lg opacity-60" />
              <font-awesome-icon icon="fa-solid fa-mobile-screen" class="text-2xl" />
            </div>
          </div>

          <div class="px-6 pb-8 space-y-3">
            <button
              type="button"
              class="w-full py-4 rounded-2xl text-base sm:text-lg font-black text-white bg-sky-500 hover:bg-sky-400 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/30 disabled:opacity-60"
              :disabled="browserOpening"
              @click="onBrowserConfirm"
            >
              <font-awesome-icon
                v-if="browserOpening"
                icon="fa-solid fa-spinner"
                class="animate-spin mr-2"
              />
              {{ browserCopy.action }}
            </button>
            <button
              v-if="!isMobile"
              type="button"
              class="w-full py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-200"
              @click="dismissOpenBrowser"
            >
              Telegramda davom etish
            </button>
            <p v-else class="text-center text-xs text-slate-500">
              Tashqi brauzer ochilguncha bu ekran yopilmaydi
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="pwa-gate-fade">
      <div
        v-if="showPwaInstall"
        class="fixed inset-0 z-[10000] flex flex-col items-center justify-end sm:justify-center bg-slate-900/30 backdrop-blur-[2px] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-black/20 overflow-hidden"
        >
          <div class="px-6 pt-6 pb-4 text-center">
            <img
              src="/logo.png"
              alt="Zo'r Taksi"
              width="72"
              height="72"
              class="mx-auto mb-4 h-[4.5rem] w-[4.5rem] rounded-2xl object-cover drop-shadow-lg"
            />
            <h2 id="pwa-install-title" class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {{ openFromHomeHint ? 'Bosh ekrandan oching' : "Ilovani o'rnatish" }}
            </h2>
            <p class="mt-2 text-sm text-slate-600 leading-snug max-w-sm mx-auto">
              {{ installMessage }}
            </p>
          </div>

          <div
            v-if="iosInstallHint"
            class="mx-6 mb-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-left text-xs text-slate-600"
          >
            Ulashish → Bosh ekranga qo'shish → Qo'shish
          </div>

          <div class="px-6 pb-6">
            <button
              type="button"
              class="w-full py-4 rounded-2xl text-base sm:text-lg font-black text-white bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60"
              :disabled="installing"
              @click="onInstallConfirm"
            >
              <font-awesome-icon
                v-if="installing"
                icon="fa-solid fa-spinner"
                class="animate-spin mr-2"
              />
              {{ installButtonLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTelegramPwaOnboarding } from '~/composables/useTelegramPwaOnboarding'
import { isIosDevice, isMobileDevice } from '~/utils/devicePlatform'
import { isPwaStandalone } from '~/utils/appEmbed'

const {
  showOpenBrowser,
  showPwaInstall,
  iosInstallHint,
  openFromHomeHint,
  browserCopy,
  canNativeInstall,
  bootOnboarding,
  refreshGates,
  openInSystemBrowser,
  dismissOpenBrowser,
  installPwaAndGo,
} = useTelegramPwaOnboarding()

const installing = ref(false)
const browserOpening = ref(false)
const isMobile = computed(() => isMobileDevice())

const installMessage = computed(() => {
  if (openFromHomeHint.value) {
    return "Ilova o'rnatilgan — bosh ekrandagi belgidan oching."
  }
  if (iosInstallHint.value) {
    return "Safari: Ulashish → Bosh ekranga qo'shish."
  }
  if (canNativeInstall.value) {
    return "Tugmani bosing va «O'rnatish»ni tasdiqlang."
  }
  return "Davom etish uchun ilovani o'rnating."
})

const installButtonLabel = computed(() => {
  if (installing.value) return 'Kutilmoqda…'
  if (openFromHomeHint.value) return "Bosh ekrandan ochishga o'tdim"
  if (iosInstallHint.value) return 'Tushundim'
  return "O'rnatish"
})

async function onInstallConfirm() {
  installing.value = true
  try {
    await installPwaAndGo()
  } finally {
    installing.value = false
    refreshGates()
  }
}

async function onBrowserConfirm() {
  browserOpening.value = true
  try {
    await openInSystemBrowser()
  } finally {
    browserOpening.value = false
    void refreshGates()
  }
}

const nuxtApp = useNuxtApp()

const gateOpen = computed(() => showOpenBrowser.value || showPwaInstall.value)

watch(gateOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
  document.documentElement.style.overflow = open ? 'hidden' : ''
}, { immediate: true })

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
})

onMounted(() => {
  bootOnboarding()
  watch(
    () => isPwaStandalone(),
    (standalone) => {
      if (standalone) {
        showPwaInstall.value = false
        void navigateTo('/driver/dashboard')
      }
    },
    { immediate: true },
  )
  watch(
    () => nuxtApp.$pwa?.showInstallPrompt,
    () => {
      refreshGates()
    },
  )
  const poll = setInterval(refreshGates, 3000)
  onUnmounted(() => clearInterval(poll))
})
</script>

<style scoped>
.pwa-gate-fade-enter-active,
.pwa-gate-fade-leave-active {
  transition: opacity 0.25s ease;
}
.pwa-gate-fade-enter-from,
.pwa-gate-fade-leave-to {
  opacity: 0;
}
</style>