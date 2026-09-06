/** Telegram Mini App visualViewport → CSS o'zgaruvchilari (gorizontal siljishni oldini oladi) */

export function applyTelegramViewportInsets(): void {
  if (!import.meta.client) return
  if (document.documentElement.dataset.ztEmbed !== 'telegram') return

  const vv = window.visualViewport
  const root = document.documentElement
  const tg = window.Telegram?.WebApp

  const height =
    Number(tg?.viewportStableHeight) ||
    Number(tg?.viewportHeight) ||
    vv?.height ||
    window.innerHeight

  if (vv) {
    root.style.setProperty('--zt-vv-left', `${Math.max(0, vv.offsetLeft)}px`)
    root.style.setProperty('--zt-vv-top', `${Math.max(0, vv.offsetTop)}px`)
    root.style.setProperty('--zt-vv-width', `${Math.max(0, vv.width)}px`)
    root.style.setProperty('--zt-vv-height', `${Math.max(0, vv.height)}px`)
    if (window.scrollX !== 0) window.scrollTo(0, window.scrollY)
  } else {
    root.style.setProperty('--zt-vv-left', '0px')
    root.style.setProperty('--zt-vv-top', '0px')
    root.style.setProperty('--zt-vv-width', '100%')
    root.style.setProperty('--zt-vv-height', `${height}px`)
  }

  root.style.setProperty('--zt-tg-vh', `${height}px`)
}

let wired = false

export function wireTelegramViewportInsets(): void {
  if (!import.meta.client || wired) return
  if (document.documentElement.dataset.ztEmbed !== 'telegram') return
  wired = true

  const sync = () => applyTelegramViewportInsets()
  sync()
  window.visualViewport?.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('scroll', sync)
  window.addEventListener('resize', sync)

  const tg = window.Telegram?.WebApp
  tg?.onEvent?.('viewportChanged', sync)
}

/** Chat fullscreen shell — Telegram da visualViewport bilan to'liq mos */
export function telegramChatShellStyle(): Record<string, string> {
  return {
    left: 'var(--zt-vv-left, 0px)',
    top: 'var(--zt-vv-top, 0px)',
    width: 'var(--zt-vv-width, 100%)',
    height: 'var(--zt-vv-height, var(--zt-tg-vh, 100dvh))',
    maxWidth: '100vw',
  }
}
