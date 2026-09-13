<template>
  <div class="space-y-5">
    <header
      class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
    >
      <button
        type="button"
        class="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all shrink-0"
        aria-label="Orqaga"
        @click="navigateTo(backPath)"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none flex-1 min-w-0">
        <h1 class="text-lg font-black text-slate-900 dark:text-white">Ilovani yuklab olish</h1>
        <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Android uchun rasmiy APK
        </p>
      </div>
    </header>

    <section class="text-center space-y-4 pt-1">
      <div
        class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-sky-500 text-white shadow-lg shadow-sky-500/25"
      >
        <font-awesome-icon icon="fa-solid fa-mobile-screen" class="text-2xl" />
      </div>

      <div class="space-y-2 px-1">
        <p class="text-xl font-black text-slate-900 dark:text-white leading-snug">
          Zo'r Taksi mobil ilovasi
        </p>
        <p class="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          Faqat <strong class="text-slate-800 dark:text-slate-100">Android</strong> uchun.
          Play Marketda emas — shu sahifadan yuklab oling.
        </p>
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-transform disabled:opacity-70"
        :disabled="downloading"
        @click="startDownload"
      >
        <font-awesome-icon :icon="downloading ? 'fa-solid fa-spinner' : 'fa-solid fa-download'" :class="downloading ? 'animate-spin' : ''" />
        {{ downloading ? 'Yuklanmoqda…' : 'Ilovani yuklab olish (APK)' }}
      </button>

      <p class="text-sm font-medium text-slate-400 dark:text-slate-500">
        iPhone (iOS) qo'llab-quvvatlanmaydi
      </p>
    </section>

    <section
      class="rounded-2xl overflow-hidden border border-rose-200/70 dark:border-rose-900/40"
    >
      <div class="px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-rose-500 to-red-600">
        <font-awesome-icon icon="fa-solid fa-shield-alt" class="text-white text-lg shrink-0" />
        <p class="text-base font-black text-white leading-snug">Faqat rasmiy saytdan yuklang</p>
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 space-y-3">
        <ul class="space-y-2">
          <li
            v-for="tip in fraudTips"
            :key="tip"
            class="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            <font-awesome-icon icon="fa-solid fa-ban" class="mt-1 shrink-0 text-rose-500 text-xs" />
            <span>{{ tip }}</span>
          </li>
        </ul>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="site in officialSites"
            :key="site"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50"
          >
            <font-awesome-icon icon="fa-solid fa-circle-check" class="text-xs" />
            {{ site }}
          </span>
        </div>
      </div>
    </section>

    <section class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-list-ol" class="text-sky-500" />
        O'rnatish
      </h2>
      <ol class="space-y-3">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
        >
          <span
            class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400"
          >
            {{ i + 1 }}
          </span>
          <span class="pt-0.5 text-base">{{ step }}</span>
        </li>
      </ol>

      <p class="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-start gap-2 leading-relaxed pt-1">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          «Xavfsiz emas» degan ogohlantirish chiqishi mumkin — Play Marketdan emasligi uchun. Baribir o'rnatish mumkin.
        </span>
      </p>
    </section>

    <Teleport to="body">
      <Transition name="download-toast">
        <div
          v-if="showDownloadToast"
          class="fixed left-4 right-4 z-[200] mx-auto max-w-md pointer-events-none"
          :style="{ bottom: 'calc(5.5rem + var(--zt-safe-bottom, 0px))' }"
          role="status"
          aria-live="polite"
        >
          <div
            class="flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md
                   bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-800/50
                   shadow-emerald-500/10"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
            >
              <font-awesome-icon icon="fa-solid fa-download" class="text-sm" />
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              <p class="text-sm font-black text-slate-900 dark:text-white leading-snug">
                Yuklash boshlandi
              </p>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                <strong class="text-slate-700 dark:text-slate-200">{{ fileName }}</strong> yuklanmoqda.
                Brauzer pastidagi yuklamalar panelini tekshiring.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pointer-events-auto"
              aria-label="Yopish"
              @click="showDownloadToast = false"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="text-xs" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { APP_DOWNLOAD_APK_URL, APP_DOWNLOAD_FILE_NAME } from '~/constants/appDownload'

defineProps<{
  backPath: string
}>()

const apkUrl = APP_DOWNLOAD_APK_URL
const fileName = APP_DOWNLOAD_FILE_NAME

const downloading = ref(false)
const showDownloadToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const officialSites = ['zortaxi.uz', 'zortaksi.uz']

const fraudTips = [
  'Telegramdagi yoki ishonchsiz havolalardan APK yuklamang.',
  'Soxta ilovalar orqali akkaunt yoki pulingizni yo\'qotishingiz mumkin.',
]

const steps = [
  '«Ilovani yuklab olish» tugmasini bosing — APK fayl yuklanadi.',
  'Yuklangan faylni oching; kerak bo\'lsa «noma\'lum manbalar»ga ruxsat bering.',
  'O\'rnatib, ilovani oching va Telegram orqali kiring.',
]

function showToast() {
  showDownloadToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showDownloadToast.value = false
    toastTimer = null
  }, 7000)
}

function startDownload() {
  if (!import.meta.client || downloading.value) return

  downloading.value = true
  showToast()

  try {
    const link = document.createElement('a')
    link.href = apkUrl
    link.download = fileName
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch {
    window.open(apkUrl, '_blank', 'noopener')
  }

  window.setTimeout(() => {
    downloading.value = false
  }, 1200)
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.download-toast-enter-active,
.download-toast-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.download-toast-enter-from,
.download-toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
