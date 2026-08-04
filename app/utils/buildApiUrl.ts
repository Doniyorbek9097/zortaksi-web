/** SSR da relative /api/v1 → to'g'ridan backend; brauzerda Nuxt proxy (same-origin) */
export function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = baseUrl.replace(/\/$/, '')

  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}${normalizedPath}`
  }

  if (import.meta.client) {
    return `${base}${normalizedPath}`
  }

  const direct =
    process.env.NUXT_SSR_API_BACKEND ||
    process.env.NUXT_API_PROXY_TARGET ||
    process.env.NUXT_DEV_API_BACKEND ||
    process.env.NUXT_PUBLIC_DEV_API_BACKEND ||
    (process.env.NODE_ENV === 'production'
      ? 'https://api.zortaksi.uz'
      : 'http://127.0.0.1:5000')
  const backendRoot = direct.replace(/\/$/, '').replace(/\/api\/v1$/, '')
  return `${backendRoot}/api/v1${normalizedPath}`
}
