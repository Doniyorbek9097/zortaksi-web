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

function readLsActiveUserId(): string | null {
  if (!import.meta.client) return null
  try {
    return localStorage.getItem(ACTIVE_USER_KEY)
  } catch {
    return null
  }
}

function readLsActiveToken(): string | null {
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

/** Tanlangan hisob tokeni zt_accounts da bormi */
export function isStoredAccountToken(token: string | null | undefined): boolean {
  if (!import.meta.client || !token) return false
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return false
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return false
    return list.some((a: any) => a?.token && a.token === token)
  } catch {
    return false
  }
}

export function readActiveUserId(): string | null {
  if (!import.meta.client) return null
  if (memoryUserId) return memoryUserId
  return readLsActiveUserId()
}

export function readActiveToken(): string | null {
  if (!import.meta.client) return null
  if (memoryToken) return memoryToken
  return readLsActiveToken()
}

export function writeActiveSession(userId: string | null, token: string | null) {
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
 * - Server: FAQAT shu so'rov cookie
 * - Client: xotira → LS dagi TANLANGAN hisob → cookie
 * Cookie bo'sh bo'lsa LS dan tiriltirmaydi (begona qurilma xavfsizligi).
 */
export function resolveAuthToken(cookieToken?: string | null): string | null {
  if (!import.meta.client) {
    return cookieToken || null
  }
  if (memoryToken) return memoryToken

  // Cookie bor — tanlangan hisob (LS) ustun (refreshdan keyin switch saqlansin)
  if (cookieToken) {
    const lsToken = readLsActiveToken()
    if (lsToken && lsToken !== cookieToken && isStoredAccountToken(lsToken)) {
      return lsToken
    }
    return cookieToken
  }

  return null
}

/**
 * Refresh / boot: LS dagi tanlangan hisobni cookie ga yozish.
 * Cookie bo'sh bo'lsa — tiriltirmaydi.
 */
export function syncSelectedAccountToCookie(
  setCookie: (token: string | null) => void
): { userId: string; token: string } | null {
  if (!import.meta.client) return null

  const lsToken = readLsActiveToken()
  const lsUserId = readLsActiveUserId()
  if (!lsToken || !lsUserId || !isStoredAccountToken(lsToken)) {
    return null
  }

  setMemorySession(lsUserId, lsToken)
  writeAuthCookie(lsToken)
  setCookie(lsToken)
  return { userId: lsUserId, token: lsToken }
}

export function clearActiveAuth() {
  if (import.meta.client) {
    memoryToken = null
    memoryUserId = null
  }
  writeAuthCookie(null)
  if (!import.meta.client) return
  try {
    localStorage.removeItem(ACTIVE_USER_KEY)
    localStorage.removeItem(ACTIVE_TOKEN_KEY)
  } catch { /* */ }
}

export function clearAllAuthStorage() {
  clearActiveAuth()
  if (!import.meta.client) return
  try {
    localStorage.removeItem(ACCOUNTS_KEY)
  } catch { /* */ }
}

export function findUserIdByToken(token: string | null | undefined): string | null {
  if (!import.meta.client || !token) return null
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return null
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return null
    const acc = list.find((a: any) => a?.token && a.token === token)
    return acc?.userId != null ? String(acc.userId) : null
  } catch {
    return null
  }
}
