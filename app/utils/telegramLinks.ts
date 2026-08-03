import { normalizePhoneDigits } from '~/utils/phone'

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

/** Guruhdagi buyurtma xabarini Telegramda ochish */
export function buildGroupViewUrl(input: {
    groupUsername?: string
    groupId?: string
    messageId?: number
}): string {
    const username = String(input.groupUsername || '')
        .trim()
        .replace(/^@/, '')
    const mid = Number(input.messageId || 0)
    if (username && mid) return `https://t.me/${username}/${mid}`

    const gid = String(input.groupId || '').trim()
    if (!gid || !mid) return ''

    const channelId = gid.replace(/^-100/, '')
    if (!/^\d+$/.test(channelId)) return ''
    return `https://t.me/c/${channelId}/${mid}`
}
