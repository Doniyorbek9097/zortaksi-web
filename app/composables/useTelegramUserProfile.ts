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
 * Route query dan darhol preview ko'rsatadi (sahifa tez ochiladi).
 */
export function useTelegramUserProfile(userId: Ref<string> | ComputedRef<string>) {
  const route = useRoute()
  const { resolve, avatarUrl } = useMediaUrl()

  const profile = ref<TelegramUserProfile | null>(null)
  const loading = ref(false)
  const error = ref('')

  /** Avatar bosilganda uzatilgan ma'lumot — API kutmasdan ko'rsatiladi */
  const previewProfile = computed<TelegramUserProfile | null>(() => {
    const id = String(unref(userId) || '').trim()
    if (!id) return null

    const name = String(route.query.name || '').trim()
    const avatarQ = String(route.query.avatar || '').trim()
    const photos: string[] = []

    if (avatarQ) {
      const u = resolve(avatarQ) || avatarUrl(avatarQ, id)
      if (u) photos.push(avatarQ)
    }
    if (!photos.length) photos.push('')

    return {
      userId: id,
      name: name || id,
      photos,
      presence: { online: false, label: 'yuklanmoqda...' },
    }
  })

  const displayProfile = computed(() => profile.value || previewProfile.value)

  const photoUrls = computed(() => {
    const id = String(unref(userId) || '').trim()
    const fromApi = profile.value?.photos || []
    const fromPreview = previewProfile.value?.photos || []

    const raw = fromApi.length ? fromApi : fromPreview
    const seen = new Set<string>()
    const urls: string[] = []

    for (const p of raw) {
      const url = p
        ? resolve(p) || avatarUrl(p, id)
        : avatarUrl(undefined, id)
      if (!url || seen.has(url)) continue
      seen.add(url)
      urls.push(url)
    }

    if (urls.length) return urls

    const fallback = avatarUrl(undefined, id)
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

  return {
    profile,
    previewProfile,
    displayProfile,
    loading,
    error,
    photoUrls,
    load,
  }
}
