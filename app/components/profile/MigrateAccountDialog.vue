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
                <h3 class="text-lg font-black text-slate-900 dark:text-white">
                  Hisobni yangi Telegramga ko'chirish
                </h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  Balans, tarif va hudud guruhlari yangi hisobga o'tadi
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
                <div class="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 px-3 py-2.5 space-y-1.5">
                  <p class="text-[11px] font-bold text-amber-800 dark:text-amber-300 leading-snug">
                    Spam yoki bloklangan Telegramdan qutulish uchun. Eski hisob o'chirilmaydi, lekin tarif va balans yangi hisobga ko'chadi.
                  </p>
                  <ul class="text-[10px] text-amber-700/90 dark:text-amber-400/90 space-y-0.5 list-disc pl-4">
                    <li>Balans va tarif muddatlari yangi hisobga o'tadi</li>
                    <li>Yangi hisobdagi eski tarif/balans/hudud almashtiriladi</li>
                    <li>Public va private hudud guruhlari yangi hisobga qo'shiladi</li>
                    <li>Eski hisob to'liq tozalanadi va guruhdan chiqariladi</li>
                  </ul>
                </div>

                <BasePhoneInput
                  v-model="phoneLocal"
                  label="Yangi Telegram telefon raqami"
                  :loading="loading"
                  :disabled="loading"
                  @submit="handleSendCode"
                />

                <label class="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    v-model="confirmed"
                    type="checkbox"
                    class="mt-0.5 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span class="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Eski Telegram hisobimdagi tarif va balans yangi hisobga o'tishini va eski hisob faolsizlanishini tushundim.
                  </span>
                </label>

                <button
                  type="button"
                  :disabled="loading || !isPhoneValid || !confirmed"
                  class="w-full py-3 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
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
                    <p class="text-[9px] font-bold uppercase tracking-widest text-slate-400">Yangi Telegram</p>
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
                  label="Yangi Telegram 2FA paroli"
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
                    Ko'chirilmoqda…
                  </span>
                  <span v-else>Ko'chirishni tasdiqlash</span>
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
  fromUserId?: string
}

const props = withDefaults(defineProps<Props>(), {
  fromUserId: '',
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
const confirmed = ref(false)

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
  confirmed.value = false
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

const finishSuccess = (data: any) => {
  const fromId = String(data?.migratedFrom || props.fromUserId || authStore.user?.userId || '')
  const token = data?.authToken
  const user = data?.user
  if (fromId && token && user) {
    accountStore.completeMigration(fromId, user, token)
  }
  emit('success')
  close()
}

const handleSendCode = async (opts?: { forceSms?: boolean }) => {
  if (loading.value || !confirmed.value) return
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

  if (!opts?.forceSms) deliveryHint.value = ''
  loading.value = true
  try {
    const res = await authStore.sendAccountMigrateCode(parsed, opts)
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
    const res = await authStore.verifyAccountMigrateCode(phoneDigits.value, code.value)
    if (res.success) {
      finishSuccess(res.data)
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
    const res = await authStore.verifyAccountMigratePassword(phoneDigits.value, password.value)
    if (res.success) {
      finishSuccess(res.data)
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
