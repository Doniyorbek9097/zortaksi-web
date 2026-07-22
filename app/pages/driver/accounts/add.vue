<template>
  <div class="min-h-[100dvh] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center py-8 px-4 transition-colors">
    <!-- Back -->
    <header class="w-full max-w-[380px]">
      <button
        type="button"
        class="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
        @click="handleBack"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="transition-transform group-hover:-translate-x-0.5" />
        Orqaga
      </button>
    </header>

    <main class="w-full max-w-[380px] my-auto space-y-6">
      <!-- Icon & Title -->
      <div class="text-center space-y-3">
        <div class="relative w-16 h-16 mx-auto">
          <div class="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-2xl blur-xl" />
          <div class="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-800 shadow-xl">
            <font-awesome-icon v-if="step === 'phone'" icon="fa-solid fa-plus" class="text-2xl" />
            <font-awesome-icon v-else-if="step === 'code'" icon="fa-solid fa-shield-alt" class="text-2xl" />
            <font-awesome-icon v-else icon="fa-solid fa-lock" class="text-2xl" />
          </div>
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ titles[step].title }}</h1>
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">
            {{ titles[step].subtitle }}
          </p>
        </div>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/50 space-y-6">
        <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
          {{ error }}
        </div>

        <!-- PHONE -->
        <template v-if="step === 'phone'">
          <div class="space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Telefon raqam</label>
            <div class="relative group">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
              </div>
              <input
                v-model="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                class="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-base font-bold tracking-wide"
              >
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500">
              <font-awesome-icon icon="fa-solid fa-check-circle" class="text-sm" />
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Kod ushbu <strong class="text-slate-900 dark:text-white font-black">Telegram</strong> hisobiga yuboriladi. Bu hisob buyurtmalarni kuzatishga qo'shiladi.
            </p>
          </div>

          <button
            :disabled="loading"
            class="w-full py-4 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleSendCode"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" /> Yuborilmoqda
            </span>
            <span v-else>Kod olish</span>
          </button>
        </template>

        <!-- CODE -->
        <template v-else-if="step === 'code'">
          <div class="space-y-1.5 px-1">
            <label class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Telefon raqam</label>
            <div class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              {{ phone }}
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          </div>

          <BaseSmsInput v-model="code" :loading="loading" @submit="handleVerifyCode" />

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500">
              <font-awesome-icon icon="fa-solid fa-check-circle" class="text-sm" />
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Telegram ilovasini oching va kelgan <strong class="text-slate-900 dark:text-white font-black">5 xonali</strong> kodni kiriting.
            </p>
          </div>
        </template>

        <!-- PASSWORD -->
        <template v-else>
          <div class="space-y-1.5 px-1 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" /> Ikki bosqichli himoya
            </div>
          </div>

          <BasePasswordInput v-model="password" label="Telegram paroli" :disabled="loading" @keyup.enter="handleVerifyPassword" />

          <button
            :disabled="loading"
            class="w-full py-4 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleVerifyPassword"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" /> Ulanmoqda
            </span>
            <span v-else>Hisobni qo'shish</span>
          </button>
        </template>
      </div>
    </main>

    <div class="h-8" />
  </div>
</template>

<script setup lang="ts">
import { useAccountStore } from '~/stores/account.store'

definePageMeta({
  layout: false,
})

const accountStore = useAccountStore()

type Step = 'phone' | 'code' | 'password'
const step = ref<Step>('phone')

const phone = ref('+998')
const code = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const titles: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: 'Hisob qo\'shish', subtitle: 'Telegram raqamini kiriting' },
  code: { title: 'Tasdiqlash', subtitle: 'Kodni Telegramdan ko\'rib yozing' },
  password: { title: 'Himoya', subtitle: '2FA parolingizni kiriting' },
}

const cleanPhone = () => phone.value.replace(/\D/g, '')

const handleSendCode = async () => {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await accountStore.sendCode(cleanPhone())
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
    const res = await accountStore.verifyCode(cleanPhone(), code.value)
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
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await accountStore.verifyPassword(cleanPhone(), password.value)
    if (res.success) await finish()
    else error.value = res.message || 'Parol noto\'g\'ri'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Xatolik yuz berdi'
  } finally {
    loading.value = false
  }
}

const finish = async () => {
  // verifyCode/verifyPassword muvaffaqiyatli bo'lsa — yangi account qo'shilib,
  // token o'shanga o'tган. Toza holat bilan profilга qaytamiz.
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
