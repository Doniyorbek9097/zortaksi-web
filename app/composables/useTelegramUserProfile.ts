export type TelegramUserProfile = {
  userId: string
  name: string
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
  bio?: string
  photos: string[]
  presence: {
    online: boolean
    label: string
    lastSeenAt?: string
    kind?: string
  }
  isRegisteredDriver?: boolean
}

/**
 * Telegram uslubidagi foydalanuvchi profili — rasmlar, bio, telefon.
 */
export function useTelegramUserProfile(userId: Ref<string> | ComputedRef<string>) {
  const route = useRoute()
  const { resolve, avatarUrl } = useMediaUrl()

  const profile = ref<TelegramUserProfile | null>(null)
  const loading = ref(false)
  const error = ref('')

  const photoUrls = computed(() => {
    const raw = profile.value?.photos || []
    const urls = raw
      .map((p) => resolve(p) || avatarUrl(p, profile.value?.userId))
      .filter(Boolean) as string[]
    if (urls.length) return urls
    const fallback = avatarUrl(undefined, profile.value?.userId)
    return fallback ? [fallback] : []
  })

  const load = async () => {
    const id = String(unref(userId) || '').trim()
    if (!id) {
      error.value = 'Foydalanuvchi topilmadi'
      return
    }
    loading.value = true
    error.value = ''
    try {
      const res = await useApi(`/users/${encodeURIComponent(id)}/telegram-profile`, {
        params: {
          chatId: route.query.chatId || undefined,
          orderId: route.query.orderId || undefined,
        },
      })
      if (res?.success && res.data) {
        profile.value = res.data as TelegramUserProfile
      } else {
        error.value = res?.message || 'Profil yuklanmadi'
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message || err?.message || 'Profil yuklanmadi'
    } finally {
      loading.value = false
    }
  }

  watch(userId, () => { void load() }, { immediate: true })

  return {
    profile,
    loading,
    error,
    photoUrls,
    load,
  }
}
