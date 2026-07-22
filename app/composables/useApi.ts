import type { AxiosProgressEvent, Method } from "axios"
import { api } from "~/config/axios"

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
  const token = useCookie('auth_token', {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    watch: true,
    sameSite: 'lax'
  })

  // Merge headers
  const headers = { ...options.headers }

  // Tokenni Authorization header orqali yuborish (ishonchli usul)
  if (token.value) {
    headers.authorization = `Bearer ${token.value}`
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
