<template>
  <div
    class="relative min-h-[100dvh] w-full overflow-x-hidden flex flex-col px-4 py-5 text-slate-900 dark:text-slate-100"
  >
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-emerald-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/20" />
    <div class="pointer-events-none absolute -top-16 right-0 w-56 h-56 rounded-full bg-amber-400/20 blur-3xl" />
    <div class="pointer-events-none absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl" />

    <header class="relative z-10 w-full max-w-md mx-auto flex items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-amber-600 transition-all active:scale-95"
        @click="handleBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
        Orqaga
      </button>
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
        Taxi chaqirish
      </span>
    </header>

    <main class="relative z-10 w-full max-w-md mx-auto my-auto py-6 space-y-5">
      <div class="text-center space-y-3">
        <div class="relative w-16 h-16 mx-auto">
          <div class="absolute inset-0 rounded-2xl bg-amber-400/30 blur-xl animate-pulse" />
          <div class="relative w-full h-full rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-800/40 shadow-xl flex items-center justify-center text-3xl">
            🚕
          </div>
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-black tracking-tight">
            {{ headline }}
          </h1>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug max-w-xs mx-auto">
            {{ subtitle }}
          </p>
        </div>

        <div v-if="step !== 'loading' && step !== 'unavailable'" class="flex items-center justify-center gap-1.5">
          <div
            v-for="(label, i) in stepLabels"
            :key="label"
            class="flex items-center gap-1"
          >
            <span
              class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
              :class="stepDotClass(i)"
            >
              {{ i + 1 }}
            </span>
            <span
              v-if="i < stepLabels.length - 1"
              class="w-6 h-0.5 rounded-full"
              :class="i < stepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'"
            />
          </div>
        </div>
      </div>

      <div
        class="rounded-[1.75rem] border bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-amber-500/5 dark:shadow-none border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <div v-if="step === 'loading'" class="py-10 flex flex-col items-center gap-3">
          <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl text-amber-500 animate-spin" />
          <p class="text-sm font-semibold text-slate-500">Yuklanmoqda…</p>
        </div>

        <div v-else-if="step === 'unavailable'" class="py-6 text-center space-y-4">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="text-xl" />
          </div>
          <p class="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ error || 'Telegram Mini App ichida oching.' }}
          </p>
        </div>

        <template v-else-if="step === 'route'">
          <label class="block space-y-2">
            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Qayerdan — qayerga
            </span>
            <textarea
              v-model="routeText"
              rows="4"
              maxlength="500"
              placeholder="Masalan: Chilonzor 15-kvartal → Sergeli bozori, 2 kishi"
              class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-4 py-3.5 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
          </label>
          <p class="text-[12px] text-slate-400 leading-snug">
            Manzil, yo'nalish va odamlar sonini yozing. Ovozli xabar hozircha bot orqali.
          </p>
          <button
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            :disabled="!canSubmitRoute"
            @click="goToPhone"
          >
            Keyingi — telefon
          </button>
        </template>

        <template v-else-if="step === 'phone'">
          <div class="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-4 py-3 text-[13px] text-amber-900 dark:text-amber-100 leading-relaxed">
            <span class="font-bold">Marshrut:</span>
            {{ routeText }}
          </div>

          <label class="block space-y-2">
            <span class="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Telefon raqam
            </span>
            <input
              v-model="phoneInput"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="998901234567"
              class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-4 py-3.5 text-[16px] font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </label>

          <button
            type="button"
            class="w-full py-3 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-sm active:scale-[0.98] transition-all"
            @click="onRequestPhone"
          >
            <font-awesome-icon icon="fa-brands fa-telegram" class="mr-1.5" />
            Telegram orqali raqam yuborish
          </button>

          <div class="flex gap-2 pt-1">
            <button
              type="button"
              class="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm active:scale-[0.98]"
              @click="goBackToRoute"
            >
              Orqaga
            </button>
            <button
              type="button"
              class="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
              :disabled="busy || !canSubmitPhone"
              @click="submitOrder"
            >
              <font-awesome-icon v-if="busy" icon="fa-solid fa-spinner" class="animate-spin mr-1.5" />
              Buyurtma berish
            </button>
          </div>
        </template>

        <template v-else-if="step === 'active'">
          <div class="text-center space-y-2 pb-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              E'lon yuborildi
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Haydovchilar tez orada bog'lanadi. Shofyor topilgach pastdagi tugmani bosing.
            </p>
          </div>

          <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 space-y-2 text-[14px]">
            <p><span class="font-bold text-slate-400">Marshrut:</span> {{ activeOrder?.route || routeText }}</p>
            <p v-if="activeOrder?.phone"><span class="font-bold text-slate-400">Tel:</span> +{{ activeOrder.phone }}</p>
          </div>

          <button
            type="button"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50"
            :disabled="busy"
            @click="confirmDriverFound"
          >
            🚗 Shofyor topdim
          </button>
          <button
            type="button"
            class="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 font-bold text-sm active:scale-[0.98] disabled:opacity-50"
            :disabled="busy"
            @click="cancelOrder"
          >
            ❌ Buyurtmani bekor qilish
          </button>
        </template>

        <template v-else-if="step === 'done'">
          <div class="py-4 text-center space-y-4">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-2xl">
              ✅
            </div>
            <p class="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ doneMessage }}
            </p>
            <button
              type="button"
              class="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm active:scale-[0.98]"
              @click="closeOrNew"
            >
              {{ doneIsCancel ? 'Yangi buyurtma' : 'Yopish' }}
            </button>
          </div>
        </template>

        <p
          v-if="error && step !== 'unavailable'"
          class="text-[13px] font-semibold text-red-500 text-center leading-snug"
        >
          {{ error }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { closeTelegramMiniApp, markTelegramCloseOnBack } from '~/utils/telegramMiniAppBack'
import { usePassengerTaxi } from '~/composables/passenger/usePassengerTaxi'

definePageMeta({ layout: false })

const {
  step,
  routeText,
  phoneInput,
  activeOrder,
  error,
  busy,
  doneMessage,
  firstName,
  canSubmitRoute,
  canSubmitPhone,
  goToPhone,
  goBackToRoute,
  requestTelegramPhone,
  submitOrder,
  confirmDriverFound,
  cancelOrder,
  startNewOrder,
} = usePassengerTaxi()

const stepLabels = ['Marshrut', 'Telefon', 'Tayyor']

const stepIndex = computed(() => {
  if (step.value === 'route') return 0
  if (step.value === 'phone') return 1
  if (step.value === 'active' || step.value === 'done') return 2
  return 0
})

function stepDotClass(i: number) {
  const active = i <= stepIndex.value
  return active
    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
}

const headline = computed(() => {
  if (step.value === 'active') return 'Buyurtmangiz faol'
  if (step.value === 'done') return 'Tayyor!'
  const name = firstName.value
  return name ? `Salom, ${name}!` : 'Taksi chaqirish'
})

const subtitle = computed(() => {
  if (step.value === 'route') return 'Qayerdan va qayerga borishingizni yozing — haydovchilar ko\'radi.'
  if (step.value === 'phone') return 'Aloqa uchun telefon raqamingiz kerak.'
  if (step.value === 'active') return 'Haydovchi topilgach kontaktni yopish uchun tugmani bosing.'
  if (step.value === 'done') return 'Zo\'r Taksi xizmatidan foydalanganingiz uchun rahmat.'
  return 'Bir necha qadamda tez buyurtma bering.'
})

const doneIsCancel = computed(() => doneMessage.value.toLowerCase().includes('bekor'))

async function onRequestPhone() {
  const ok = await requestTelegramPhone()
  if (!ok) {
    error.value = 'Telefon ruxsati berilmadi yoki qo\'llab-quvvatlanmaydi.'
  }
}

function handleBack() {
  if (step.value === 'phone') {
    goBackToRoute()
    return
  }
  if (closeTelegramMiniApp()) return
  if (import.meta.client && window.history.length > 1) {
    useRouter().back()
  }
}

function closeOrNew() {
  if (doneIsCancel.value) {
    startNewOrder()
    return
  }
  closeTelegramMiniApp()
}

onMounted(() => {
  markTelegramCloseOnBack()
})
</script>
