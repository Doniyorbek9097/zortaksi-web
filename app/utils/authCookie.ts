/** Barcha auth_token useCookie chaqiriqlari bir xil opts ishlatishi kerak */
export function getAuthCookieOptions() {
  const isHttps = import.meta.client
    ? window.location.protocol === 'https:'
    : process.env.NODE_ENV === 'production'

  return {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    watch: true as const,
    sameSite: 'lax' as const,
    // HTTP (masalan telefon orqali lokal IP) da Secure cookie yozilmaydi
    secure: isHttps,
  }
}

/** Moslik uchun — chaqirilgan paytdagi opts */
export const authCookieOptions = getAuthCookieOptions()
