import type { IUser } from '~/types'
import {
  patchUserFromOrderTakeAccess,
  resolveOrderTakeAccessRedirect,
} from '~/utils/orderTakeAccess'
import { isAdminUser } from '~/utils/userRole'

type OrderTakeAccessApiResponse = {
  allowed?: boolean
  code?: 'NOT_VERIFIED' | 'TARIFF_INACTIVE'
  active?: boolean
  verified?: boolean
  tariffExpireAt?: string | Date | null
}

/** Mijozni olish — server tekshiruvi + cache yangilash */
export function useOrderTakeAccess() {
  const authStore = useAuthStore()

  const redirectBlocked = async (fullPath: string) => {
    const blocked = resolveOrderTakeAccessRedirect({
      user: authStore.user,
      fullPath,
    })
    if (!blocked) return false
    await navigateTo(blocked, { replace: true })
    return true
  }

  const ensureAccess = async (fullPath: string): Promise<boolean> => {
    if (isAdminUser(authStore.user)) return true

    try {
      const res = (await useApi('/me/order-take-access', {
        timeout: 10_000,
      })) as OrderTakeAccessApiResponse

      if (res?.allowed) {
        if (authStore.user) {
          authStore.user = patchUserFromOrderTakeAccess(authStore.user, {
            active: res.active,
            verified: res.verified,
            tariffExpireAt: res.tariffExpireAt,
          })
        }
        return true
      }

      if (res?.code === 'NOT_VERIFIED') {
        await navigateTo(
          { path: '/auth', query: { next: fullPath } },
          { replace: true },
        )
        return false
      }

      await navigateTo(
        { path: '/driver/payment', query: { tab: 'tariff', next: fullPath } },
        { replace: true },
      )
      return false
    } catch (err) {
      console.error('order-take-access error:', err)
      return !(await redirectBlocked(fullPath))
    }
  }

  const redirectIfBlocked = async (fullPath: string): Promise<boolean> => {
    if (isAdminUser(authStore.user)) return false
    try {
      await authStore.getMe()
    } catch {
      /* cache bilan davom */
    }
    return redirectBlocked(fullPath)
  }

  return { ensureAccess, redirectIfBlocked }
}
