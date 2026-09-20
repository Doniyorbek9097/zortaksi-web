import type { IChatMessage } from '~/types'

const PROXY_OFFER_MARKERS = ['proksi orqali', 'tinglovchi userbot']

/** Xato matni proksi taklifini bildiradimi? */
export function isProxyOfferError(error?: string | null): boolean {
    const e = String(error || '').toLowerCase()
    return PROXY_OFFER_MARKERS.some((m) => e.includes(m))
}

/** Failed xabar tagida proksi tugmasi kerakmi? */
export function messageNeedsProxyOffer(
    msg: Pick<IChatMessage, 'status' | 'proxyRequired' | 'error'>,
): boolean {
    if (msg.status !== 'failed') return false
    if (msg.proxyRequired) return true
    return isProxyOfferError(msg.error)
}
