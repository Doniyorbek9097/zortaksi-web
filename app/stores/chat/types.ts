import type { Ref } from 'vue'
import type { IChat, IChatMessage } from '~/types'

/** Chatlar ro'yxatini yuklash parametrlari */
export interface FetchChatsParams {
    page?: number
    limit?: number
    search?: string
}

/**
 * Senderga ulanish holati:
 * connecting -> tekshirilmoqda (loading)
 * ready      -> 100% yozish mumkin
 * restricted -> spam/blok/maxfiylik (reason ko'rsatiladi)
 * unreachable-> umuman bog'lanib bo'lmaydi
 */
export type ConnStatus = 'idle' | 'connecting' | 'ready' | 'restricted' | 'unreachable'

/** Suhbatdosh onlayn / oxirgi kirish holati */
export interface PeerPresence {
    online: boolean
    label: string
    lastSeenAt?: string
    kind?: string
}

/** Store actionlari ulashadigan umumiy ref'lar */
export interface ChatStoreRefs {
    chats: Ref<IChat[]>
    currentChat: Ref<IChat | null>
    messages: Ref<IChatMessage[]>
    isLoading: Ref<boolean>
    isLoadingMore: Ref<boolean>
    isLoadingMessages: Ref<boolean>
    isSending: Ref<boolean>
    total: Ref<number>
    page: Ref<number>
    totalPages: Ref<number>
    connectionStatus: Ref<ConnStatus>
    connectionReason: Ref<string>
    peerPresence: Ref<PeerPresence | null>
    peerTypingChatId: Ref<string | null>
    messagesPage: Ref<number>
    messagesTotalPages: Ref<number>
    isLoadingOlderMessages: Ref<boolean>
    /** messages[] qaysi chatId ga tegishli */
    messagesChatId: Ref<string | null>
}
