/**
 * Dashboard uchun sessionStorage kesh yordamchisi.
 * Sahifa qayta ochilganda ma'lumot darhol ko'rinadi, API fon da yangilanadi.
 */

/** JSON ni sessionStorage dan o'qiydi */
export function readSessionCache<T>(key: string): T | null {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** JSON ni sessionStorage ga yozadi */
export function writeSessionCache<T>(key: string, value: T): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* xotira to'lgan yoki private rejim */
  }
}
