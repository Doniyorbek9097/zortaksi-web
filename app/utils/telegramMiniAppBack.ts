/**
 * Telegram bot / guruh tugmasidan to'g'ridan-to'g'ri chat ochilganda
 * orqaga bosish Mini App ni yopadi (tg.close).
 */
const TG_CLOSE_ON_BACK = 'zt:tg-close-on-back'

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

/** Chat sahifasida orqaga — Mini App yopish (botdan kirilgan bo'lsa) */
export function tryTelegramCloseOnChatBack(path: string): boolean {
  if (!shouldTelegramCloseOnBack() || !isTelegramChatEntryPath(path)) return false
  return closeTelegramMiniApp()
}
