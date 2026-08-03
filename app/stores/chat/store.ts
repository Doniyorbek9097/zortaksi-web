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
    const isLoadingOlderMessages = ref(false)
    const isSending = ref(false)

    const total = ref(0)
    const page = ref(1)
    const totalPages = ref(1)
    const messagesPage = ref(1)
    const messagesTotalPages = ref(1)
    /** Chats ro'yxati scroll — profil/chatdan qaytganda tiklash */
    const chatsListScrollY = ref(0)

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
        isLoadingOlderMessages,
        isSending,
        total,
        page,
        totalPages,
        messagesPage,
        messagesTotalPages,
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
        isLoadingOlderMessages,
        isSending,
        total,
        page,
        totalPages,
        messagesPage,
        messagesTotalPages,
        chatsListScrollY,
        hasMore: list.hasMore,
        hasMoreMessages: list.hasMoreMessages,
        unreadTotal,
        connectionStatus,
        connectionReason,
        peerPresence,
        peerTypingChatId,
        isPeerTyping: connection.isPeerTyping,
        connect: connection.connect,
        primeFromChat: connection.primeFromChat,
        fetchPresence: connection.fetchPresence,
        resetConnection: connection.resetConnection,
        fetchChats: list.fetchChats,
        loadMoreChats: list.loadMoreChats,
        fetchMessages: list.fetchMessages,
        hydrateMessagesFromCache: list.hydrateMessagesFromCache,
        persistCurrentMessagesCache: list.persistCurrentMessagesCache,
        loadOlderMessages: list.loadOlderMessages,
        resetMessagesPagination: list.resetMessagesPagination,
        sendMessage: messaging.sendMessage,
        sendVoice: messaging.sendVoice,
        sendPhoto: messaging.sendPhoto,
        sendLocation: messaging.sendLocation,
        startChatFromOrder: list.startChatFromOrder,
        startChatWithOrderOwner: list.startChatWithOrderOwner,
        startChatWithUser: list.startChatWithUser,
        startChatWithBookedDriver: list.startChatWithBookedDriver,
        markRead: list.markRead,
        markAllRead: list.markAllRead,
        deleteChats: list.deleteChats,
        deleteMessages: list.deleteMessages,
        onNewMessage: socket.onNewMessage,
        onMessageUpdate: socket.onMessageUpdate,
        onChatUpdate: socket.onChatUpdate,
        onMessagesRead: socket.onMessagesRead,
        onMessagesDeleted: socket.onMessagesDeleted,
        onChatConnect: connection.onChatConnect,
        onPeerPresence: connection.onPeerPresence,
        onPeerTyping: connection.onPeerTyping,
    }
})
