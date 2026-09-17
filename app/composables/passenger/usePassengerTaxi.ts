import {
  getTelegramWebAppInitData,
  getTelegramWebAppUser,
  hapticError,
  hapticSuccess,
} from '~/utils/telegramWebApp'
import { normalizePhoneDigits } from '~/utils/phone'

export type PassengerOrderView = {
  id: string
  route?: string
  phone?: string
  status?: string
  createdAt?: string | null
}

type Step = 'loading' | 'route' | 'phone' | 'active' | 'done' | 'unavailable'

async function passengerApi<T = unknown>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const initData = getTelegramWebAppInitData()
  if (!initData) {
    throw new Error('Telegram Mini App ichida oching')
  }

  const res = await useApi<{ success: boolean; data?: T; message?: string }>(path, {
    method: (options.method as 'GET' | 'POST') || 'GET',
    body: options.body,
    headers: {
      'X-Telegram-Init-Data': initData,
    },
  })

  if (!res?.success) {
    throw new Error(res?.message || 'So\'rov bajarilmadi')
  }

  return res.data as T
}

export function usePassengerTaxi() {
  const route = useRoute()

  const step = ref<Step>('loading')
  const routeText = ref('')
  const phoneInput = ref('')
  const activeOrder = ref<PassengerOrderView | null>(null)
  const error = ref('')
  const busy = ref(false)
  const doneMessage = ref('')

  const botLaunchGroupId = computed(() => String(route.query.groupId || '').trim())
  const firstName = computed(() => {
    const tg = getTelegramWebAppUser()
    return String(tg?.first_name || tg?.username || '').trim()
  })

  const canSubmitRoute = computed(() => routeText.value.trim().length >= 3)
  const phoneDigits = computed(() => normalizePhoneDigits(phoneInput.value) || '')
  const canSubmitPhone = computed(() => !!phoneDigits.value)

  async function loadActiveOrder() {
    step.value = 'loading'
    error.value = ''

    const initData = getTelegramWebAppInitData()
    if (!initData) {
      step.value = 'unavailable'
      error.value = 'Bu sahifa faqat Telegram ilovasi ichida ishlaydi.'
      return
    }

    try {
      const data = await passengerApi<PassengerOrderView | null>('/passenger/orders/active')
      if (data?.id) {
        activeOrder.value = data
        step.value = 'active'
        return
      }
      activeOrder.value = null
      step.value = 'route'
    } catch (e: unknown) {
      step.value = 'unavailable'
      error.value = (e as Error)?.message || 'Yuklab bo\'lmadi'
    }
  }

  function goToPhone() {
    if (!canSubmitRoute.value) {
      error.value = 'Marshrutni batafsil yozing (kamida 3 belgi).'
      hapticError()
      return
    }
    error.value = ''
    step.value = 'phone'
  }

  function goBackToRoute() {
    error.value = ''
    step.value = 'route'
  }

  async function requestTelegramPhone() {
    const tg = getTelegramWebApp()
    if (!tg?.requestPhoneNumber) return false

    return await new Promise<boolean>((resolve) => {
      try {
        tg.requestPhoneNumber((ok, data) => {
          const digits = normalizePhoneDigits(data?.phone_number)
          if (ok && digits) {
            phoneInput.value = digits
            resolve(true)
            return
          }
          resolve(false)
        })
      } catch {
        resolve(false)
      }
    })
  }

  async function submitOrder() {
    if (!canSubmitPhone.value) {
      error.value = 'To\'g\'ri telefon raqam kiriting.'
      hapticError()
      return
    }

    busy.value = true
    error.value = ''
    try {
      const data = await passengerApi<PassengerOrderView>('/passenger/orders', {
        method: 'POST',
        body: {
          routeDetails: routeText.value.trim(),
          phone: phoneDigits.value,
          botLaunchGroupId: botLaunchGroupId.value || undefined,
        },
      })
      activeOrder.value = data
      step.value = 'active'
      hapticSuccess()
    } catch (e: unknown) {
      error.value = (e as Error)?.message || 'Buyurtma yuborilmadi'
      hapticError()
    } finally {
      busy.value = false
    }
  }

  async function confirmDriverFound() {
    const id = activeOrder.value?.id
    if (!id || busy.value) return

    busy.value = true
    error.value = ''
    try {
      const data = await passengerApi<{
        alreadyBooked?: boolean
        contactHidden?: boolean
      }>(`/passenger/orders/${id}/driver-found`, { method: 'POST' })
      doneMessage.value = data?.alreadyBooked
        ? 'Buyurtma allaqachon band qilingan. Haydovchi tez orada bog\'lanadi.'
        : 'Ajoyib! Kontakt yashirildi. Haydovchi siz bilan bog\'lanadi.'
      step.value = 'done'
      hapticSuccess()
    } catch (e: unknown) {
      error.value = (e as Error)?.message || 'Amal bajarilmadi'
      hapticError()
    } finally {
      busy.value = false
    }
  }

  async function cancelOrder() {
    const id = activeOrder.value?.id
    if (!id || busy.value) return

    busy.value = true
    error.value = ''
    try {
      await passengerApi(`/passenger/orders/${id}/cancel`, { method: 'POST' })
      activeOrder.value = null
      routeText.value = ''
      phoneInput.value = ''
      doneMessage.value = 'Buyurtma bekor qilindi.'
      step.value = 'done'
      hapticSuccess()
    } catch (e: unknown) {
      error.value = (e as Error)?.message || 'Bekor qilib bo\'lmadi'
      hapticError()
    } finally {
      busy.value = false
    }
  }

  function startNewOrder() {
    activeOrder.value = null
    routeText.value = ''
    phoneInput.value = ''
    doneMessage.value = ''
    error.value = ''
    step.value = 'route'
  }

  onMounted(() => {
    void loadActiveOrder()
  })

  return {
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
    goToPhone,
    goBackToRoute,
    requestTelegramPhone,
    submitOrder,
    confirmDriverFound,
    cancelOrder,
    startNewOrder,
    loadActiveOrder,
  }
}
