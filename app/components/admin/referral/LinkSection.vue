<template>
  <section class="space-y-3">
    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
      Referal havola
    </p>

    <div class="flex items-stretch gap-2">
      <input
        :value="link"
        readonly
        class="flex-1 min-w-0 px-3 py-3 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none"
      >
      <button
        type="button"
        class="shrink-0 px-4 rounded-xl text-[12px] font-black text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all"
        @click="copyLink"
      >
        {{ copied ? 'Nusxalandi!' : 'Nusxa' }}
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all"
        @click="shareTelegram"
      >
        <AdminReferralBrandIcon brand="telegram" />
        Telegram
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all"
        @click="shareWhatsApp"
      >
        <AdminReferralBrandIcon brand="whatsapp" />
        WhatsApp
      </button>
    </div>

    <div
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <button
        type="button"
        class="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        @click="expanded = !expanded"
      >
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
        >
          <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-sm" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-black text-slate-900 dark:text-white">Reklama matni</p>
          <p v-if="!expanded" class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {{ adText }}
          </p>
        </div>
        <font-awesome-icon
          icon="fa-solid fa-chevron-down"
          class="text-xs text-slate-400 transition-transform shrink-0"
          :class="expanded ? 'rotate-180' : ''"
        />
      </button>

      <div v-if="expanded" class="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
        <textarea
          v-model="adTextLocal"
          rows="4"
          class="w-full px-3 py-3 rounded-xl text-[12px] font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
        <button
          type="button"
          class="w-full py-2.5 rounded-xl text-[12px] font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-950/60 transition-colors"
          @click="copyAdText"
        >
          {{ adCopied ? 'Matn nusxalandi!' : 'Matnni nusxalash' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: string
  adText: string
}>()

const expanded = ref(false)
const copied = ref(false)
const adCopied = ref(false)
const adTextLocal = ref(props.adText)

watch(() => props.adText, v => { adTextLocal.value = v })

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    /* ignore */
  }
}

const copyAdText = async () => {
  try {
    await navigator.clipboard.writeText(adTextLocal.value)
    adCopied.value = true
    setTimeout(() => { adCopied.value = false }, 2000)
  } catch {
    /* ignore */
  }
}

const shareText = computed(() => `${adTextLocal.value}\n${props.link}`)

const shareTelegram = () => {
  const url = `https://t.me/share/url?url=${encodeURIComponent(props.link)}&text=${encodeURIComponent(adTextLocal.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareWhatsApp = () => {
  const url = `https://wa.me/?text=${encodeURIComponent(shareText.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
