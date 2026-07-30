import type { AxiosProgressEvent, Method } from "axios"
import { api } from "~/config/axios"
import { getAuthCookieOptions } from "~/utils/authCookie"
import { resolveAuthToken } from "~/utils/activeAccount"

interface IOptions {
  method?: Method
  body?: any
  headers?: any
  params?: any
  timeout?: number
  onUploadProgress?: (e: AxiosProgressEvent) => void
  /** Account switch: aniq token (cookie poygasiga qarshi) */
  authToken?: string | null
}

/** SSR da relative /api/v1 → to'g'ridan backend; brauzerda Nuxt proxy */
function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = baseUrl.replace(/\/$/, '')

  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}${normalizedPath}`
  }

  if (import.meta.client) {
    return `${base}${normalizedPath}`
  }

  const direct =
    process.env.NUXT_DEV_API_BACKEND ||
    process.env.NUXT_PUBLIC_DEV_API_BACKEND ||
    'http://127.0.0.1:5000'
  const backendRoot = direct.replace(/\/$/, '').replace(/\/api\/v1$/, '')
  return `${backendRoot}/api/v1${normalizedPath}`
}

export const useApi = async <T = any>(path: string, options: IOptions = {}) => {
  const config = useRuntimeConfig()
  const cookie = useCookie('auth_token', { ...getAuthCookieOptions() })
  // SSR: faqat shu request cookie / explicit authToken (global memory yo'q)
  const token = options.authToken || resolveAuthToken(cookie.value)

  const headers = { ...options.headers }

  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  if (import.meta.server) {
    const reqHeaders = useRequestHeaders(['cookie', 'authorization'])
    // Bearer allaqachon shu so'rov cookie sidan — boshqa request auth headerini qo'shma
    if (reqHeaders.cookie) {
      headers.cookie = reqHeaders.cookie
    }
    // Faqat o'zimizda Bearer bo'lmasa — va bu so'rovning authorization i
    if (!headers.authorization && reqHeaders.authorization) {
      headers.authorization = reqHeaders.authorization
    }
  }

  const url = buildApiUrl(config.public.baseUrl, path)

  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    delete headers['Content-Type']
    delete headers['content-type']
  }

  const res = await api.request<T>({
    url,
    method: options.method || "GET",
    data: options.body,
    headers,
    params: options.params,
    timeout: options.timeout,
    onUploadProgress: options.onUploadProgress,
  })
  return res.data
}
