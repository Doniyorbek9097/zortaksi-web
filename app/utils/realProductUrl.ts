import { openTelegramExternalUrl } from '~/utils/telegramLinks'

export function normalizeRealProductUrl(raw?: string | null): string {
  const v = String(raw || '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  if (v.startsWith('/')) return v

  const pathLike = v.replace(/^\/+/, '')

  if (/^(driver|admin|auth|passenger)(\/|$)/i.test(pathLike)) {
    return `/${pathLike}`
  }

  if (/^[a-z0-9/_-]+$/i.test(pathLike) && !pathLike.includes('.')) {
    return `/${pathLike}`
  }

  return `https://${pathLike}`
}

export type RealProductLink =
  | { kind: 'internal'; path: string }
  | { kind: 'external'; href: string }

export function parseRealProductLink(raw?: string | null): RealProductLink | null {
  const normalized = normalizeRealProductUrl(raw)
  if (!normalized) return null
  if (/^https?:\/\//i.test(normalized)) {
    return { kind: 'external', href: normalized }
  }
  return { kind: 'internal', path: normalized }
}

export function openRealProductLink(raw?: string | null) {
  if (!import.meta.client) return
  const link = parseRealProductLink(raw)
  if (!link) return

  if (link.kind === 'internal') {
    void navigateTo(link.path)
    return
  }

  if (/t\.me/i.test(link.href)) {
    openTelegramExternalUrl(link.href)
    return
  }

  window.open(link.href, '_blank', 'noopener,noreferrer')
}

export function realProductShareUrl(raw: string | null | undefined, appBase: string): string {
  const link = parseRealProductLink(raw)
  if (!link) return appBase.replace(/\/$/, '')
  if (link.kind === 'external') return link.href
  const base = String(appBase || '').replace(/\/$/, '')
  return `${base}${link.path.startsWith('/') ? link.path : `/${link.path}`}`
}
