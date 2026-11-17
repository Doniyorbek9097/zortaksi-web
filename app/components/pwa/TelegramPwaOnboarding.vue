<template>
  <Teleport to="body">
    <Transition name="pwa-gate-fade">
      <div
        v-if="showOpenBrowser"
        class="fixed inset-0 z-[10001] flex flex-col items-center justify-end sm:justify-center bg-slate-950/95 backdrop-blur-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-browser-title"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/50 overflow-hidden"
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
            <h2 id="tg-browser-title" class="text-2xl sm:text-3xl font-black text-white leading-tight">
              {{ browserCopy.title }}
            </h2>
            <p class="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto">
              Telegram ichida PWA o'rnatish va to'liq funksiyalar cheklangan.
              {{ isIosDevice() ? "Safari" : "Chrome" }} da oching — keyin ilovani qurilmaga o'rnatasiz.
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
        class="fixed inset-0 z-[10000] flex flex-col items-center justify-end sm:justify-center bg-slate-950/95 backdrop-blur-md px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div class="px-6 pt-8 pb-6 text-center">
            <img
              src="/logo.png"
              alt="Zo'r Taksi"
              width="96"
              height="96"
              class="mx-auto mb-5 h-24 w-24 rounded-2xl object-cover drop-shadow-lg"
            />
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-400/90 mb-2">
              Majburiy qadam
            </p>
            <h2 id="pwa-install-title" class="text-2xl sm:text-3xl font-black text-white leading-tight">
              {{ openFromHomeHint ? "Ilovani bosh ekrandan oching" : "Ilovani o'rnatib oling" }}
            </h2>
            <p class="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto">
              {{ installMessage }}
            </p>
          </div>

          <div
            v-if="iosInstallHint"
            class="mx-6 mb-5 rounded-2xl bg-white/5 border border-white/10 p-4 text-left text-sm text-slate-200 space-y-2"
          >
            <p class="font-bold text-white flex items-center gap-2">
              <font-awesome-icon icon="fa-brands fa-safari" class="text-sky-400" />
              Safari'da qadamlar
            </p>
            <ol class="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>Pastdagi <b class="text-white">Ulashish</b> tugmasini bosing</li>
              <li><b class="text-white">«Bosh ekranga qo'shish»</b> ni tanlang</li>
              <li><b class="text-white">Qo'shish</b> — keyin ilova ochiladi</li>
            </ol>
          </div>

          <div v-else class="mx-6 mb-6 grid gap-3 text-left">
            <div
              v-for="(step, i) in installSteps"
              :key="i"
              class="flex gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-black text-sm"
              >
                {{ i + 1 }}
              </span>
              <p class="text-sm text-slate-200 pt-1">{{ step }}</p>
            </div>
          </div>

          <div class="px-6 pb-8">
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
            <p class="mt-4 text-center text-xs text-slate-500">
              O'rnatilguncha boshqa sahifalar bloklangan
            </p>
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
    return "Ilova allaqachon o'rnatilgan. Brauzer o'rniga Zo'r Taksi ilovasini bosh ekrandan oching — shunda barcha funksiyalar ishlaydi."
  }
  if (iosInstallHint.value) {
    return "Buyurtma va tez kirish uchun ilovani bosh ekranga qo'shish shart. Quyidagi qadamlarni bajaring."
  }
  if (canNativeInstall.value) {
    return "Zo'r Taksi mobil ilovasini o'rnatmasdan davom etib bo'lmaydi. Tugmani bosing va brauzer so'rovini tasdiqlang."
  }
  return "Ilovani o'rnatish majburiy. Tugmani bosing — so'ng brauzer o'rnatish oynasini tasdiqlang."
})

const installSteps = computed(() => {
  if (openFromHomeHint.value) {
    return [
      'Telefon bosh ekraniga o‘ting',
      'Zo‘r Taksi belgisini bosing (brauzer emas)',
      'Ilova alohida ochiladi — siz davom etasiz',
    ]
  }
  if (isIosDevice()) {
    return [
      'Tugmani bosing — Safari yo\'riqnomasi chiqadi',
      'Ulashish → Bosh ekranga qo\'shish',
      'Ilovani bosh ekrandan oching',
    ]
  }
  return [
    '«Ilovani o\'rnatib olish» tugmasini bosing',
    'Chrome oynasida «O\'rnatish» ni tasdiqlang',
    'Ilova bosh ekranga qo\'shiladi',
  ]
})

const installButtonLabel = computed(() => {
  if (installing.value) return 'Kutilmoqda…'
  if (openFromHomeHint.value) return "Bosh ekrandan ochishga o'tdim"
  if (iosInstallHint.value) return 'Tushundim, qadamlarni bajaraman'
  return "Ilovani o'rnatib olish"
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
}, { immediate: true })

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
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