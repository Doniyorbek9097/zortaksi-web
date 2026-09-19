<template>
  <div
    class="relative min-h-[100dvh] w-full overflow-x-hidden flex flex-col px-3 py-3 text-slate-800"
  >
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-sky-50" />
    <div class="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-200/40 blur-3xl" />
    <div class="pointer-events-none absolute bottom-20 left-0 w-48 h-48 rounded-full bg-sky-200/40 blur-3xl" />

    <header class="relative z-10 w-full max-w-sm mx-auto flex items-center gap-2.5 mb-3">
      <button
        type="button"
        class="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="handleBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="text-sm" />
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold uppercase tracking-widest text-amber-600">
          ZorTaksi
        </p>
        <h1 class="text-lg font-black tracking-tight truncate text-slate-900">
          {{ headline }}
        </h1>
      </div>
      <span class="text-2xl shrink-0" aria-hidden="true">🚕</span>
    </header>

    <main class="relative z-10 w-full max-w-sm mx-auto flex-1 flex flex-col gap-3">
      <PassengerTaxiStepper
        v-if="step !== 'unavailable' && step !== 'done'"
        :current="stepIndex"
        :can-go-back="canGoBackToStep"
        @go="goToStep"
      />

      <div
        class="flex-1 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/60 p-4 space-y-3.5"
      >
        <div
          v-if="step === 'route'"
          class="text-[15px] text-slate-600 leading-relaxed space-y-1"
        >
          <p class="font-semibold text-slate-800">
            Qayerdan qayerga nechi kishi yoki pochta bormi?
          </p>
          <p class="text-slate-500">
            Barchasi shu yerga yozing — batafsil...
          </p>
        </div>
        <p
          v-else-if="step !== 'unavailable' && step !== 'done'"
          class="text-[15px] text-slate-600 leading-relaxed"
        >
          {{ subtitle }}
        </p>

        <div v-if="step === 'unavailable'" class="py-4 text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center text-lg">
            <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          </div>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ error || 'Telegram Mini App ichida oching.' }}
          </p>
        </div>

        <template v-else-if="step === 'route'">
          <label class="block space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Buyurtma matni
            </span>
            <textarea
              ref="routeTextareaRef"
              :value="routeText"
              rows="4"
              maxlength="500"
              enterkeyhint="next"
              placeholder="Masalan: Chilonzor 15-kvartal → Sergeli bozori, 2 kishi, pochta yo'q"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base leading-relaxed resize-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300"
              @input="onRouteInput"
            />
          </label>
          <button
            type="button"
            class="btn-primary"
            :disabled="!canSubmitRoute"
            @click="goToPhone"
          >
            Keyingi
          </button>
        </template>

        <template v-else-if="step === 'phone'">
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-sm text-slate-600 leading-relaxed line-clamp-4">
            <span class="text-amber-600 font-semibold">Yo'l:</span>
            {{ routeText }}
          </div>

          <label class="block space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Telefon raqam
            </span>
            <input
              ref="phoneInputRef"
              :value="phoneInput"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              enterkeyhint="done"
              placeholder="998901234567"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-lg font-semibold tracking-wide text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300"
              @input="onPhoneInput"
            />
          </label>

          <div class="flex gap-2">
            <button
              type="button"
              class="btn-outline flex-1"
              @click="goBackToRoute"
            >
              Orqaga
            </button>
            <button
              type="button"
              class="btn-primary flex-[2]"
              :disabled="busy || !canSubmitPhone"
              @click="submitOrder"
            >
              <font-awesome-icon v-if="busy" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
              Yuborish
            </button>
          </div>
        </template>

        <template v-else-if="step === 'active'">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 w-fit">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span class="text-xs font-bold uppercase tracking-wide text-amber-700">
              Qabul qilindi
            </span>
          </div>

          <div class="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 space-y-1.5 text-[15px] text-slate-600 leading-relaxed">
            <p class="line-clamp-4">
              <span class="text-slate-400 font-semibold">Yo'l:</span>
              {{ activeOrder?.route || routeText }}
            </p>
            <p v-if="activeOrder?.phone || phoneInput">
              <span class="text-slate-400 font-semibold">Tel:</span>
              +{{ activeOrder?.phone || phoneInput }}
            </p>
          </div>

          <button
            type="button"
            class="btn-primary"
            :disabled="busy"
            @click="confirmDriverFound"
          >
            Shofyor topdim
          </button>
          <button
            type="button"
            class="btn-outline"
            :disabled="busy"
            @click="cancelOrder"
          >
            Bekor qilish
          </button>
        </template>

        <template v-else-if="step === 'done'">
          <div class="py-2 text-center space-y-3">
            <div class="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ doneMessage }}
            </p>
            <button
              type="button"
              class="btn-primary"
              @click="startNewOrder"
            >
              Yangi buyurtma
            </button>
          </div>
        </template>

        <p
          v-if="error && step !== 'unavailable'"
          class="text-sm font-semibold text-rose-500 text-center leading-snug"
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

const routeTextareaRef = ref<HTMLTextAreaElement | null>(null)
const phoneInputRef = ref<HTMLInputElement | null>(null)

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
  if (step.value === 'phone') return 'Aloqa uchun telefon raqamingizni kiriting.'
  if (step.value === 'active') return 'Shofyor tez orada bog\'lanadi.'
  return ''
})

function focusRouteTextarea() {
  nextTick(() => {
    requestAnimationFrame(() => {
      routeTextareaRef.value?.focus()
    })
  })
}

function focusPhoneInput() {
  nextTick(() => {
    requestAnimationFrame(() => {
      phoneInputRef.value?.focus()
    })
  })
}

watch(step, (value) => {
  if (value === 'route') focusRouteTextarea()
  if (value === 'phone') focusPhoneInput()
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
  if (step.value === 'route') {
    setTimeout(focusRouteTextarea, 120)
  }
})
</script>

<style scoped>
.btn-primary {
  @apply w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all disabled:opacity-40;
}

.btn-outline {
  @apply py-3 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-800 font-bold text-base active:scale-[0.98] transition-all disabled:opacity-40;
}
</style>
