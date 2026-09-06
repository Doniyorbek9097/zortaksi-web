/**
 * Telegram bot / guruh tugmasidan to'g'ridan-to'g'ri chat ochilganda
 * orqaga bosish Mini App ni yopadi (tg.close).
 */
const TG_CLOSE_ON_BACK = 'zt:tg-close-on-back'
const TG_BACK_TRAP = 'zt:tg-back-trap-installed'

/** history.pushState — overlay emas (zt prefiks ishlatilmaydi) */
export const TG_BACK_TRAP_STATE = { tgBackTrap: true as const }

export function markTelegramCloseOnBack(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(TG_CLOSE_ON_BACK, '1')
  } catch {
    /* */
  }
}

export function clearTelegramCloseOnBack(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(TG_CLOSE_ON_BACK)
    clearTelegramChatBackTrap()
  } catch {
    /* */
  }
}

export function shouldTelegramCloseOnBack(): boolean {
  if (!import.meta.client) return false
  try {
    return sessionStorage.getItem(TG_CLOSE_ON_BACK) === '1'
  } catch {
    return false
  }
}

export function isTelegramChatEntryPath(path: string): boolean {
  return String(path || '').startsWith('/driver/chat/')
}

export function isTelegramBackTrapState(state: unknown): boolean {
  return !!(state && typeof state === 'object' && (state as { tgBackTrap?: boolean }).tgBackTrap)
}

/** start_param order_* — bot tugmasidan kirish */
export function maybeMarkTelegramCloseOnBackFromStartParam(
  param: string | null | undefined,
): void {
  const raw = String(param || '').trim()
  if (!raw) return
  if (/^order_/i.test(raw) || /^[a-f0-9]{24}$/i.test(raw)) {
    markTelegramCloseOnBack()
  }
}

/** Telefon back — birinchi bosishda popstate ushlanadi */
export function installTelegramChatBackTrap(): void {
  if (!import.meta.client || !shouldTelegramCloseOnBack()) return
  try {
    if (sessionStorage.getItem(TG_BACK_TRAP) === '1') return
    history.pushState(TG_BACK_TRAP_STATE, '', window.location.href)
    sessionStorage.setItem(TG_BACK_TRAP, '1')
  } catch {
    /* */
  }
}

export function clearTelegramChatBackTrap(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(TG_BACK_TRAP)
  } catch {
    /* */
  }
}

export function closeTelegramMiniApp(): boolean {
  if (!import.meta.client) return false
  try {
    const tg = window.Telegram?.WebApp as { close?: () => void } | undefined
    if (typeof tg?.close === 'function') {
      tg.close()
      clearTelegramCloseOnBack()
      return true
    }
  } catch {
    /* */
  }
  return false
}

/** Chat sahifasida orqaga — Mini App yopish */
export function tryTelegramCloseOnChatBack(path: string): boolean {
  if (!shouldTelegramCloseOnBack() || !isTelegramChatEntryPath(path)) return false
  return closeTelegramMiniApp()
}

/** OS / telefon back (popstate) */
export function handleTelegramPopstateClose(path: string): boolean {
  if (!shouldTelegramCloseOnBack()) return false
  if (isTelegramChatEntryPath(path)) {
    try {
      history.pushState(TG_BACK_TRAP_STATE, '', window.location.href)
    } catch {
      /* */
    }
  }
  return closeTelegramMiniApp()
}
