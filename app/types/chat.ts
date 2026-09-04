export interface IChatPeer {
    userId: string
    firstName?: string
    lastName?: string
    username?: string
    phone?: string
    avatar?: string
    isBot: boolean
    accessHash?: string
    fromPeerId?: string
    fromMsgId?: number
    fromGroupUsername?: string
    fromGroupTitle?: string
    fromPeerAccessHash?: string
    /** Oldin muvaffaqiyatli bog'langan userbot — loadingsiz ochish uchun */
    viaUserbotId?: string
}

export type ChatKind = 'normal' | 'support' | 'direct'

export interface IChat {
    _id: string
    ownerId: string
    peer: IChatPeer
    orderId?: string
    /** Order e'lon matni — chat yuqorisida ko'rsatiladi */
    orderText?: string
    /** support — admin↔haydovchi; direct — haydovchi↔haydovchi */
    kind?: ChatKind
    /** Ro'yxatdan o'tgan peer — faqat ilova ichida (Telegramga ketmaydi) */
    inAppOnly?: boolean
    lastMessage: string
    lastMessageAt: string | Date
    unreadCount: number
    createdAt: string | Date
    updatedAt: string | Date
}

export type ChatDirection = 'in' | 'out'
export type ChatMessageType =
    | 'text'
    | 'photo'
    | 'video'
    | 'voice'
    | 'document'
    | 'sticker'
    | 'location'
export type ChatMessageStatus = 'sending' | 'sent' | 'failed' | 'read'
export type ChatTextFormat = 'plain' | 'html'

export interface IChatMessage {
    _id: string
    chatId: string
    ownerId: string
    direction: ChatDirection
    text: string
    textFormat?: ChatTextFormat
    type: ChatMessageType
    status: ChatMessageStatus
    /** failed holatida — foydalanuvchiga tushunarli xato sababi (SPAM/blok va h.k.) */
    error?: string
    /** O'z hisob spam/blok — proksi ruxsati kerak */
    proxyRequired?: boolean
    tgMessageId?: number
    mediaPath?: string
    mimeType?: string
    duration?: number
    fileSize?: number
    locationLat?: number
    locationLng?: number
    locationTitle?: string
    replyToMessageId?: string
    replyTo?: {
        messageId?: string
        text?: string
        type?: ChatMessageType
        direction?: ChatDirection
    }
    date: string | Date
    createdAt: string | Date
    updatedAt: string | Date
}
