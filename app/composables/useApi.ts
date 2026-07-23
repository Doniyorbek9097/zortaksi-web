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
}

export const useApi = async <T = any>(path: string, options: IOptions = {}) => {
  const config = useRuntimeConfig()
  const cookie = useCookie('auth_token', { ...authCookieOptions })
  const token = resolveAuthToken(cookie.value)

  // Merge headers
  const headers = { ...options.headers }

  // localStorage token ustuvor (mobil account switch)
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  // SSR vaqtida brauzer cookie va authorization ma'lumotlarini backendga yuborish
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

  // FormData bo'lsa Content-Type'ni qo'ymaymiz — axios o'zi boundary qo'yadi
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
