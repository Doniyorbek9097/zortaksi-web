/** Auth cookie — JWT cheksiz; brauzerda uzoq saqlash (10 yil) */
export const AUTH_COOKIE_MAX_AGE_SEC = 10 * 365 * 24 * 60 * 60

/** Har chaqiriqda yangi opts — import paytidagi server secure:true cookie ni buzmasin */
export function getAuthCookieOptions() {
  const isHttps = import.meta.client
    ? window.location.protocol === 'https:'
    : process.env.NODE_ENV === 'production'

  const hostname = import.meta.client ? window.location.hostname : ''
  const onZortaksi =
    hostname === 'zortaksi.uz' ||
    hostname === 'www.zortaksi.uz' ||
    hostname.endsWith('.zortaksi.uz')

  return {
    maxAge: AUTH_COOKIE_MAX_AGE_SEC,
    path: '/',
    watch: true as const,
    sameSite: 'lax' as const,
    secure: isHttps,
    ...(onZortaksi ? { domain: '.zortaksi.uz' as const } : {}),
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
