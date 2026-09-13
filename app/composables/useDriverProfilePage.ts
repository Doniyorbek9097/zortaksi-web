import type { DriverRow } from '~/stores/driver.store'
import { useAuthStore } from '~/stores/auth.store'
import { useDriverStore } from '~/stores/driver.store'
import { useTariffStore } from '~/stores/tariff.store'
import { isTariffActive } from '~/utils/tariffActive'
import { isAdminUser } from '~/utils/userRole'
import { normalizeTelHref } from '~/utils/phone'
import { compactQuery } from '~/utils/navigationQuery'
import { useChatStore } from '~/stores/chat.store'

/**
 * Birlashtirilgan profil sahifasi — Telegram profil + haydovchi ma'lumotlari.
 */
export function useDriverProfilePage() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const store = useDriverStore()
  const tariffStore = useTariffStore()

  const isAdmin = computed(() => isAdminUser(authStore.user))
  const userId = computed(() => decodeURIComponent(String(route.params.userId || '')).trim())

  const {
    profile,
    displayProfile,
    loading: tgLoading,
    error: tgError,
    photoUrls,
    load: reloadTg,
  } = useTelegramUserProfile(userId)

  const driver = ref<DriverRow | null>(null)
  const driverLoading = ref(false)
  const driverError = ref('')
  const success = ref('')
  const balanceOpen = ref(false)
  const tariffOpen = ref(false)
  const limitOpen = ref(false)
  const blockOpen = ref(false)
  const deleteOpen = ref(false)
  const deleting = ref(false)
  const listenerDisplayName = ref('')

  /** Sahifa darhol ochiladi — faqat preview bo'lmasa to'liq spinner */
  const loading = computed(() => tgLoading.value && !displayProfile.value)
  const refreshing = computed(() => tgLoading.value || driverLoading.value)
  const error = computed(() => {
    if (profile.value) return driverError.value
    if (tgError.value && !displayProfile.value) return tgError.value
    return driverError.value
  })

  const paymentsApiPath = computed(() =>
    isAdmin.value && userId.value
      ? `/drivers/${encodeURIComponent(userId.value)}/payments`
      : '',
  )

  const telHref = computed(() => {
    const raw = profile.value?.phone || driver.value?.phone
    return raw ? normalizeTelHref(raw) : ''
  })

  const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

  const formatDate = (value?: string | Date | null) => {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('uz-UZ')
  }

  const tariffCard = computed(() => {
    const d = driver.value
    const t = d?.tariff
    const expireAt = d?.tariffExpireAt || null
    const startedAt = d?.startedAt || null
    const active = isTariffActive({
      active: d?.active,
      tariff: t || (d?.tariffName ? { name: d.tariffName } : null),
      tariffExpireAt: expireAt,
    })
    return {
      name: t?.name || d?.tariffName || 'Tarif ulanmagan',
      info: t?.info || (d?.tariffName ? 'Joriy tarif' : 'Tarif biriktirilmagan'),
      price: t?.price ?? 0,
      expireDays: t?.expireDays ?? Math.max(1, d?.daysLeft ?? 1),
      startDate: formatDate(startedAt),
      endDate: formatDate(expireAt),
      startedAt,
      expireAt,
      active,
    }
  })

  const goBack = () => {
    if (import.meta.client && window.history.length > 1) router.back()
    else if (isAdmin.value) navigateTo('/admin/drivers')
    else navigateTo('/driver/orders')
  }

  const loadDriver = async () => {
    if (!userId.value) return
    driverLoading.value = true
    driverError.value = ''
    const apiPath = isAdmin.value
      ? `/drivers/${encodeURIComponent(userId.value)}`
      : `/drivers/${encodeURIComponent(userId.value)}/profile`
    try {
      const res = await useApi(apiPath)
      if (res?.success) {
        driver.value = res.data
        listenerDisplayName.value = String(res.data?.listenerDisplayName || '')
      } else driver.value = null
    } catch {
      driver.value = null
    } finally {
      driverLoading.value = false
    }
  }

  const reload = async () => {
    void loadDriver()
    await reloadTg()
  }

  const openChat = async () => {
    const id = userId.value
    if (!id) return
    const chatStore = useChatStore()
    const displayName =
      displayProfile.value?.name ||
      profile.value?.name ||
      String(route.query.name || '').trim()

    const chatId = String(route.query.chatId || '').trim()
    if (chatId) {
      await navigateTo({
        path: `/driver/chat/${chatId}`,
        query: compactQuery({ name: displayName }),
      })
      return
    }

    const orderId = String(route.query.orderId || '').trim()
    if (orderId) {
      const existing =
        chatStore.chats.find(
          (c) =>
            String(c.orderId || '') === orderId &&
            String(c.peer?.userId || '') === id,
        ) || chatStore.chats.find((c) => String(c.orderId || '') === orderId)

      if (existing?._id) {
        await navigateTo({
          path: `/driver/chat/${existing._id}`,
          query: compactQuery({
            open: 'order',
            orderId,
            name: displayName,
          }),
        })
        return
      }

      await navigateTo({
        path: '/driver/chat/open',
        query: compactQuery({
          open: 'order',
          orderId,
          userId: id,
          name: displayName,
          phone: String(route.query.phone || '').trim() || undefined,
          username: String(route.query.username || '').trim() || undefined,
        }),
      })
      return
    }

    if (isAdmin.value && driver.value) {
      try {
        const res = await useApi('/chats/support', {
          method: 'POST',
          body: { driverUserId: driver.value.id },
        })
        if (res.success && res.data?._id) {
          await navigateTo({
            path: `/driver/chat/${res.data._id}`,
            query: { name: driver.value.name || 'Haydovchi', support: '1' },
          })
          return
        }
      } catch {
        /* */
      }
    }

    await navigateTo({
      path: '/driver/chat/open',
      query: compactQuery({
        open: 'user',
        userId: id,
        name: displayName,
      }),
    })
  }

  const onCall = () => {
    if (!telHref.value || !import.meta.client) return
    window.location.href = telHref.value
  }

  const saveBalance = async (amount: number) => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    try {
      await store.adjustBalance(driver.value.id, amount)
      balanceOpen.value = false
      success.value = 'Balans yangilandi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Balans saqlanmadi'
    }
  }

  const onPaymentPage = () => {
    if (driver.value?.id && isAdmin.value) {
      navigateTo(`/admin/pay/${encodeURIComponent(driver.value.id)}`)
    }
  }

  const openTariff = async () => {
    if (!isAdmin.value) return
    tariffOpen.value = true
    if (!tariffStore.tariffs.length) {
      try {
        await tariffStore.fetchTariffs()
      } catch {
        /* */
      }
    }
  }

  const saveTariff = async (payload: { tariffId: string; deductFromBalance: boolean }) => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    try {
      await store.assignTariff(driver.value.id, payload.tariffId, {
        deductFromBalance: payload.deductFromBalance,
      })
      tariffOpen.value = false
      success.value = 'Tarif yangilandi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Tarif biriktirilmadi'
    }
  }

  const saveLimit = async (payload: { days: number; hours: number }) => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    try {
      await store.applyCustomLimit(driver.value.id, payload)
      limitOpen.value = false
      success.value = 'Limit berildi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Limit berilmadi'
    }
  }

  const saveListenerDisplayName = async () => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    try {
      await store.setListenerDisplayName(driver.value.id, listenerDisplayName.value.trim())
      success.value = 'Tinglovchi nomi saqlandi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Nom saqlanmadi'
    }
  }

  const confirmBlock = async () => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    try {
      await store.setActive(driver.value.id, !driver.value.active)
      blockOpen.value = false
      success.value = driver.value.active ? 'Bloklandi' : 'Faollashtirildi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Saqlanmadi'
    }
  }

  const toggleListenGroups = async () => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    success.value = ''
    const next = !driver.value.listenGroups
    try {
      await store.setListenGroups(driver.value.id, next)
      success.value = next
        ? 'Guruh tinglash yoqildi — userbot endi tinglaydi'
        : 'Guruh tinglash o‘chirildi'
      await loadDriver()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || 'Tinglash sozlamasi saqlanmadi'
    }
  }

  const confirmDelete = async () => {
    if (!driver.value || !isAdmin.value) return
    driverError.value = ''
    deleting.value = true
    try {
      await store.deleteDriver(driver.value.id)
      deleteOpen.value = false
      await navigateTo('/admin/drivers')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      driverError.value = err?.response?.data?.message || "O'chirib bo'lmadi"
    } finally {
      deleting.value = false
    }
  }

  watch(userId, () => { void reload() }, { immediate: true })
  watch(isAdmin, () => { void loadDriver() })

  usePullToRefresh(reload)

  return {
    isAdmin,
    userId,
    profile,
    displayProfile,
    photoUrls,
    loading,
    refreshing,
    error,
    success,
    driver,
    driverLoading,
    paymentsApiPath,
    telHref,
    tariffCard,
    balanceOpen,
    tariffOpen,
    limitOpen,
    listenerDisplayName,
    blockOpen,
    deleteOpen,
    deleting,
    tariffStore,
    formatMoney,
    goBack,
    openChat,
    onCall,
    saveBalance,
    onPaymentPage,
    openTariff,
    saveTariff,
    saveLimit,
    saveListenerDisplayName,
    confirmBlock,
    toggleListenGroups,
    confirmDelete,
    reload,
  }
}
