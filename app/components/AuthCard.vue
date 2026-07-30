<template>
  <div class="relative min-h-screen overflow-hidden flex flex-col items-center px-4 py-4 text-slate-900 dark:text-slate-100">
    <div class="pointer-events-none absolute inset-0 bg-slate-50 dark:bg-slate-950" />
    <div class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#2AABEE]/15 dark:bg-[#2AABEE]/10 blur-3xl" />
    <div class="pointer-events-none absolute bottom-0 right-0 w-[220px] h-[220px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl" />

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
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-[#2AABEE]">
            ZorTaksi · Telegram
          </p>
          <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ stepMeta.title }}
          </h1>
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug max-w-[280px] mx-auto">
            {{ stepMeta.subtitle }}
          </p>
        </div>

        <div class="flex items-center justify-center gap-1.5">
          <template v-for="(s, i) in visibleSteps" :key="s.key">
            <div
              class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
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
          class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake"
        >
          {{ form.error }}
        </div>

        <template v-if="currentStep === 'register'">
          <BasePhoneInput
            v-model="form.phoneLocal"
            label="Telegram telefon raqami"
            :loading="authStore.isLoading"
            :disabled="authStore.isLoading"
            @submit="handleSendCode"
          />

          <p class="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-snug -mt-1">
            Telegram'da ro'yxatdan o'tgan raqamni kiriting (998…)
          </p>

          <button
            type="button"
            :disabled="authStore.isLoading || !isPhoneValid"
            class="w-full py-3 px-5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            @click="handleSendCode"
          >
            <span v-if="authStore.isLoading" class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Yuborilmoqda…
            </span>
            <span v-else class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-paper-plane" />
              Kodni Telegramga yuborish
            </span>
          </button>
        </template>

        <template v-else-if="currentStep === 'verify'">
          <div class="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Raqam</p>
              <p class="text-[13px] font-black text-slate-900 dark:text-white tabular-nums truncate">
                {{ formattedPhoneDisplay }}
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 text-[11px] font-black text-sky-500 hover:underline"
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
            class="w-full py-2.5 text-[11px] font-black text-sky-500 hover:text-sky-600 disabled:opacity-45"
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
            class="w-full py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
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

      <p class="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 px-3 leading-snug">
        Davom etish orqali siz Telegram akkauntingiz orqali ZorTaksi ga kirasiz.
      </p>
    </main>

    <div class="relative z-10 h-3" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'
import { useAccountStore } from '../stores/account.store'
import BaseSmsInput from './base/SmsInput.vue'
import BasePasswordInput from './base/PasswordInput.vue'
import BasePhoneInput from './base/PhoneInput.vue'
import { isValidIntlPhone, normalizeTo998 } from '~/utils/phone'
import { resolvePostAuthPath } from '~/utils/userRole'
import { getApiErrorMessage } from '~/utils/apiError'

const authStore = useAuthStore()
const route = useRoute()

const referralRef = useCookie<string | null>('referral_ref', {
  maxAge: 7 * 24 * 60 * 60,
  path: '/',
  sameSite: 'lax',
})

onMounted(() => {
  const q = route.query.ref
  if (typeof q === 'string' && q.trim()) {
    referralRef.value = q.trim()
  }
})

type Step = 'register' | 'verify' | 'password'
const currentStep = ref<Step>('register')

const allSteps = [
  { key: 'register' as const, label: 'Telefon' },
  { key: 'verify' as const, label: 'Kod' },
  { key: 'password' as const, label: 'Parol' },
]

/** Parol faqat kerak bo‘lganda stepperda */
const visibleSteps = computed(() =>
  currentStep.value === 'password' ? allSteps : allSteps.slice(0, 2)
)

const stepMeta = computed(() => {
  if (currentStep.value === 'register') {
    return {
      title: 'Xush kelibsiz',
      subtitle: 'Telegram raqamingizni davlat kodi bilan kiriting',
    }
  }
  if (currentStep.value === 'verify') {
    return {
      title: 'Kodni kiriting',
      subtitle: deliveryHint.value || `Kod +${phoneDigits.value} raqamidagi Telegram ilovangizga yuborildi`,
    }
  }
  return {
    title: 'Himoya',
    subtitle: 'Telegram 2FA parolini kiriting',
  }
})

const iconShellClass = computed(() => {
  if (currentStep.value === 'verify') {
    return 'bg-white dark:bg-slate-900 border-emerald-200/70 dark:border-emerald-800/50'
  }
  if (currentStep.value === 'password') {
    return 'bg-white dark:bg-slate-900 border-amber-200/70 dark:border-amber-800/50'
  }
  return 'bg-white dark:bg-slate-900 border-sky-200/80 dark:border-sky-800/50'
})

const stepIndex = computed(() =>
  visibleSteps.value.findIndex((s) => s.key === currentStep.value)
)

const stepChipClass = (key: Step) => {
  const i = visibleSteps.value.findIndex((s) => s.key === key)
  if (i === stepIndex.value) return 'bg-[#2AABEE]/12 text-[#2AABEE]'
  if (i < stepIndex.value) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  return 'bg-slate-100 dark:bg-slate-900 text-slate-400'
}

const stepDotClass = (key: Step) => {
  const i = visibleSteps.value.findIndex((s) => s.key === key)
  if (i === stepIndex.value) return 'bg-[#2AABEE] text-white'
  if (i < stepIndex.value) return 'bg-emerald-500 text-white'
  return 'bg-slate-300 dark:bg-slate-700 text-white'
}

const form = reactive({
  phoneLocal: '',
  code: '',
  password: '',
  error: '',
})
const deliveryHint = ref('')
const canResendSms = ref(false)

const phoneDigits = computed(() => {
  const raw = form.phoneLocal.replace(/\D/g, '')
  return normalizeTo998(raw) || raw
})
const isPhoneValid = computed(() => isValidIntlPhone(phoneDigits.value))
const formattedPhoneDisplay = computed(() => (phoneDigits.value ? `+${phoneDigits.value}` : ''))

const clearReferral = () => {
  referralRef.value = null
}

const goHomeAfterAuth = async (user?: { role?: string | null } | null) => {
  await navigateTo(resolvePostAuthPath(user ?? authStore.user, route.query.next))
}

/** Login — joriy hisobni multi-account ro'yxatiga yozadi (boshqa hisoblarni o'chirmaydi) */
const adoptFreshSession = (user: any) => {
  try {
    const accountStore = useAccountStore()
    accountStore.load()
    if (user) accountStore.ensureCurrent(user)
  } catch { /* */ }
}

const handleSendCode = async (opts?: { forceSms?: boolean }) => {
  if (authStore.isLoading || !isPhoneValid.value) return
  form.error = ''
  if (!opts?.forceSms) deliveryHint.value = ''
  try {
    const response = await authStore.sendCode(phoneDigits.value, opts)
    if (response.success) {
      deliveryHint.value =
        response.data?.message ||
        `Kod +${phoneDigits.value} raqamidagi Telegram ilovangizga yuborildi`
      canResendSms.value = !!response.data?.canResendSms
      if (!opts?.forceSms) currentStep.value = 'verify'
    } else {
      form.error = response.message || 'Xatolik yuz berdi'
    }
  } catch (error: any) {
    form.error = error.userMessage || getApiErrorMessage(error, 'Server bilan aloqa uzildi')
  }
}

const handleResendSms = () => handleSendCode({ forceSms: true })

const handleVerifyCode = async () => {
  if (authStore.isLoading) return
  form.error = ''
  try {
    const response = await authStore.verifyCode(
      phoneDigits.value,
      form.code,
      referralRef.value || undefined
    )

    if (response.success) {
      if (response.needPassword || response.data?.needPassword) {
        currentStep.value = 'password'
      } else {
        clearReferral()
        const user = response.data?.user ?? authStore.user
        adoptFreshSession(user)
        await goHomeAfterAuth(user)
      }
    } else if (response.needPassword || response.data?.needPassword) {
      currentStep.value = 'password'
    } else {
      form.error = response.message || 'Kod noto\'g\'ri'
    }
  } catch (error: any) {
    form.error = error.userMessage || getApiErrorMessage(error, 'Xatolik yuz berdi')
  }
}

const handleVerifyPassword = async () => {
  if (authStore.isLoading || !form.password) return
  form.error = ''
  try {
    const response = await authStore.verifyPassword(
      phoneDigits.value,
      form.password,
      referralRef.value || undefined
    )
    if (response.success) {
      clearReferral()
      const user = response.data?.user ?? authStore.user
      adoptFreshSession(user)
      await goHomeAfterAuth(user)
    } else {
      form.error = response.message || 'Parol noto\'g\'ri'
    }
  } catch (error: any) {
    form.error = error.userMessage || getApiErrorMessage(error, 'Xatolik yuz berdi')
  }
}

const handleBack = () => {
  if (currentStep.value === 'password') currentStep.value = 'verify'
  else if (currentStep.value === 'verify') currentStep.value = 'register'
  else navigateTo('/')
}
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
