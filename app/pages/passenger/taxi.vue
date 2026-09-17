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

        <div v-if="step !== 'unavailable' && step !== 'done'" class="flex items-center justify-center gap-1.5">
          <template v-for="(label, i) in stepLabels" :key="label">
            <button
              type="button"
              class="flex items-center gap-1 rounded-full transition-all"
              :class="canGoBackToStep(i) ? 'cursor-pointer active:scale-95' : 'cursor-default'"
              :disabled="!canGoBackToStep(i)"
              :title="canGoBackToStep(i) ? `${label} — orqaga` : label"
              @click="goToStep(i)"
            >
              <span
                class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                :class="stepDotClass(i)"
              >
                {{ i + 1 }}
              </span>
            </button>
            <span
              v-if="i < stepLabels.length - 1"
              class="w-6 h-0.5 rounded-full"
              :class="i < stepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'"
            />
          </template>
        </div>
      </div>

      <div
        class="rounded-[1.75rem] border bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-amber-500/5 dark:shadow-none border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-4"
      >
        <div v-if="step === 'unavailable'" class="py-6 text-center space-y-4">
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
            Manzil, yo'nalish va odamlar sonini yozing.
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
              Yetkazildi
            </div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
              Buyurtmangiz shofyorlarimizga yetib bordi. Sizga tez orada aloqaga chiqishadi.
            </p>
          </div>

          <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 space-y-2 text-[14px]">
            <p><span class="font-bold text-slate-400">Marshrut:</span> {{ activeOrder?.route || routeText }}</p>
            <p v-if="activeOrder?.phone || phoneInput">
              <span class="font-bold text-slate-400">Tel:</span>
              +{{ activeOrder?.phone || phoneInput }}
            </p>
          </div>

          <p class="text-[12px] text-slate-400 text-center leading-snug">
            Shofyor topilgach pastdagi tugmani bosing.
          </p>

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
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98]"
              @click="startNewOrder"
            >
              🚕 Yangi buyurtma berish
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
  canGoBackToStep,
  goToStep,
  goToPhone,
  goBackToRoute,
  goBackOneStep,
  submitOrder,
  confirmDriverFound,
  cancelOrder,
  startNewOrder,
} = usePassengerTaxi()

const stepLabels = ['Marshrut', 'Telefon', 'Tayyor']

const stepIndex = computed(() => {
  if (step.value === 'route') return 0
  if (step.value === 'phone') return 1
  if (step.value === 'active') return 2
  return 2
})

function stepDotClass(i: number) {
  const active = i <= stepIndex.value
  const clickable = canGoBackToStep(i)
  if (clickable) {
    return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/50'
  }
  return active
    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
}

const headline = computed(() => {
  if (step.value === 'active') return 'Buyurtma qabul qilindi'
  if (step.value === 'done') return 'Tayyor!'
  const name = firstName.value
  return name ? `Salom, ${name}!` : 'Taksi chaqirish'
})

const subtitle = computed(() => {
  if (step.value === 'route') return 'Qayerdan va qayerga borishingizni yozing — haydovchilar ko\'radi.'
  if (step.value === 'phone') return 'Aloqa uchun telefon raqamingiz kerak.'
  if (step.value === 'active') return 'Haydovchilar xabaringizni ko\'rib, tez orada bog\'lanadi.'
  if (step.value === 'done') return 'Zo\'r Taksi xizmatidan foydalanganingiz uchun rahmat.'
  return 'Bir necha qadamda tez buyurtma bering.'
})

function handleBack() {
  if (goBackOneStep()) return
  if (closeTelegramMiniApp()) return
  if (import.meta.client && window.history.length > 1) {
    useRouter().back()
  }
}

onMounted(() => {
  markTelegramCloseOnBack()
})
</script>
