/** Multi-account: localStorage — asosiy manba (mobil cookie ishonchsiz) */

export const ACCOUNTS_KEY = 'zt_accounts'
export const ACTIVE_USER_KEY = 'zt_active_user'
export const ACTIVE_TOKEN_KEY = 'zt_active_token'

export function readActiveUserId(): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(ACTIVE_USER_KEY)
  } catch {
    return null
  }
}

export function readActiveToken(): string | null {
  if (!import.meta.client) return null
  try {
    const direct = localStorage.getItem(ACTIVE_TOKEN_KEY)
    if (direct) return direct

    const userId = localStorage.getItem(ACTIVE_USER_KEY)
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!userId || !raw) return null
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return null
    const acc = list.find((a: any) => String(a?.userId) === String(userId))
    return acc?.token || null
  } catch {
    return null
  }
}

export function writeActiveSession(userId: string | null, token: string | null) {
  if (!import.meta.client) return
  try {
    if (userId && token) {
      localStorage.setItem(ACTIVE_USER_KEY, String(userId))
      localStorage.setItem(ACTIVE_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY)
      localStorage.removeItem(ACTIVE_TOKEN_KEY)
    }
  } catch { /* private mode */ }
}

/** Eski Secure / non-Secure cookie larni tozalab, yangisini yozadi */
export function writeAuthCookie(token: string | null) {
  if (!import.meta.client) return
  const isHttps = window.location.protocol === 'https:'
  const clear = [
    'auth_token=; Path=/; Max-Age=0',
    'auth_token=; Path=/; Max-Age=0; SameSite=Lax',
    'auth_token=; Path=/; Max-Age=0; SameSite=Lax; Secure',
    'auth_token=; Path=/; Max-Age=0; SameSite=None; Secure',
  ]
  for (const c of clear) document.cookie = c

  if (!token) return
  const secure = isHttps ? '; Secure' : ''
  document.cookie = `auth_token=${token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${secure}`
}

/** API / socket uchun eng ishonchli token */
export function resolveAuthToken(cookieToken?: string | null): string | null {
  const stored = readActiveToken()
  if (stored) return stored
  return cookieToken || null
}
