<template>
  <div class="space-y-4">
    <header
      class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
    >
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all shrink-0"
        aria-label="Orqaga"
        @click="navigateTo(backPath)"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none flex-1 min-w-0">
        <h1 class="text-base font-black text-slate-900 dark:text-white">Ilovani yuklab olish</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Android uchun rasmiy APK
        </p>
      </div>
    </header>

    <section
      class="rounded-2xl p-4 border border-sky-200/80 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-950/30"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-sky-500 text-white shadow-md shadow-sky-500/25"
        >
          <font-awesome-icon icon="fa-solid fa-mobile-screen" class="text-lg" />
        </div>
        <div class="min-w-0">
          <p class="text-[13px] font-black text-slate-900 dark:text-white leading-snug">
            Zo'r Taksi mobil ilovasi
          </p>
          <p class="text-[12px] font-medium text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            Ilova hozircha faqat <strong class="text-slate-800 dark:text-slate-100">Android</strong> telefonlar uchun.
            Play Marketda emas — shu sahifadan to'g'ridan-to'g'ri yuklab olinadi.
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-[13px] font-black text-slate-900 dark:text-white flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-list-ol" class="text-sky-500 text-sm" />
        O'rnatish bo'yicha qo'llanma
      </h2>
      <ol class="space-y-3">
        <li
          v-for="(step, i) in steps"
          :key="i"
          class="flex gap-3 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300"
        >
          <span
            class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400"
          >
            {{ i + 1 }}
          </span>
          <span class="pt-0.5">{{ step }}</span>
        </li>
      </ol>
    </section>

    <section
      class="rounded-2xl p-4 border border-amber-200/80 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/25"
    >
      <p class="text-[12px] font-bold text-amber-900 dark:text-amber-100 flex items-start gap-2 leading-relaxed">
        <font-awesome-icon icon="fa-solid fa-shield-alt" class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Telefon «Bu ilova xavfsiz emas» deb ogohlantirishi mumkin — Play Marketdan o'rnatilmagani uchun.
          Bu normal holat. Fayl rasmiy <strong>ZorTaksi.Uz</strong> saytidan yuklanadi.
        </span>
      </p>
    </section>

    <a
      :href="apkUrl"
      :download="fileName"
      class="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[14px] font-black text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-transform"
      @click="onDownloadClick"
    >
      <font-awesome-icon icon="fa-solid fa-download" />
      Ilovani yuklab olish (APK)
    </a>

    <p class="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 pb-2">
      iPhone (iOS) qo'llab-quvvatlanmaydi
    </p>
  </div>
</template>

<script setup lang="ts">
import { APP_DOWNLOAD_APK_URL, APP_DOWNLOAD_FILE_NAME } from '~/constants/appDownload'

defineProps<{
  backPath: string
}>()

const apkUrl = APP_DOWNLOAD_APK_URL
const fileName = APP_DOWNLOAD_FILE_NAME

const steps = [
  "Pastdagi «Ilovani yuklab olish» tugmasini bosing — zortaxi.uz.apk fayli yuklanadi.",
  "Yuklab bo'lgach, bildirishnoma yoki «Yuklamalar» / «Files» ilovasidan APK faylni toping va oching.",
  "Agar «Noma'lum manbalardan o'rnatish» so'rasa — «Sozlamalar»ga kirib ruxsat bering (Android 8+ da har bir ilova uchun alohida ruxsat beriladi).",
  "Chrome yoki tizim «Xavfsizlik tekshiruvi» ko'rsatsa — «Baribir o'rnatish» / «Install anyway» ni tanlang.",
  "O'rnatish tugagach ilovani oching va Telegram orqali kiring.",
]

function onDownloadClick() {
  if (!import.meta.client) return
  try {
    const ua = navigator.userAgent || ''
    const isAndroid = /Android/i.test(ua)
    if (!isAndroid && !/Windows|Macintosh|Linux/i.test(ua)) {
      // iOS va boshqalar — ogohlantirish (yuklashni to'xtatmaymiz)
      console.info('[AppDownload] iOS yoki nomaʼlum qurilma')
    }
  } catch {
    /* */
  }
}
</script>
