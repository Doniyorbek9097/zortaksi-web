/** Telegram Mini App visualViewport — faqat barqaror holatda yangilanadi */

import { mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

function isChatOpenPath(): boolean {
  if (!import.meta.client) return false
  return /^\/driver\/chat\/(open|[^/]+)/.test(window.location.pathname)
}

/** Gorizontal siljish — faqat klaviatura ochiq bo'lsa offset qo'llanadi */
export function applyTelegramViewportInsets(): void {
  if (!import.meta.client) return
  if (!mightBeTelegramMiniApp() && document.documentElement.dataset.ztEmbed !== 'telegram') return

  const vv = window.visualViewport
  const root = document.documentElement
  const tg = window.Telegram?.WebApp

  const height =
    Number(tg?.viewportStableHeight) ||
    Number(tg?.viewportHeight) ||
    vv?.height ||
    window.innerHeight

  const keyboardGap = vv ? window.innerHeight - vv.height : 0
  const keyboardOpen = keyboardGap > 80

  // Chat ochilish animatsiyasida offsetLeft noto'g'ri bo'ladi — gorizontal 0
  const useHorizontalOffset = keyboardOpen && !isChatOpenPath()
  const left = useHorizontalOffset ? Math.max(0, vv?.offsetLeft || 0) : 0
  const width = useHorizontalOffset && vv ? Math.max(0, vv.width) : null

  root.style.setProperty('--zt-vv-left', `${left}px`)
  root.style.setProperty('--zt-vv-top', keyboardOpen && vv ? `${Math.max(0, vv.offsetTop)}px` : '0px')
  root.style.setProperty('--zt-vv-width', width != null ? `${width}px` : '100%')
  root.style.setProperty(
    '--zt-vv-height',
    keyboardOpen && vv ? `${Math.max(0, vv.height)}px` : `${height}px`,
  )
  root.style.setProperty('--zt-tg-vh', `${height}px`)

  if (window.scrollX !== 0) window.scrollTo(0, window.scrollY)
}

/** Chat sahifasiga o'tganda noto'g'ri offsetlarni tozalash */
export function resetTelegramViewportInsets(): void {
  if (!import.meta.client) return
  const root = document.documentElement
  root.style.setProperty('--zt-vv-left', '0px')
  root.style.setProperty('--zt-vv-top', '0px')
  root.style.setProperty('--zt-vv-width', '100%')
  if (window.scrollX !== 0) window.scrollTo(0, 0)
}

let wired = false

export function wireTelegramViewportInsets(): void {
  if (!import.meta.client || wired) return
  wired = true

  const sync = () => applyTelegramViewportInsets()
  sync()
  window.visualViewport?.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('scroll', sync)
  window.addEventListener('resize', sync)

  const tg = window.Telegram?.WebApp
  tg?.onEvent?.('viewportChanged', sync)
}

/** Chat fullscreen — gorizontal doim to'liq ekran (offsetLeft ishonchsiz) */
export function telegramChatShellStyle(): Record<string, string> {
  return {
    top: 'var(--zt-vv-top, 0px)',
    left: '0px',
    right: '0px',
    width: '100%',
    height: 'var(--zt-vv-height, var(--zt-tg-vh, 100dvh))',
    maxWidth: '100vw',
  }
}

/** Chat mount — animatsiya tugagach viewport qayta o'lchash */
export function stabilizeTelegramChatViewport(): void {
  if (!import.meta.client) return
  resetTelegramViewportInsets()
  const delays = [0, 50, 150, 320, 600]
  for (const ms of delays) {
    setTimeout(() => {
      resetTelegramViewportInsets()
      applyTelegramViewportInsets()
      window.scrollTo(0, 0)
    }, ms)
  }
}
