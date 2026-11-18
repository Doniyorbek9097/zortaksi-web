<template>
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
          class="relative w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-black/20 overflow-hidden"
        >
          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-colors"
            aria-label="Yopish"
            :disabled="installing"
            @click="dismissPwaInstall"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="text-lg" />
          </button>
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

          <div class="px-6 pb-6 space-y-2">
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
            <button
              type="button"
              class="w-full py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-700 active:scale-[0.98] transition-colors"
              :disabled="installing"
              @click="dismissPwaInstall"
            >
              Keyinroq
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTelegramPwaOnboarding } from '~/composables/useTelegramPwaOnboarding'
import { isPwaStandalone } from '~/utils/appEmbed'

const {
  showPwaInstall,
  iosInstallHint,
  openFromHomeHint,
  canNativeInstall,
  bootOnboarding,
  refreshGates,
  dismissPwaInstall,
  installPwaAndGo,
} = useTelegramPwaOnboarding()

const installing = ref(false)
const nuxtApp = useNuxtApp()
const route = useRoute()

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

function onInstallConfirm() {
  showPwaInstall.value = false
  installing.value = true
  void installPwaAndGo().finally(() => {
    installing.value = false
  })
}

watch(showPwaInstall, (open) => {
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
      if (!standalone) return
      showPwaInstall.value = false
      if (
        route.path !== '/driver/dashboard' &&
        !route.path.startsWith('/driver/') &&
        !route.path.startsWith('/admin/') &&
        !route.path.startsWith('/passenger/')
      ) {
        void navigateTo('/driver/dashboard', { replace: true })
      }
    },
    { immediate: true },
  )
  watch(
    () => route.path,
    () => {
      refreshGates()
    },
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