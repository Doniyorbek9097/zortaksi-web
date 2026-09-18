export type TopToastVariant = 'info' | 'success' | 'warning' | 'error'

export type TopToastPayload = {
  message: string
  variant?: TopToastVariant
  duration?: number
}

let hideTimer: ReturnType<typeof setTimeout> | null = null

export function useTopToast() {
  const toast = useState<TopToastPayload | null>('zt-top-toast', () => null)

  const hide = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    toast.value = null
  }

  const show = (payload: TopToastPayload | string) => {
    const next: TopToastPayload =
      typeof payload === 'string'
        ? { message: payload }
        : payload

    toast.value = {
      variant: 'info',
      duration: 3200,
      ...next,
    }

    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      toast.value = null
      hideTimer = null
    }, next.duration ?? 3200)
  }

  return { toast, show, hide }
}
