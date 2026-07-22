<template>
  <section class="space-y-3">
    <!-- Havola -->
    <div
      class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Referal havola
        </p>
        <span
          v-if="link"
          class="text-[10px] font-bold text-emerald-500"
        >
          Tayyor
        </span>
      </div>

      <div class="flex items-stretch gap-2">
        <div
          class="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-[11px] font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 truncate select-all"
          @click="selectLink"
        >
          {{ link || 'Havola yuklanmoqda...' }}
        </div>
        <button
          type="button"
          class="shrink-0 px-3.5 rounded-xl text-[12px] font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all"
          :disabled="!link"
          @click="copyLink"
        >
          {{ copied ? '✓' : 'Nusxa' }}
        </button>
      </div>
    </div>

    <!-- Reklama preview -->
    <div
      class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
    >
      <div class="px-3.5 py-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25"
          >
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-sm" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-900 dark:text-white">Reklama matni</p>
            <p class="text-[10px] font-medium text-slate-400">Ulashishga tayyor preview</p>
          </div>
        </div>
        <button
          type="button"
          class="text-[11px] font-black text-sky-600 dark:text-sky-400 px-2 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
          @click="editing = !editing"
        >
          {{ editing ? 'Preview' : 'Tahrirlash' }}
        </button>
      </div>

      <!-- Telegram-style preview -->
      <div
        v-if="!editing"
        class="p-3.5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
      >
        <div
          class="relative rounded-2xl rounded-tl-md px-3.5 py-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm animate-[ref-fade_0.35s_ease]"
        >
          <p class="text-[12.5px] font-medium text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed break-words">
            {{ adTextLocal }}
          </p>
          <a
            v-if="link"
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2.5 inline-flex items-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/50 truncate"
          >
            <font-awesome-icon icon="fa-solid fa-link" class="text-[10px] shrink-0" />
            <span class="truncate">{{ shortLink }}</span>
          </a>
          <p class="mt-2 text-[10px] font-bold text-slate-400 text-right">ZorTaksi.Uz</p>
        </div>
      </div>

      <!-- Edit -->
      <div v-else class="p-3.5 space-y-3">
        <textarea
          v-model="adTextLocal"
          rows="8"
          class="w-full px-3 py-3 rounded-xl text-[12px] font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400/60 resize-none leading-relaxed"
          placeholder="Reklama matnini yozing..."
        />
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl text-[12px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            @click="resetAd"
          >
            Standart
          </button>
          <button
            type="button"
            class="flex-[1.4] py-2.5 rounded-xl text-[12px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 transition-colors"
            @click="copyAdText"
          >
            {{ adCopied ? 'Nusxalandi!' : 'Matnni nusxa' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Ulashish -->
    <div class="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white bg-[#2AABEE] hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
        :disabled="!canShare"
        @click="shareTelegram"
      >
        <AdminReferralBrandIcon brand="telegram" />
        Telegram
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-white bg-[#25D366] hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
        :disabled="!canShare"
        @click="shareWhatsApp"
      >
        <AdminReferralBrandIcon brand="whatsapp" />
        WhatsApp
      </button>
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-50"
      :disabled="!canShare"
      @click="shareNativeOrCopy"
    >
      <font-awesome-icon icon="fa-solid fa-share-nodes" />
      {{ shareLabel }}
    </button>

    <p
      v-if="feedback"
      class="text-center text-[11px] font-bold text-emerald-500 animate-[ref-fade_0.3s_ease]"
    >
      {{ feedback }}
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: string
  adText: string
}>()

const editing = ref(false)
const copied = ref(false)
const adCopied = ref(false)
const feedback = ref('')
const adTextLocal = ref(props.adText)
const defaultAd = ref(props.adText)

watch(
  () => props.adText,
  (v) => {
    adTextLocal.value = v
    defaultAd.value = v
  }
)

const canShare = computed(() => !!props.link && !!adTextLocal.value.trim())

const shortLink = computed(() => {
  try {
    const u = new URL(props.link)
    return `${u.host}${u.pathname}${u.search}`
  } catch {
    return props.link
  }
})

const sharePayload = computed(() => {
  const text = adTextLocal.value.trim()
  // Agar matnda havola bo'lmasa — qo'shamiz
  if (props.link && !text.includes(props.link)) {
    return `${text}\n\n${props.link}`
  }
  return text
})

const shareLabel = computed(() => {
  if (import.meta.client && typeof navigator !== 'undefined' && !!navigator.share) {
    return 'Ulashish'
  }
  return "Matn + havolani nusxa"
})

const flash = (msg: string) => {
  feedback.value = msg
  setTimeout(() => { feedback.value = '' }, 2200)
}

const selectLink = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // fallback
    try {
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

const copyLink = async () => {
  if (!props.link) return
  const ok = await copyText(props.link)
  if (ok) {
    copied.value = true
    flash('Havola nusxalandi')
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const copyAdText = async () => {
  const ok = await copyText(sharePayload.value)
  if (ok) {
    adCopied.value = true
    flash('Reklama matni nusxalandi')
    setTimeout(() => { adCopied.value = false }, 2000)
  }
}

const resetAd = () => {
  adTextLocal.value = defaultAd.value
  flash('Standart matn tiklandi')
}

const shareTelegram = () => {
  if (!canShare.value) return
  const url = `https://t.me/share/url?url=${encodeURIComponent(props.link)}&text=${encodeURIComponent(adTextLocal.value.trim())}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareWhatsApp = () => {
  if (!canShare.value) return
  const url = `https://wa.me/?text=${encodeURIComponent(sharePayload.value)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const shareNativeOrCopy = async () => {
  if (!canShare.value) return
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'ZorTaksi referal',
        text: sharePayload.value,
        url: props.link,
      })
      flash('Ulashildi')
      return
    } catch {
      /* user cancelled or unsupported */
    }
  }
  const ok = await copyText(sharePayload.value)
  if (ok) flash('Matn + havola nusxalandi')
}
</script>

<style scoped>
@keyframes ref-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
