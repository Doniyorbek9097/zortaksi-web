/**
 * Backend `/media/...` yo'llarini to'liq URL ga aylantiradi.
 * Avatar yo'q bo'lsa ham userId bo'yicha `/media/avatars/{id}.jpg` sinab ko'riladi.
 */
export function useMediaUrl() {
  const config = useRuntimeConfig()

  const mediaBase = computed(() =>
    String(config.public.socketUrl || '').replace(/\/$/, '')
  )

  const resolve = (path?: string | null): string | undefined => {
    const p = String(path || '').trim()
    if (!p) return undefined
    if (/^https?:\/\//i.test(p) || p.startsWith('blob:') || p.startsWith('data:')) {
      return p
    }
    const normalized = p.startsWith('/') ? p : `/${p}`
    return `${mediaBase.value}${normalized}`
  }

  const avatarUrl = (pathOrUserId?: string | null, userId?: string | null): string | undefined => {
    if (pathOrUserId && String(pathOrUserId).includes('/')) {
      return resolve(pathOrUserId)
    }
    const id = String(userId || pathOrUserId || '').replace(/\D/g, '')
    if (!id) return undefined
    return resolve(`/media/avatars/${id}.jpg`)
  }

  return { resolve, avatarUrl, mediaBase }
}
