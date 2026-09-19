<template>
  <div
    class="relative min-h-[100dvh] w-full overflow-x-hidden flex flex-col px-3 py-3 text-slate-100"
  >
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
    <div class="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-sky-500/10 blur-3xl" />
    <div class="pointer-events-none absolute bottom-20 left-0 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />

    <header class="relative z-10 w-full max-w-sm mx-auto flex items-center gap-2 mb-3">
      <button
        type="button"
        class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/15 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="handleBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="text-xs" />
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">
          ZorTaksi
        </p>
        <h1 class="text-base font-black tracking-tight truncate">
          {{ headline }}
        </h1>
      </div>
      <span class="text-xl shrink-0" aria-hidden="true">🚕</span>
    </header>

    <main class="relative z-10 w-full max-w-sm mx-auto flex-1 flex flex-col gap-2.5">
      <PassengerTaxiStepper
        v-if="step !== 'unavailable' && step !== 'done'"
        :current="stepIndex"
        :can-go-back="canGoBackToStep"
        @go="goToStep"
      />

      <div
        class="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md shadow-xl shadow-black/30 p-3.5 space-y-3"
      >
        <p
          v-if="step !== 'unavailable' && step !== 'done'"
          class="text-[11px] text-slate-400 leading-snug"
        >
          {{ subtitle }}
        </p>

        <div v-if="step === 'unavailable'" class="py-4 text-center space-y-2">
          <div class="w-10 h-10 mx-auto rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            {{ error || 'Telegram Mini App ichida oching.' }}
          </p>
        </div>

        <template v-else-if="step === 'route'">
          <label class="block space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Qayerdan — qayerga
            </span>
            <textarea
              :value="routeText"
              rows="3"
              maxlength="500"
              enterkeyhint="next"
              placeholder="Chilonzor → Sergeli, 2 kishi"
              class="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-[14px] leading-relaxed resize-none text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              @input="onRouteInput"
            />
          </label>
          <button
            type="button"
            class="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-40"
            :disabled="!canSubmitRoute"
            @click="goToPhone"
          >
            Keyingi
          </button>
        </template>

        <template v-else-if="step === 'phone'">
          <div class="rounded-xl bg-slate-950/60 border border-white/5 px-3 py-2 text-[12px] text-slate-300 leading-snug line-clamp-3">
            <span class="text-sky-400 font-semibold">Yo'l:</span>
            {{ routeText }}
          </div>

          <label class="block space-y-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Telefon
            </span>
            <input
              :value="phoneInput"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              enterkeyhint="done"
              placeholder="998901234567"
              class="w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-[15px] font-semibold tracking-wide text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              @input="onPhoneInput"
            />
          </label>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-200 font-semibold text-sm active:scale-[0.98]"
              @click="goBackToRoute"
            >
              Orqaga
            </button>
            <button
              type="button"
              class="flex-[2] py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm active:scale-[0.98] disabled:opacity-40"
              :disabled="busy || !canSubmitPhone"
              @click="submitOrder"
            >
              <font-awesome-icon v-if="busy" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
              Yuborish
            </button>
          </div>
        </template>

        <template v-else-if="step === 'active'">
          <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
              Qabul qilindi
            </span>
          </div>

          <div class="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 space-y-1 text-[13px] text-slate-300">
            <p class="line-clamp-3">
              <span class="text-slate-500 font-semibold">Yo'l:</span>
              {{ activeOrder?.route || routeText }}
            </p>
            <p v-if="activeOrder?.phone || phoneInput">
              <span class="text-slate-500 font-semibold">Tel:</span>
              +{{ activeOrder?.phone || phoneInput }}
            </p>
          </div>

          <button
            type="button"
            class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm active:scale-[0.98] disabled:opacity-50"
            :disabled="busy"
            @click="confirmDriverFound"
          >
            Shofyor topdim
          </button>
          <button
            type="button"
            class="w-full py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold text-xs active:scale-[0.98] disabled:opacity-50"
            :disabled="busy"
            @click="cancelOrder"
          >
            Bekor qilish
          </button>
        </template>

        <template v-else-if="step === 'done'">
          <div class="py-2 text-center space-y-3">
            <div class="w-11 h-11 mx-auto rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg">
              ✓
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              {{ doneMessage }}
            </p>
            <button
              type="button"
              class="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm active:scale-[0.98]"
              @click="startNewOrder"
            >
              Yangi buyurtma
            </button>
          </div>
        </template>

        <p
          v-if="error && step !== 'unavailable'"
          class="text-[11px] font-semibold text-rose-400 text-center leading-snug"
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
  setRouteText,
  setPhoneInput,
  goToStep,
  goToPhone,
  goBackToRoute,
  goBackOneStep,
  submitOrder,
  confirmDriverFound,
  cancelOrder,
  startNewOrder,
} = usePassengerTaxi()

const stepIndex = computed(() => {
  if (step.value === 'route') return 0
  if (step.value === 'phone') return 1
  if (step.value === 'active') return 2
  return 2
})

const headline = computed(() => {
  if (step.value === 'active') return 'Kutish'
  if (step.value === 'done') return 'Tayyor'
  const name = firstName.value
  return name ? `Salom, ${name}` : 'Taxi chaqirish'
})

const subtitle = computed(() => {
  if (step.value === 'route') return 'Marshrut va odamlar sonini yozing.'
  if (step.value === 'phone') return 'Aloqa uchun telefon raqam.'
  if (step.value === 'active') return 'Shofyor tez orada bog\'lanadi.'
  return ''
})

function onRouteInput(event: Event) {
  setRouteText((event.target as HTMLTextAreaElement).value)
}

function onPhoneInput(event: Event) {
  setPhoneInput((event.target as HTMLInputElement).value)
}

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
