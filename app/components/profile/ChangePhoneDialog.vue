<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-sm max-h-[90dvh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Telefon raqamini o'zgartirish</h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  Telegram tasdiqlash kodi orqali
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <div
              v-if="error"
              class="mt-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
            >
              {{ error }}
            </div>

            <div class="mt-4 space-y-3.5">
              <template v-if="step === 'phone'">
                <div class="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5">
                  <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Joriy raqam</p>
                  <p class="text-[13px] font-black text-slate-900 dark:text-white tabular-nums">
                    {{ currentPhoneDisplay }}
                  </p>
                </div>

                <BasePhoneInput
                  v-model="phoneLocal"
                  label="Yangi Telegram telefon raqami"
                  :loading="loading"
                  :disabled="loading"
                  @submit="handleSendCode"
                />

                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Telegram hisobingizga bog'langan yangi raqamni kiriting. Boshqa Telegram hisobining raqami ishlamaydi.
                </p>

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
                  <span v-else>Kodni yuborish</span>
                </button>
              </template>

              <template v-else-if="step === 'code'">
                <div class="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 px-3 py-2.5 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Yangi raqam</p>
                    <p class="text-[13px] font-black text-slate-900 dark:text-white tabular-nums truncate">
                      {{ formattedPhoneDisplay }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 text-[11px] font-black text-sky-500 hover:underline"
                    @click="step = 'phone'"
                  >
                    O'zgartirish
                  </button>
                </div>

                <p v-if="deliveryHint" class="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-snug">
                  {{ deliveryHint }}
                </p>

                <BaseSmsInput v-model="code" :loading="loading" @submit="handleVerifyCode" />

                <button
                  v-if="canResendSms"
                  type="button"
                  :disabled="loading"
                  class="w-full py-2.5 text-[11px] font-black text-sky-500 hover:text-sky-600 disabled:opacity-45"
                  @click="handleResendSms"
                >
                  SMS orqali olish
                </button>
              </template>

              <template v-else>
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
                    Tasdiqlanmoqda…
                  </span>
                  <span v-else>Tasdiqlash</span>
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import BaseSmsInput from '~/components/base/SmsInput.vue'
import BasePasswordInput from '~/components/base/PasswordInput.vue'
import BasePhoneInput from '~/components/base/PhoneInput.vue'
import { getAuthPhoneValidationError, isValidIntlPhone, normalizeAuthPhoneDigits } from '~/utils/phone'
import { getApiErrorMessage } from '~/utils/apiError'

interface Props {
  modelValue: boolean
  currentPhone?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPhone: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const authStore = useAuthStore()
const accountStore = useAccountStore()

type Step = 'phone' | 'code' | 'password'
const step = ref<Step>('phone')
const phoneLocal = ref('')
const code = ref('')
const password = ref('')
const error = ref('')
const deliveryHint = ref('')
const canResendSms = ref(false)
const loading = ref(false)

const currentPhoneDisplay = computed(() => {
  const digits = String(props.currentPhone || '').replace(/\D/g, '')
  return digits ? `+${digits}` : '—'
})

const phoneDigits = computed(() => {
  const raw = phoneLocal.value.replace(/\D/g, '')
  return normalizeAuthPhoneDigits(raw) || raw
})

const isPhoneValid = computed(() => {
  const parsed = normalizeAuthPhoneDigits(phoneLocal.value)
  if (parsed) return getAuthPhoneValidationError(parsed) === null
  return isValidIntlPhone(phoneDigits.value)
})

const formattedPhoneDisplay = computed(() => (phoneDigits.value ? `+${phoneDigits.value}` : ''))

const resetForm = () => {
  step.value = 'phone'
  phoneLocal.value = ''
  code.value = ''
  password.value = ''
  error.value = ''
  deliveryHint.value = ''
  canResendSms.value = false
}

const close = () => {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) resetForm()
  }
)

const handleSendCode = async (opts?: { forceSms?: boolean }) => {
  if (loading.value) return
  error.value = ''

  const parsed = normalizeAuthPhoneDigits(phoneLocal.value)
  if (!parsed) {
    error.value =
      getAuthPhoneValidationError(phoneLocal.value.replace(/\D/g, '')) ||
      `Telefon raqami noto'g'ri. Mamlakat kodi bilan kiriting (masalan: 998901234567).`
    return
  }
  const phoneErr = getAuthPhoneValidationError(parsed)
  if (phoneErr) {
    error.value = phoneErr
    return
  }

  const currentDigits = String(props.currentPhone || '').replace(/\D/g, '')
  if (currentDigits && currentDigits === parsed) {
    error.value = 'Bu sizning joriy raqamingiz'
    return
  }

  if (!opts?.forceSms) deliveryHint.value = ''
  loading.value = true
  try {
    const res = await authStore.sendPhoneChangeCode(parsed, opts)
    if (res.success) {
      deliveryHint.value =
        res.data?.message ||
        `Kod +${phoneDigits.value} raqamidagi Telegram ilovangizga yuborildi`
      canResendSms.value = !!res.data?.canResendSms
      if (!opts?.forceSms) step.value = 'code'
    } else {
      error.value = res.message || 'Xatolik yuz berdi'
    }
  } catch (e: any) {
    error.value = e.userMessage || getApiErrorMessage(e, 'Server bilan aloqa uzildi')
  } finally {
    loading.value = false
  }
}

const handleResendSms = () => handleSendCode({ forceSms: true })

const handleVerifyCode = async () => {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await authStore.verifyPhoneChangeCode(phoneDigits.value, code.value)
    if (res.success) {
      if (authStore.user) accountStore.ensureCurrent(authStore.user)
      emit('success')
      close()
    } else if (res.needPassword) {
      step.value = 'password'
    } else {
      error.value = res.message || 'Kod noto\'g\'ri'
    }
  } catch (e: any) {
    error.value = e.userMessage || getApiErrorMessage(e, 'Xatolik yuz berdi')
  } finally {
    loading.value = false
  }
}

const handleVerifyPassword = async () => {
  if (loading.value || !password.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await authStore.verifyPhoneChangePassword(phoneDigits.value, password.value)
    if (res.success) {
      if (authStore.user) accountStore.ensureCurrent(authStore.user)
      emit('success')
      close()
    } else {
      error.value = res.message || 'Parol noto\'g\'ri'
    }
  } catch (e: any) {
    error.value = e.userMessage || getApiErrorMessage(e, 'Xatolik yuz berdi')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}

.cd-sheet-enter-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.cd-sheet-leave-active {
  transition: transform 0.2s ease, opacity 0.15s ease;
}
.cd-sheet-enter-from,
.cd-sheet-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
@media (min-width: 768px) {
  .cd-sheet-enter-from,
  .cd-sheet-leave-to {
    transform: translateY(12px) scale(0.98);
  }
}
</style>
