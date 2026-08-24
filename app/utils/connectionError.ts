/** API xatosini: internet uzilishi / server / autentifikatsiya */
export type ConnectionErrorReason = 'offline' | 'server' | 'auth' | 'unknown'

export function classifyApiError(error: unknown): ConnectionErrorReason {
  if (!error || typeof error !== 'object') return 'unknown'

  const e = error as {
    response?: { status?: number }
    code?: string
    message?: string
  }

  const status = e.response?.status
  if (status === 401 || status === 403) return 'auth'
  if (status && status >= 500) return 'server'

  if (import.meta.client && typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'offline'
  }

  const code = String(e.code || '')
  const msg = String(e.message || '')
  if (
    code === 'ECONNABORTED' ||
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    msg === 'Network Error'
  ) {
    if (import.meta.client && typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline'
    }
    return 'server'
  }

  return 'unknown'
}

export function isConnectivityError(reason: ConnectionErrorReason): boolean {
  return reason === 'offline' || reason === 'server'
}

export function connectionErrorTitle(reason: ConnectionErrorReason): string {
  if (reason === 'offline') return 'Internet aloqasi yo\'q'
  if (reason === 'server') return 'Server bilan aloqa uzildi'
  return 'Ulanish muammosi'
}

export function connectionErrorHint(reason: ConnectionErrorReason): string {
  if (reason === 'offline') {
    return 'Internetni tekshiring va qayta urinib ko\'ring.'
  }
  if (reason === 'server') {
    return 'Server vaqtincha javob bermayapti. Biroz kutib, qayta urinib ko\'ring.'
  }
  return 'Aloqa tiklanguncha kuting yoki qayta urinib ko\'ring.'
}
