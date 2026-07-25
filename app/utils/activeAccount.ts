/** Multi-account: localStorage + client-only xotira (switch paytida) */

export const ACCOUNTS_KEY = 'zt_accounts'
export const ACTIVE_USER_KEY = 'zt_active_user'
export const ACTIVE_TOKEN_KEY = 'zt_active_token'

/**
 * FAQAT CLIENT. Serverda module-level token saqlash MUMKIN EMAS —
 * bitta Node processda User A tokeni User B so'roviga oqib o'tadi.
 */
let memoryToken: string | null = null
let memoryUserId: string | null = null

export function setMemorySession(userId: string | null, token: string | null) {
  if (!import.meta.client) return
  memoryUserId = userId ? String(userId) : null
  memoryToken = token || null
}

export function getMemoryUserId(): string | null {
  if (!import.meta.client) return null
  return memoryUserId
}

export function readActiveUserId(): string | null {
  if (!import.meta.client) return null
  if (memoryUserId) return memoryUserId
  try {
    return localStorage.getItem(ACTIVE_USER_KEY)
  } catch {
    return null
  }
}

export function readActiveToken(): string | null {
  if (!import.meta.client) return null
  if (memoryToken) return memoryToken
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
  // Serverda hech narsa yozilmaydi (cross-request leak yo'q)
  if (!import.meta.client) return
  setMemorySession(userId, token)
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

/**
 * Token manbai:
 * - Server (SSR): FAQAT shu so'rovdagi cookie — xotira ishlatilmaydi
 * - Client: xotira (switch) → cookie
 */
export function resolveAuthToken(cookieToken?: string | null): string | null {
  if (!import.meta.client) {
    return cookieToken || null
  }
  if (memoryToken) return memoryToken
  return cookieToken || null
}

/** To'liq chiqish — cookie, xotira, active keys, account tokenlari */
export function clearAllAuthStorage() {
  if (import.meta.client) {
    memoryToken = null
    memoryUserId = null
  }
  writeAuthCookie(null)
  if (!import.meta.client) return
  try {
    localStorage.removeItem(ACTIVE_USER_KEY)
    localStorage.removeItem(ACTIVE_TOKEN_KEY)
    localStorage.removeItem(ACCOUNTS_KEY)
  } catch { /* */ }
}
