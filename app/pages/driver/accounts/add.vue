<template>
  <div class="relative min-h-[100dvh] overflow-hidden flex flex-col items-center px-4 py-4 text-slate-900 dark:text-slate-100">
    <!-- Atmosphere -->
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
              v-if="step === 'phone'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-7 h-7 text-[#2AABEE]"
              aria-hidden="true"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <font-awesome-icon
              v-else-if="step === 'code'"
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
            Yangi hisob · Telegram
          </p>
          <h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ stepMeta.title }}
          </h1>
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug max-w-[280px] mx-auto">
            {{ stepMeta.subtitle }}
          </p>
        </div>

        <!-- Steps -->
        <div class="flex items-center justify-center gap-1.5">
          <template v-for="(s, i) in steps" :key="s.key">
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
              v-if="i < steps.length - 1"
              class="w-3 h-px bg-slate-200 dark:bg-slate-800"
            />
          </template>
        </div>
      </div>

      <div
        class="rounded-2xl p-4 space-y-3.5 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-black/40"
      >
        <div
          v-if="error"
          class="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake"
        >
          {{ error }}
        </div>

        <template v-if="step === 'phone'">
          <div class="rounded-xl border border-[#2AABEE]/25 bg-[#2AABEE]/8 dark:bg-[#2AABEE]/10 px-3 py-2.5 flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#2AABEE] text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div class="min-w-0 space-y-0.5">
              <p class="text-[12px] font-black text-slate-900 dark:text-white leading-snug">
                Hisob qo‘shish — Telegram orqali
              </p>
              <p class="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug">
                Kod SMS emas — Telegram ilovasiga keladi.
              </p>
            </div>
          </div>

          <BasePhoneInput
            v-model="phoneLocal"
            label="Telegram telefon raqami"
            :loading="loading"
            :disabled="loading"
            @submit="handleSendCode"
          />

          <button
            type="button"
            :disabled="loading || !isPhoneValid"
            class="w-full py-3 px-5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            @click="handleSendCode"
          >
            <span v-if="loading" class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Yuborilmoqda…
            </span>
            <span v-else class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-paper-plane" />
              Kodni Telegramga yuborish
            </span>
          </button>
        </template>

        <template v-else-if="step === 'code'">
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
              @click="step = 'phone'"
            >
              O‘zgartirish
            </button>
          </div>

          <BaseSmsInput v-model="code" :loading="loading" @submit="handleVerifyCode" />

          <div class="rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/80 dark:bg-emerald-950/30 px-3 py-2.5 flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <font-awesome-icon icon="fa-solid fa-check-circle" class="text-xs" />
            </div>
            <p class="text-[10px] text-slate-600 dark:text-slate-400 leading-snug font-medium">
              <strong class="text-slate-900 dark:text-white font-black">Telegram</strong>ni oching va kelgan
              <strong class="text-slate-900 dark:text-white font-black">kodni</strong> shu yerga yozing.
            </p>
          </div>
        </template>

        <template v-else>
          <div class="flex justify-center">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
              Ikki bosqichli himoya
            </div>
          </div>

          <BasePasswordInput
            v-model="password"
            label="Telegram 2FA paroli"
            :disabled="loading"
            @keyup.enter="handleVerifyPassword"
          />

          <button
            type="button"
            :disabled="loading || !password"
            class="w-full py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            @click="handleVerifyPassword"
          >
            <span v-if="loading" class="inline-flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Ulanmoqda…
            </span>
            <span v-else>Hisobni qo‘shish</span>
          </button>
        </template>
      </div>

      <p class="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 px-3 leading-snug">
        Yangi hisob Telegram orqali ulanadi va buyurtmalarni kuzatishga qo‘shiladi.
      </p>
    </main>

    <div class="relative z-10 h-3" />
  </div>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account.store'
import BaseSmsInput from '~/components/base/SmsInput.vue'
import BasePasswordInput from '~/components/base/PasswordInput.vue'
import BasePhoneInput from '~/components/base/PhoneInput.vue'

definePageMeta({
  layout: false,
})

const accountStore = useAccountStore()

type Step = 'phone' | 'code' | 'password'
const step = ref<Step>('phone')

const phoneLocal = ref('')
const code = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const steps = [
  { key: 'phone' as const, label: 'Telefon' },
  { key: 'code' as const, label: 'Kod' },
  { key: 'password' as const, label: 'Parol' },
]

const stepOrder: Step[] = ['phone', 'code', 'password']

const stepMeta = computed(() => {
  if (step.value === 'phone') {
    return {
      title: 'Hisob qo‘shish',
      subtitle: 'Telegram raqamingizni kiriting — yangi hisob shu orqali ulanadi',
    }
  }
  if (step.value === 'code') {
    return {
      title: 'Kodni kiriting',
      subtitle: 'Tasdiqlash kodi Telegram ilovangizga yuborildi',
    }
  }
  return {
    title: 'Himoya',
    subtitle: 'Telegram ikki bosqichli parolingizni kiriting',
  }
})

const iconShellClass = computed(() => {
  if (step.value === 'code') {
    return 'bg-white dark:bg-slate-900 border-emerald-200/70 dark:border-emerald-800/50'
  }
  if (step.value === 'password') {
    return 'bg-white dark:bg-slate-900 border-amber-200/70 dark:border-amber-800/50'
  }
  return 'bg-white dark:bg-slate-900 border-sky-200/80 dark:border-sky-800/50'
})

const stepIndex = computed(() => stepOrder.indexOf(step.value))

const stepChipClass = (key: Step) => {
  const i = stepOrder.indexOf(key)
  if (i === stepIndex.value) return 'bg-[#2AABEE]/12 text-[#2AABEE]'
  if (i < stepIndex.value) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  return 'bg-slate-100 dark:bg-slate-900 text-slate-400'
}

const stepDotClass = (key: Step) => {
  const i = stepOrder.indexOf(key)
  if (i === stepIndex.value) return 'bg-[#2AABEE] text-white'
  if (i < stepIndex.value) return 'bg-emerald-500 text-white'
  return 'bg-slate-300 dark:bg-slate-700 text-white'
}

const phoneDigits = computed(() => {
  const local = phoneLocal.value.replace(/\D/g, '').slice(0, 9)
  return local.length === 9 ? `998${local}` : ''
})

const isPhoneValid = computed(() => phoneDigits.value.length === 12)

const formattedPhoneDisplay = computed(() => {
  const d = phoneLocal.value.replace(/\D/g, '').slice(0, 9)
  const a = d.slice(0, 2)
  const b = d.slice(2, 5)
  const c = d.slice(5, 7)
  const e = d.slice(7, 9)
  let out = '+998'
  if (a) out += ` (${a}`
  if (a.length === 2) out += ')'
  if (b) out += ` ${b}`
  if (c) out += `-${c}`
  if (e) out += `-${e}`
  return out
})

const handleSendCode = async () => {
  if (loading.value || !isPhoneValid.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await accountStore.sendCode(phoneDigits.value)
    if (res.success) step.value = 'code'
    else error.value = res.message || 'Xatolik yuz berdi'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Server bilan aloqa uzildi'
  } finally {
    loading.value = false
  }
}

const handleVerifyCode = async () => {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await accountStore.verifyCode(phoneDigits.value, code.value)
    if (res.success) {
      await finish()
    } else if (res.needPassword || res.data?.needPassword) {
      step.value = 'password'
    } else {
      error.value = res.message || 'Kod noto\'g\'ri'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Xatolik yuz berdi'
  } finally {
    loading.value = false
  }
}

const handleVerifyPassword = async () => {
  if (loading.value || !password.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await accountStore.verifyPassword(phoneDigits.value, password.value)
    if (res.success) await finish()
    else error.value = res.message || 'Parol noto\'g\'ri'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Xatolik yuz berdi'
  } finally {
    loading.value = false
  }
}

const finish = async () => {
  if (import.meta.client) window.location.href = '/driver/profile'
  else await navigateTo('/driver/profile')
}

const handleBack = () => {
  if (step.value === 'password') step.value = 'code'
  else if (step.value === 'code') step.value = 'phone'
  else navigateTo('/driver/profile')
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
