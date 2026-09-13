import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import {
  getAuthPhoneValidationError,
  isValidIntlPhone,
  normalizeAuthPhoneDigits,
} from '~/utils/phone'
import { resolvePostAuthPath } from '~/utils/userRole'
import { getApiErrorMessage } from '~/utils/apiError'

type AuthStep = 'register' | 'verify' | 'password'

/**
 * Kirish / ro'yxatdan o'tish oqimi — telefon, kod, 2FA parol.
 */
export function useAuthFlow() {
  const authStore = useAuthStore()
  const route = useRoute()

  /** Referral — 7 kun cookie da saqlanadi */
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

  const currentStep = ref<AuthStep>('register')

  const allSteps = [
    { key: 'register' as const, label: 'Telefon' },
    { key: 'verify' as const, label: 'Kod' },
    { key: 'password' as const, label: 'Parol' },
  ]

  /** Parol faqat kerak bo'lganda stepperda ko'rinadi */
  const visibleSteps = computed(() =>
    currentStep.value === 'password' ? allSteps : allSteps.slice(0, 2),
  )

  const stepMeta = computed(() => {
    if (currentStep.value === 'register') {
      return {
        title: "Ro'yxatdan o'tish",
        subtitle: 'Telegram raqamingizni kiriting',
      }
    }
    if (currentStep.value === 'verify') {
      return {
        title: 'Tasdiqlash kodi',
        subtitle: deliveryHint.value || `Kod Telegramga yuborildi (+${phoneDigits.value})`,
      }
    }
    return {
      title: 'Parol',
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
    visibleSteps.value.findIndex((s) => s.key === currentStep.value),
  )

  const stepChipClass = (key: AuthStep) => {
    const i = visibleSteps.value.findIndex((s) => s.key === key)
    if (i === stepIndex.value) return 'bg-[#2AABEE]/12 text-[#2AABEE]'
    if (i < stepIndex.value) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    return 'bg-slate-100 dark:bg-slate-900 text-slate-400'
  }

  const stepDotClass = (key: AuthStep) => {
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
    return normalizeAuthPhoneDigits(raw) || raw
  })

  const isPhoneValid = computed(() => {
    const parsed = normalizeAuthPhoneDigits(form.phoneLocal)
    if (parsed) return getAuthPhoneValidationError(parsed) === null
    return isValidIntlPhone(phoneDigits.value)
  })

  const formattedPhoneDisplay = computed(() => (phoneDigits.value ? `+${phoneDigits.value}` : ''))

  const clearReferral = () => {
    referralRef.value = null
  }

  const goHomeAfterAuth = async (user?: { role?: string | null } | null) => {
    await navigateTo(resolvePostAuthPath(user ?? authStore.user, route.query.next))
  }

  /** Yangi sessiyani multi-account ro'yxatiga qo'shish */
  const adoptFreshSession = (user: unknown) => {
    try {
      const accountStore = useAccountStore()
      accountStore.load()
      if (user) accountStore.ensureCurrent(user as Parameters<typeof accountStore.ensureCurrent>[0])
    } catch {
      /* multi-account mavjud emas */
    }
  }

  const handleSendCode = async (opts?: { forceSms?: boolean }) => {
    if (authStore.isLoading) return
    form.error = ''

    const parsed = normalizeAuthPhoneDigits(form.phoneLocal)
    if (!parsed) {
      form.error =
        getAuthPhoneValidationError(form.phoneLocal.replace(/\D/g, '')) ||
        `Telefon raqami noto'g'ri. Mamlakat kodi bilan kiriting (masalan: 998901234567).`
      return
    }
    const phoneErr = getAuthPhoneValidationError(parsed)
    if (phoneErr) {
      form.error = phoneErr
      return
    }
    if (!opts?.forceSms) deliveryHint.value = ''
    try {
      const response = await authStore.sendCode(parsed, opts)
      if (response.success) {
        deliveryHint.value =
          response.data?.message || `Kod Telegramga yuborildi (+${parsed})`
        canResendSms.value = !!response.data?.canResendSms
        if (!opts?.forceSms) currentStep.value = 'verify'
      } else {
        form.error = response.message || 'Xatolik yuz berdi'
      }
    } catch (error: unknown) {
      const err = error as { userMessage?: string }
      form.error = err.userMessage || getApiErrorMessage(error, 'Server bilan aloqa uzildi')
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
        referralRef.value || undefined,
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
        form.error = response.message || "Kod noto'g'ri"
      }
    } catch (error: unknown) {
      const err = error as { userMessage?: string }
      form.error = err.userMessage || getApiErrorMessage(error, 'Xatolik yuz berdi')
    }
  }

  const handleVerifyPassword = async () => {
    if (authStore.isLoading || !form.password) return
    form.error = ''
    try {
      const response = await authStore.verifyPassword(
        phoneDigits.value,
        form.password,
        referralRef.value || undefined,
      )
      if (response.success) {
        clearReferral()
        const user = response.data?.user ?? authStore.user
        adoptFreshSession(user)
        await goHomeAfterAuth(user)
      } else {
        form.error = response.message || "Parol noto'g'ri"
      }
    } catch (error: unknown) {
      const err = error as { userMessage?: string }
      form.error = err.userMessage || getApiErrorMessage(error, 'Xatolik yuz berdi')
    }
  }

  const handleBack = () => {
    if (currentStep.value === 'password') currentStep.value = 'verify'
    else if (currentStep.value === 'verify') currentStep.value = 'register'
    else navigateTo('/')
  }

  return {
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
  }
}
