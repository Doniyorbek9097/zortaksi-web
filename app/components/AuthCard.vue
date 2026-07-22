<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center py-8 px-4 transition-colors">
    
    <!-- Header / Back Button -->
    <header class="w-full max-w-[380px]">
      <button 
        @click="handleBack" 
        class="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="transition-transform group-hover:-translate-x-0.5" />
        Orqaga
      </button>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-[380px] my-auto space-y-6">
      
      <!-- Icon & Title Section -->
      <div class="text-center space-y-3">
        <div class="relative w-16 h-16 mx-auto">
          <div class="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-2xl blur-xl"></div>
          <div class="relative w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <font-awesome-icon v-if="currentStep === 'register'" icon="fa-solid fa-user" class="text-2xl" />
            <font-awesome-icon v-else-if="currentStep === 'verify'" icon="fa-solid fa-shield-alt" class="text-2xl" />
            <font-awesome-icon v-else-if="currentStep === 'password'" icon="fa-solid fa-lock" class="text-2xl" />
            
            <!-- Animated background elements -->
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500/5 rounded-full blur-md"></div>
          </div>
        </div>

        <div class="space-y-1">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ stepTitles[currentStep].title }}
          </h1>
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">
            {{ stepTitles[currentStep].subtitle }}
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/50 space-y-6">
        
        <!-- Error Message Display -->
        <div v-if="form.error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
          {{ form.error }}
        </div>

        <template v-if="currentStep === 'register'">
          <div class="space-y-2">
            <label class="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
              Telefon raqam
            </label>
            <div class="relative group">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
              </div>
              <input 
                v-model="form.phone"
                type="tel" 
                placeholder="+998 90 123 45 67"
                class="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-base font-bold tracking-wide"
              />
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3 transition-colors">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
              <font-awesome-icon icon="fa-solid fa-check-circle" class="text-sm" />
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Kod <strong class="text-slate-900 dark:text-white font-black">Telegram</strong> ilovangizga yuboriladi. Iltimos, raqamni to'g'ri kiriting.
            </p>
          </div>

          <button 
            @click="handleSendCode"
            :disabled="authStore.isLoading"
            class="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Yuborilmoqda
            </span>
            <span v-else>Kod olish</span>
          </button>
        </template>

        <template v-else-if="currentStep === 'verify'">
          <div class="space-y-1.5 px-1">
            <label class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Telefon raqam</label>
            <div class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              {{ form.phone }}
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>

          <BaseSmsInput 
            v-model="form.code"
            :loading="authStore.isLoading"
            @submit="handleVerifyCode"
          />

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center shrink-0 text-emerald-500">
              <font-awesome-icon icon="fa-solid fa-check-circle" class="text-sm" />
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Telegram ilovasini oching va kelgan <strong class="text-slate-900 dark:text-white font-black">5 xonali</strong> kodni kiriting.
            </p>
          </div>
        </template>

        <template v-else-if="currentStep === 'password'">
          <div class="space-y-1.5 px-1 text-center">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
              Ikki bosqichli himoya
            </div>
          </div>

          <BasePasswordInput 
            v-model="form.password"
            label="Telegram paroli"
            :disabled="authStore.isLoading"
            @keyup.enter="handleVerifyPassword"
          />

          <button 
            @click="handleVerifyPassword"
            :disabled="authStore.isLoading"
            class="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
              Kirilmoqda
            </span>
            <span v-else>Tizimga kirish</span>
          </button>
        </template>

      </div>

    </main>

    <!-- Footer Space -->
    <div class="h-8"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import BaseSmsInput from './base/SmsInput.vue'
import BasePasswordInput from './base/PasswordInput.vue'

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

const stepTitles = {
  register: {
    title: "Xush kelibsiz",
    subtitle: "Raqamingizni kiriting va boshlang"
  },
  verify: {
    title: "Tasdiqlash",
    subtitle: "Kodni telegramdan ko'rib yozing"
  },
  password: {
    title: "Himoya",
    subtitle: "2FA parolingizni kiriting"
  }
}

const form = reactive({
  phone: '+998',
  code: '',
  password: '',
  error: ''
})

const clearReferral = () => {
  referralRef.value = null
}

const handleSendCode = async () => {
  if (authStore.isLoading) return
  form.error = ''
  try {
    const phone = form.phone.replace(/\D/g, '')
    const response = await authStore.sendCode(phone)
    if (response.success) {
      currentStep.value = 'verify'
    } else {
      form.error = response.message || 'Xatolik yuz berdi'
    }
  } catch (error: any) {
    console.error('Send code error:', error)
    form.error = error.response?.data?.message || 'Server bilan aloqa uzildi'
  }
}

const handleVerifyCode = async () => {
  if (authStore.isLoading) return
  form.error = ''
  try {
    const phone = form.phone.replace(/\D/g, '')
    const response = await authStore.verifyCode(phone, form.code, referralRef.value || undefined)
    
    if (response.success) {
      if (response.needPassword || response.data?.needPassword) {
        currentStep.value = 'password'
      } else {
        clearReferral()
        await navigateTo(homeForUser())
      }
    } else {
      if (response.needPassword || response.data?.needPassword) {
        currentStep.value = 'password'
      } else {
        form.error = response.message || 'Kod noto\'g\'ri'
      }
    }
  } catch (error: any) {
    console.error('Verify code error:', error)
    form.error = error.response?.data?.message || 'Xatolik yuz berdi'
  }
}

const homeForUser = () =>
  authStore.user?.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard'

const handleVerifyPassword = async () => {
  if (authStore.isLoading) return
  form.error = ''
  try {
    const phone = form.phone.replace(/\D/g, '')
    const response = await authStore.verifyPassword(phone, form.password, referralRef.value || undefined)
    if (response.success) {
      clearReferral()
      await navigateTo(homeForUser())
    } else {
      form.error = response.message || 'Parol noto\'g\'ri'
    }
  } catch (error: any) {
    console.error('Verify password error:', error)
    form.error = error.response?.data?.message || 'Xatolik yuz berdi'
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
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
