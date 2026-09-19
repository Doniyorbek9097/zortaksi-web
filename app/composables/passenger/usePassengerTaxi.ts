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

type Step = 'route' | 'phone' | 'active' | 'done' | 'unavailable'

const CACHE_KEY = 'zt:passenger-taxi-state'

type CachedState = {
  groupId: string
  step: Step
  routeText: string
  phoneInput: string
  activeOrder: PassengerOrderView | null
  doneMessage: string
}

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

function readCache(groupId: string): CachedState | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedState
    if (!parsed || parsed.groupId !== groupId) return null
    if (!['route', 'phone', 'active', 'done', 'unavailable'].includes(parsed.step)) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(state: CachedState) {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
  } catch {
    /* */
  }
}

function clearCache() {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {
    /* */
  }
}

export function usePassengerTaxi() {
  const route = useRoute()

  const botLaunchGroupId = computed(() => String(route.query.groupId || '').trim())

  const cached = import.meta.client ? readCache(botLaunchGroupId.value) : null
  const hasInitData = !!getTelegramWebAppInitData()

  const step = ref<Step>(
    !hasInitData
      ? 'unavailable'
      : cached?.step || 'route',
  )
  const routeText = ref(cached?.routeText || '')
  const phoneInput = ref(cached?.phoneInput || '')
  const activeOrder = ref<PassengerOrderView | null>(cached?.activeOrder || null)
  const error = ref(
    !hasInitData ? 'Bu sahifa faqat Telegram ilovasi ichida ishlaydi.' : '',
  )
  const busy = ref(false)
  const doneMessage = ref(cached?.doneMessage || '')

  const firstName = computed(() => {
    const tg = getTelegramWebAppUser()
    return String(tg?.first_name || tg?.username || '').trim()
  })

  const canSubmitRoute = computed(() => routeText.value.trim().length >= 3)
  const phoneDigits = computed(() => normalizePhoneDigits(phoneInput.value) || '')
  const canSubmitPhone = computed(() => !!phoneDigits.value)

  const canGoBackToStep = (index: number) => {
    if (step.value === 'phone' && index === 0) return true
    if (step.value === 'active' && index <= 1) return false
    if (step.value === 'done' || step.value === 'unavailable') return false
    return false
  }

  function persistCache() {
    writeCache({
      groupId: botLaunchGroupId.value,
      step: step.value,
      routeText: routeText.value,
      phoneInput: phoneInput.value,
      activeOrder: activeOrder.value,
      doneMessage: doneMessage.value,
    })
  }

  watch([step, routeText, phoneInput, activeOrder, doneMessage, botLaunchGroupId], persistCache, {
    deep: true,
  })

  function goToStep(index: number) {
    if (index === 0 && canGoBackToStep(0)) {
      goBackToRoute()
    }
  }

  function setRouteText(value: string) {
    routeText.value = String(value ?? '')
  }

  function setPhoneInput(value: string) {
    phoneInput.value = String(value ?? '')
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

  function goBackOneStep() {
    if (step.value === 'phone') {
      goBackToRoute()
      return true
    }
    return false
  }

  async function syncActiveOrderSilent() {
    if (!hasInitData) return
    if (step.value === 'done') return

    try {
      const data = await passengerApi<PassengerOrderView | null>('/passenger/orders/active')
      if (data?.id) {
        activeOrder.value = data
        if (data.route) routeText.value = data.route
        if (data.phone) phoneInput.value = data.phone
        if (step.value === 'route' || step.value === 'phone') {
          step.value = 'active'
        }
        return
      }

      if (step.value === 'active') {
        activeOrder.value = null
        step.value = 'route'
      }
    } catch {
      /* kesh holatini saqlab qolamiz */
    }
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
        ? 'Mijoz haydovchi topdi. Bog\'lanish yopildi.'
        : 'Mijoz haydovchi topdi. Bog\'lanish yopildi.'
      activeOrder.value = null
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
    clearCache()
    void syncActiveOrderSilent()
    if (import.meta.client) {
      window.dispatchEvent(new CustomEvent('zt:passenger-taxi-focus-route'))
    }
  }

  onMounted(() => {
    if (!hasInitData) return
    if (!cached) {
      void syncActiveOrderSilent()
    }
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
    canGoBackToStep,
    goToStep,
    setRouteText,
    setPhoneInput,
    goToPhone,
    goBackToRoute,
    goBackOneStep,
    submitOrder,
    confirmDriverFound,
    cancelOrder,
    startNewOrder,
  }
}
