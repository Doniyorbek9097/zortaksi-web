import { normalizePhoneDigits } from '~/utils/phone'

/** Telegram supergroup/kanal ID — t.me/c/... uchun */
export function normalizeTelegramChannelId(groupId?: string | null): string {
    const raw = String(groupId || '').trim().replace(/\D/g, '')
    if (!raw) return ''
    if (raw.startsWith('100') && raw.length > 10) return raw.slice(3)
    return raw
}

/** Telegram shaxsiy chat — faqat username yoki telefon */
export function buildTelegramContactUrl(input: {
    username?: string
    phone?: string
}): string {
    const uname = String(input.username || '').replace(/^@/, '').trim()
    if (uname) return `https://t.me/${uname}`

    const digits = normalizePhoneDigits(input.phone)
    if (digits) return `https://t.me/+${digits}`

    return ''
}

/** Guruhdagi buyurtma xabarini yoki guruhni Telegramda ochish */
export function buildGroupViewUrl(input: {
    groupUsername?: string
    groupId?: string
    messageId?: number
}): string {
    const username = String(input.groupUsername || '')
        .trim()
        .replace(/^@/, '')
    const mid = Number(input.messageId || 0)
    if (username) {
        if (mid > 0) return `https://t.me/${username}/${mid}`
        return `https://t.me/${username}`
    }

    const channelId = normalizeTelegramChannelId(input.groupId)
    if (!channelId) return ''
    if (mid > 0) return `https://t.me/c/${channelId}/${mid}`
    return `https://t.me/c/${channelId}`
}

/** TMA / WebView / brauzer — tashqi Telegram havolasini ochish */
export function openTelegramExternalUrl(url: string) {
    if (!url || !import.meta.client) return

    const tg = window.Telegram?.WebApp as { openLink?: (u: string) => void } | undefined
    if (tg?.openLink) {
        tg.openLink(url)
        return
    }

    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) window.location.assign(url)
}
