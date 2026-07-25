/** Har chaqiriqda yangi opts — import paytidagi server secure:true cookie ni buzmasin */
export function getAuthCookieOptions() {
  const isHttps = import.meta.client
    ? window.location.protocol === 'https:'
    : process.env.NODE_ENV === 'production'

  return {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    watch: true as const,
    sameSite: 'lax' as const,
    secure: isHttps,
  }
}

/** @deprecated — getAuthCookieOptions() ishlating; moslik uchun getter */
export const authCookieOptions = {
  get maxAge() {
    return getAuthCookieOptions().maxAge
  },
  get path() {
    return getAuthCookieOptions().path
  },
  get watch() {
    return true as const
  },
  get sameSite() {
    return 'lax' as const
  },
  get secure() {
    return getAuthCookieOptions().secure
  },
}
