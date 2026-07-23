import type { AxiosProgressEvent, Method } from "axios"
import { api } from "~/config/axios"
import { authCookieOptions } from "~/utils/authCookie"
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

export const useApi = async <T = any>(path: string, options: IOptions = {}) => {
  const config = useRuntimeConfig()
  const cookie = useCookie('auth_token', { ...authCookieOptions })
  const token = options.authToken || resolveAuthToken(cookie.value)

  const headers = { ...options.headers }

  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  // Cookie orqali eski token ketmasin — faqat Bearer
  // (withCredentials: true bo'lsa ham backend Bearer ni birinchi o'qiydi)

  if (import.meta.server) {
    const reqHeaders = useRequestHeaders(['cookie', 'authorization'])
    if (reqHeaders.cookie) {
      headers.cookie = reqHeaders.cookie
    }
    if (reqHeaders.authorization && !headers.authorization) {
      headers.authorization = reqHeaders.authorization
    }
  }

  const url = `${config.public.baseUrl}${path}`

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
