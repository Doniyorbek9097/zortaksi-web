/**
 * Safe-area CSS o'zgaruvchilari.
 * Flutter / Android WebView — host allaqachon SafeArea beradi → webda 0.
 * Aks holda katta env() (50–100px+) tabbar ostida bo'shliq ochadi.
 */

import { isFlutterWebView, isPwaStandalone } from '~/utils/appEmbed'
import { isAndroidDevice } from '~/utils/devicePlatform'
import { mightBeTelegramMiniApp } from '~/utils/telegramStartRedirect'

const MAX_TOP = 28
const MAX_BOTTOM = 34

/** Android system WebView (Chrome Custom Tab emas) */
function isAndroidSystemWebView(): boolean {
  const ua = navigator.userAgent || ''
  if (!/Android/i.test(ua)) return false
  // "; wv)" — classic Android WebView belgisі
  if (/; wv\)/i.test(ua)) return true
  return false
}

function isTelegramMiniApp(): boolean {
  try {
    const tg = window.Telegram?.WebApp
    if (!tg) return false
    if (tg.initData) return true
    const p = String(tg.platform || '')
    return !!p && p !== 'unknown'
  } catch {
    return false
  }
}

function isIosStandalone(): boolean {
  const ua = navigator.userAgent || ''
  const ios = /iPhone|iPad|iPod/i.test(ua)
  if (!ios) return false
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return standalone
}

/** env(safe-area-inset-*) ni px da o'qish */
function readEnvInset(side: 'top' | 'bottom'): number {
  try {
    const el = document.createElement('div')
    el.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;padding-${side}:env(safe-area-inset-${side},0px)`
    document.documentElement.appendChild(el)
    const raw = side === 'top' ? getComputedStyle(el).paddingTop : getComputedStyle(el).paddingBottom
    el.remove()
    const n = parseFloat(raw || '0')
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function setSafeVars(top: number, bottom: number) {
  const root = document.documentElement
  root.style.setProperty('--zt-safe-top', `${Math.max(0, top)}px`)
  root.style.setProperty('--zt-safe-bottom', `${Math.max(0, bottom)}px`)
}

export function applyZtSafeArea() {
  if (!import.meta.client) return

  // Flutter / host WebView — pastki padding kerak emas
  if (
    isFlutterWebView() ||
    (isAndroidSystemWebView() && !isTelegramMiniApp() && !mightBeTelegramMiniApp())
  ) {
    setSafeVars(0, 0)
    document.documentElement.dataset.ztEmbed = 'webview'
    return
  }

  document.documentElement.dataset.ztEmbed =
    isTelegramMiniApp() || mightBeTelegramMiniApp() ? 'telegram' : 'browser'

  // Telegram o'z pluginida safeAreaInset beradi — shu yerda faqat fallback
  if (isTelegramMiniApp()) {
    const tg = window.Telegram?.WebApp
    const top = Math.min(Math.max(0, Number(tg?.safeAreaInset?.top) || 0), MAX_TOP)
    const bottom = Math.min(Math.max(0, Number(tg?.safeAreaInset?.bottom) || 0), MAX_BOTTOM)
    // Agar TG inset 0 bo'lsa env ham katta bo'lishi mumkin — env ni ham cap qilamiz
    if (top > 0 || bottom > 0) {
      setSafeVars(top, bottom)
      return
    }
  }

  // iOS PWA home indicator — kichik pad
  if (isIosStandalone()) {
    setSafeVars(
      Math.min(readEnvInset('top'), MAX_TOP),
      Math.min(readEnvInset('bottom'), MAX_BOTTOM),
    )
    return
  }

  if (isPwaStandalone() && isAndroidDevice()) {
    setSafeVars(0, 0)
    return
  }

  setSafeVars(0, 0)
}

export default defineNuxtPlugin(() => {
  applyZtSafeArea()
  // WebView ba'zan kech UA/bridge beradi
  requestAnimationFrame(() => applyZtSafeArea())
  setTimeout(() => applyZtSafeArea(), 300)
  setTimeout(() => applyZtSafeArea(), 1200)
  setTimeout(() => applyZtSafeArea(), 3500)
})
