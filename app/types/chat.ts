export interface IChatPeer {
    userId: string
    firstName?: string
    lastName?: string
    username?: string
    phone?: string
    avatar?: string
    isBot: boolean
    accessHash?: string
    /** Oldin muvaffaqiyatli bog'langan userbot — loadingsiz ochish uchun */
    viaUserbotId?: string
}

export type ChatKind = 'normal' | 'support'

export interface IChat {
    _id: string
    ownerId: string
    peer: IChatPeer
    orderId?: string
    /** Order e'lon matni — chat yuqorisida ko'rsatiladi */
    orderText?: string
    /** support — admin ↔ haydovchi to'lov/yordam */
    kind?: ChatKind
    lastMessage: string
    lastMessageAt: string | Date
    unreadCount: number
    createdAt: string | Date
    updatedAt: string | Date
}

export type ChatDirection = 'in' | 'out'
export type ChatMessageType = 'text' | 'photo' | 'video' | 'voice' | 'document'
export type ChatMessageStatus = 'sending' | 'sent' | 'failed' | 'read'

export interface IChatMessage {
    _id: string
    chatId: string
    ownerId: string
    direction: ChatDirection
    text: string
    type: ChatMessageType
    status: ChatMessageStatus
    tgMessageId?: number
    mediaPath?: string
    mimeType?: string
    duration?: number
    fileSize?: number
    date: string | Date
    createdAt: string | Date
    updatedAt: string | Date
}
