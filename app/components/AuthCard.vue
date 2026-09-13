<template>
  <div class="relative min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex flex-col items-center px-4 py-4 text-slate-900 dark:text-slate-100">
    <div class="pointer-events-none absolute inset-0 bg-slate-50 dark:bg-slate-950" />
    <div class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[min(420px,100vw)] h-[min(420px,100vw)] rounded-full bg-[#2AABEE]/15 dark:bg-[#2AABEE]/10 blur-3xl" />
    <div class="pointer-events-none absolute bottom-0 right-0 w-[min(220px,55vw)] h-[min(220px,55vw)] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl" />

    <header class="relative z-10 w-full max-w-[400px]">
      <button
        type="button"
        class="group inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-sky-500 transition-all active:scale-95"
        @click="handleBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="transition-transform group-hover:-translate-x-0.5" />
        Orqaga
      </button>
    </header>

    <main class="relative z-10 w-full max-w-[400px] my-auto space-y-3.5">
      <div class="text-center space-y-2.5">
        <div class="relative w-14 h-14 mx-auto">
          <div class="absolute inset-0 rounded-2xl bg-[#2AABEE]/25 blur-lg animate-pulse" />
          <div
            class="relative w-full h-full rounded-2xl flex items-center justify-center border shadow-lg overflow-hidden transition-colors duration-300"
            :class="iconShellClass"
          >
            <svg
              v-if="currentStep === 'register'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-7 h-7 text-[#2AABEE]"
              aria-hidden="true"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <font-awesome-icon
              v-else-if="currentStep === 'verify'"
              icon="fa-solid fa-shield-alt"
              class="text-xl text-emerald-500"
            />
            <font-awesome-icon
              v-else
              icon="fa-solid fa-lock"
              class="text-xl text-amber-500"
            />
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-[#2AABEE]">
            ZorTaksi
          </p>
          <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ stepMeta.title }}
          </h1>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug max-w-[300px] mx-auto">
            {{ stepMeta.subtitle }}
          </p>
        </div>

        <div class="flex items-center justify-center gap-1.5 max-w-full overflow-hidden flex-wrap">
          <template v-for="(s, i) in visibleSteps" :key="s.key">
            <div
              class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
              :class="stepChipClass(s.key)"
            >
              <span
                class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
                :class="stepDotClass(s.key)"
              >
                {{ i + 1 }}
              </span>
              {{ s.label }}
            </div>
            <div
              v-if="i < visibleSteps.length - 1"
              class="w-3 h-px bg-slate-200 dark:bg-slate-800"
            />
          </template>
        </div>
      </div>

      <div
        class="rounded-2xl p-4 space-y-3.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-black/40"
      >
        <div
          v-if="form.error"
          class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake"
        >
          {{ form.error }}
        </div>

        <template v-if="currentStep === 'register'">
          <BasePhoneInput
            v-model="form.phoneLocal"
            label="Telefon raqam"
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
            @submit="handleSendCode"
          />

          <button
            type="button"
            :disabled="authStore.isLoading || !isPhoneValid"
            class="w-full py-3.5 px-5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-sm shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            @click="handleSendCode"
          >
            <span v-if="authStore.isLoading" class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Yuborilmoqda…
            </span>
            <span v-else class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-paper-plane" />
              Kod yuborish
            </span>
          </button>
        </template>

        <template v-else-if="currentStep === 'verify'">
          <div class="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Raqam</p>
              <p class="text-base font-black text-slate-900 dark:text-white tabular-nums truncate">
                {{ formattedPhoneDisplay }}
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 text-sm font-black text-sky-500 hover:underline"
              @click="currentStep = 'register'"
            >
              O‘zgartirish
            </button>
          </div>

          <BaseSmsInput
            v-model="form.code"
            :loading="authStore.isLoading"
            @submit="handleVerifyCode"
          />

          <button
            v-if="canResendSms"
            type="button"
            :disabled="authStore.isLoading"
            class="w-full py-2.5 text-sm font-black text-sky-500 hover:text-sky-600 disabled:opacity-45"
            @click="handleResendSms"
          >
            SMS orqali olish
          </button>
        </template>

        <template v-else-if="currentStep === 'password'">
          <BasePasswordInput
            v-model="form.password"
            label="Telegram 2FA paroli"
            :disabled="authStore.isLoading"
            @keyup.enter="handleVerifyPassword"
          />

          <button
            type="button"
            :disabled="authStore.isLoading || !form.password"
            class="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            @click="handleVerifyPassword"
          >
            <span v-if="authStore.isLoading" class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Kirilmoqda…
            </span>
            <span v-else>Tizimga kirish</span>
          </button>
        </template>
      </div>

    </main>

    <div class="relative z-10 h-3" />
  </div>
</template>

<script setup lang="ts">
import BaseSmsInput from './base/SmsInput.vue'
import BasePasswordInput from './base/PasswordInput.vue'
import BasePhoneInput from './base/PhoneInput.vue'
import { useAuthFlow } from '~/composables/auth/useAuthFlow'

const {
  authStore,
  currentStep,
  visibleSteps,
  stepMeta,
  iconShellClass,
  stepChipClass,
  stepDotClass,
  form,
  canResendSms,
  isPhoneValid,
  formattedPhoneDisplay,
  handleSendCode,
  handleResendSms,
  handleVerifyCode,
  handleVerifyPassword,
  handleBack,
} = useAuthFlow()
</script>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
