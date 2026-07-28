import { defineStore } from 'pinia'
import type { IChat, IChatMessage } from '~/types'
import { createConnectionActions } from './actions/connection'
import { createListActions } from './actions/list'
import { createLocalStateActions } from './actions/local-state'
import { createMessagingActions } from './actions/messaging'
import { createSocketActions } from './actions/socket'
import type { ChatStoreRefs, ConnStatus, FetchChatsParams, PeerPresence } from './types'

export type { FetchChatsParams }

/**
 * Chat Pinia store — holat shu yerda; amallar actions/ va helpers/ da.
 * Public API o'zgarmaydi: useChatStore + FetchChatsParams.
 */
export const useChatStore = defineStore('chat', () => {
    const chats = ref<IChat[]>([])
    const currentChat = ref<IChat | null>(null)
    const messages = ref<IChatMessage[]>([])

    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const isLoadingMessages = ref(false)
    const isSending = ref(false)

    const total = ref(0)
    const page = ref(1)
    const totalPages = ref(1)

    /** Tab badge — barcha chatlardagi o'qilmagan xabarlar yig'indisi */
    const unreadTotal = computed(() =>
        chats.value.reduce((sum, c) => sum + (Number(c.unreadCount) || 0), 0),
    )

    const connectionStatus = ref<ConnStatus>('idle')
    const connectionReason = ref('')
    const peerPresence = ref<PeerPresence | null>(null)
    const peerTypingChatId = ref<string | null>(null)

    const refs: ChatStoreRefs = {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        isSending,
        total,
        page,
        totalPages,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
    }

    const { patchChat, appendMessage } = createLocalStateActions(refs)
    const connection = createConnectionActions(refs)
    const list = createListActions(refs, patchChat)
    const messaging = createMessagingActions(refs, { patchChat, appendMessage })
    const socket = createSocketActions(refs, {
        appendMessage,
        handoffMediaTemp: messaging.handoffMediaTemp,
        markRead: list.markRead,
        clearTypingForChat: connection.clearTypingForChat,
    })

    return {
        chats,
        currentChat,
        messages,
        isLoading,
        isLoadingMore,
        isLoadingMessages,
        isSending,
        total,
        page,
        totalPages,
        hasMore: list.hasMore,
        unreadTotal,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
        isPeerTyping: connection.isPeerTyping,
        connect: connection.connect,
        fetchPresence: connection.fetchPresence,
        resetConnection: connection.resetConnection,
        fetchChats: list.fetchChats,
        loadMoreChats: list.loadMoreChats,
        fetchMessages: list.fetchMessages,
        sendMessage: messaging.sendMessage,
        sendVoice: messaging.sendVoice,
        sendPhoto: messaging.sendPhoto,
        sendLocation: messaging.sendLocation,
        startChatFromOrder: list.startChatFromOrder,
        startChatWithOrderOwner: list.startChatWithOrderOwner,
        startChatWithUser: list.startChatWithUser,
        startChatWithBookedDriver: list.startChatWithBookedDriver,
        markRead: list.markRead,
        deleteChats: list.deleteChats,
        onNewMessage: socket.onNewMessage,
        onMessageUpdate: socket.onMessageUpdate,
        onChatUpdate: socket.onChatUpdate,
        onMessagesRead: socket.onMessagesRead,
        onPeerPresence: connection.onPeerPresence,
        onPeerTyping: connection.onPeerTyping,
    }
})
